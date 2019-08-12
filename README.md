# nexmo-whatsapp-teneo
This node.js example connector allows you to make your Teneo bot available via Nexmo WhatsApp. The connector acts as middleware between Nexmo and Teneo and WhatsApp text communication with a Teneo bot, persisting state, conversational position etc. 

This connector works with the current Nexmo Sandbox.


## Prerequisites
### HTTPS
Nexmo API requires that the connector is available via https. Ngrok is recommended for this.

1. Make sure your connector is available via https. When running locally you can for example use [ngrok](https://ngrok.com) for this. Run the connector on port 1337 by default.
    ```
    ngrok http 1337
    ```
2. Running the command above will display a public https URL, copy it, we will use it as a `Webhook URL` for the following steps.

## Running the connector locally
### Nexmo Setup

1. In your sandbox you will need to application and click "Action".  Set the "Answer URL" to your ngrok HTTPS endpoint above

2. You will also require your JSON Web Token (JWT)

### Connector Setup Instructions

1. Download or clone the connector source code:
    ```
    git clone https://github.com/pomegran/nexmo-whatsapp-teneo.git
    ```
2. Install dependencies by running the following command in the folder where you stored the source:
    ```
    npm install
    ``` 
3. Start the connector with the following command (replacing the environment variables with the appropriate values):
    ```
    NEXMO_JWT=<Your_JSON_Web_Token> NEXMO_MESSAGE_URL=<Endpoint_for_sending_messages> TENEO_ENGINE_URL=<your_engine_url> PORT=<Port_to_run_this_application_on> node server.js
    ```

WhatsApp message your Nexmo number and speak to your bot!

## Running the connector on Heroku

Click the button below to deploy the connector to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg?classes=noborder)](https://heroku.com/deploy?template=https://github.com/pomegran/nexmo-whatsapp-teneo)

In the 'Config Vars' section, add the following:
* **NEXMO_JWT:** Your JSON Web Token
* **NEXMO_MESSAGE_URL:** Endpoint for sending messages
* **TENEO_ENGINE_URL:** The engine url
* **PORT:** Port to run the application on (defaults to 1337 if not specified)