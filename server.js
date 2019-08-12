/**
 * Copyright 2019 Artificial Solutions. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const http = require('http');
const express = require('express');
const qs = require('querystring');
const TIE = require('@artificialsolutions/tie-api-client');
const dotenv = require('dotenv');
const nexmoWhatsAppRequest = require('request')

dotenv.config();

const {
  TENEO_ENGINE_URL,
  NEXMO_MESSAGE_URL,
  NEXMO_JWT,
  PORT
} = process.env;
const port = PORT || 1337;
const teneoApi = TIE.init(TENEO_ENGINE_URL);

// initialise session handler, to store mapping between twillio CallSid and engine session id
const sessionHandler = SessionHandler();

// initialize an Express application
const app = express();
const router = express.Router()

// Tell express to use this router with /api before.
app.use("/", router);

// twilio message comes in
router.post("/", handleNexmoWhatsAppMessage(sessionHandler));

// handle incoming twilio message
function handleNexmoWhatsAppMessage(sessionHandler) {

  return (req, res) => {

    let body = '';
    req.on('data', function (data) {
      body += data;
    });

    req.on('end', async function () {

		var incomingMessage = JSON.parse(body);

		if (incomingMessage.from.type == "whatsapp") {

			const callingPhoneNumber = incomingMessage.from.number;
			const input = incomingMessage.message.content.text
			const whatsAppNumber = incomingMessage.to.number;

			console.log("Message from " + callingPhoneNumber + " was: " + input);

			// Check if we have stored an engine sessionid for this caller
			const teneoSessionId = sessionHandler.getSession(callingPhoneNumber);

			// Get user's text message
			const teneoResponse = await teneoApi.sendInput(teneoSessionId, { 'text': input, 'channel': 'nexmo-whatsapp' });

			// Stored engine sessionid for this caller
			sessionHandler.setSession(callingPhoneNumber, teneoResponse.sessionId);

			const whatsAppMessage = {};
			whatsAppMessage['from'] = {};
			whatsAppMessage['to'] = {};
			whatsAppMessage['message'] = {};

			const from = {
				type:"whatsapp",
				number: whatsAppNumber
			};
			const to = {
				type:"whatsapp",
				number: callingPhoneNumber
			};
			const contentBody = {
				type:"text",
				text:teneoResponse.output.text
			};

			whatsAppMessage['from'] = from;
			whatsAppMessage['to'] = to;
			const content = {};
			content['content'] = contentBody;
			whatsAppMessage['message'] = content;

			// Send text response to user via Nexmo WhatsApp
			nexmoWhatsAppRequest.post(
				{
					url:NEXMO_MESSAGE_URL,
					headers:
					{
						'Authorization':'Bearer ' + NEXMO_JWT,
						'Content-Type':'application/json',
						'Accept':'application/json'
					},
					method:'POST',
					json: true,
					body: whatsAppMessage
				}, (error, response, body) => {
					if (error) {
						console.error(error)
						return
					}
					console.log(`Status code from Nexmo WhatsApp Send: ${response.statusCode}`)
				}
			)
		}

		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end('');

    });

  }

}

/***
 * SESSION HANDLER
 ***/

function SessionHandler() {

  // Map the Nexmo Phone Number to the Teneo Engine Session ID.
  // This code keeps the map in memory, which is ok for demo purposes
  // For production usage it is advised to make use of more resilient storage mechanisms like redis

  const sessionMap = new Map();

  return {
    getSession: (userId) => {
      if (sessionMap.size > 0) {
        return sessionMap.get(userId);
      }
      else {
        return "";
      }
    },
    setSession: (userId, sessionId) => {
      sessionMap.set(userId, sessionId)
    }
  };
}

// start the express application
http.createServer(app).listen(port, () => {
  console.log(`Listening on port: ${port}`);
});