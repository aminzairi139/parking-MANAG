const twilio = require("twilio");

exports.sendSms = async (to, message) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log("Twilio not configured. SMS simulation:", to, message);
    return { success: true, simulated: true };
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const result = await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to });
  return { success: true, sid: result.sid };
};
