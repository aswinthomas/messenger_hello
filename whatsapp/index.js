
// Imports dependencies and set up http server
const axios = require("axios").default;

exports.handler = async function (event, context) {
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
    console.log("Got non verification event\n");
    const token = process.env.WHATSAPP_TOKEN;
    const body = JSON.parse(event.body);
    console.log(body.object);
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        let value = body.entry[0].changes[0].value;
        let phone_number_id = value.metadata.phone_number_id;
        let name = value.contacts[0].profile.name;
        let from = value.messages[0].from; // extract the phone number from the webhook payload
        let msg_body = value.messages[0].text.body; // extract the message text from the webhook payload
        const config = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          }
        };

        // Respond by echoing back the message sent to us
        const url = "https://graph.facebook.com/v16.0/" + phone_number_id + "/messages";
        const data = {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Hi "+name+" :)\n\nI hear you when you say " + msg_body + "\n\nHere is a cute doggo. Enjoy your day:)\n" },
        }
        console.log("url: "+url+"\n data: "+data.text.body+"\n");
        await axios.post(url, data, config)
          .then(console.log("Successfully completed request\n"))
          .catch(err => console.log(err));
        
        // get random dog pic
        let res = await axios.get('https://dog.ceo/api/breeds/image/random');
        console.log(res.data);
        let image_url = res.data.message;
        
        // send the pic
        const data2 = {
          messaging_product: "whatsapp",
          to: from,
          type: "image",
          image: {
            link: image_url
          }
        }
        await axios.post(url, data2, config)
          .then(console.log("Successfully completed request\n"))
          .catch(err => console.log(err));
          
        return {
          statusCode: 200,
        };
      }
    }
  }
  
  return context.logStreamName;
};