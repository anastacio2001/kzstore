/* test-twilio.js - simple CLI to test Twilio WhatsApp send

Usage: node backend/test-twilio.js <whatsapp-number>

Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
*/

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !from) {
  console.error('Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_NUMBER');
  process.exit(1);
}

const twilio = require('twilio')(accountSid, authToken);

const to = process.argv[2];
if (!to) {
  console.error('Usage: node backend/test-twilio.js whatsapp:+2449...');
  process.exit(1);
}

(async () => {
  try {
    const msg = await twilio.messages.create({ from, to, body: 'Test message from KZSTORE' });
    console.log('Message SID:', msg.sid);
  } catch (err) {
    console.error('Failed to send Twilio message', err);
    process.exit(2);
  }
})();
