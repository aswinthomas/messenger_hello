// Imports dependencies and set up http server
const axios = require("axios").default;

exports.handler = async function(event, context) {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));

  if (event.queryStringParameters) {
    // Register the webhook
    const queryParams = event.queryStringParameters;
    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = queryParams["hub.mode"];
    let token = queryParams["hub.verify_token"];
    let challenge = queryParams["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        console.log("WEBHOOK_VERIFIED");
        return {
          statusCode: 200,
          body: challenge,
        };
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        return {
          statusCode: 403,
        };
      }
    }
  } else {
    console.log("Got a non verification event\n");
    const body = JSON.parse(event.body);
    console.log(body.object);

    // Check the webhook event is from instagram
    if (body.object === "instagram") {

      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      let webhook_event = body.entry[0].messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);
      let recipient_psid = webhook_event.recipient.id;
      console.log("Recipient PSID: " + recipient_psid);

      let msg = "";
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        msg = handleMessage(sender_psid, recipient_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        msg = handlePostback(sender_psid, recipient_psid, webhook_event.postback);
      }

      const data = {};
      const config = {
        params: {
          recipient: {
            id: sender_psid,
          },
          messaging_type: 'RESPONSE',
          message: msg,
          access_token: process.env.PAGE_ACCESS_TOKEN
        }
      };
      const url = "https://graph.facebook.com/v16.0/" + process.env.PAGE_ID + "/messages";

      console.log("url: " + url + "\n params: " + JSON.stringify(config.params, null, 2) + "\n");
      await axios.post(url, data, config)
        .then(console.log("Successfully completed request\n"))
        .catch(err => console.log(err));

      // Return a '200 OK' response to all events
      console.log("INSTAGRAM EVENT_RECEIVED");
      return {
        statusCode: 200,
        body: "INSTAGRAM EVENT_RECEIVED",
      };
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      return {
        statusCode: 404,
      };
    }
  }

  return context.logStreamName;
};

// Handles messages events
function handleMessage(sender_psid, recipient_psid, received_message) {
  let msg;

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    msg = {
      text: `I hear you when you say "${received_message.text}" over messenger. Now send me an image.`,
    };
  } else if (received_message.attachments) {
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    msg = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Is this the right picture?",
            subtitle: "Tap a button to answer.",
            image_url: attachment_url,
            buttons: [{
                type: "postback",
                title: "Yes!",
                payload: "yes",
              },
              {
                type: "postback",
                title: "No!",
                payload: "no",
              },
            ],
          }, ],
        },
      },
    };
  }

  return msg;
  // Sends the response message
  //callSendAPI(sender_psid, recipient_psid, msg);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, recipient_psid, received_postback) {
  let msg;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === "yes") {
    msg = { text: "Thanks for confirming!" };
  } else if (payload === "no") {
    msg = { text: "I'm sorry its not the image you want. Please try again by sending us another message." };
  }
  return msg;
  // Send the message to acknowledge the postback
  //callSendAPI(sender_psid, recipient_psid, msg);
}