const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceID = process.env.TWILIO_SERVICE_ID;
const client = require('twilio')(accountSid, authToken);

export default function sendSMS(to: string, code: number) {
    console.log("from twilio service", to, code)
    return client.messages.create({
        to,
        from: "+1 928 832 7713", // or messagingServiceSid
        body: `Your verification code fr Quick Chat is ${code}`,
    })
    // .then(verification_check => console.log(verification_check.status));

}





