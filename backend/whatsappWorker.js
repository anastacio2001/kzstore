const { whatsappQueue } = require('./queue');
const { sendWhatsAppTemplate } = require('./whatsapp');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('🚀 WhatsApp Worker initializing...');

whatsappQueue.process(async (job) => {
  const { to, body, contentSid, contentVariables, meta } = job.data;
  try {
    const result = await sendWhatsAppTemplate({ to, body, contentSid, contentVariables });
    // Update DB message status
    try {
      if (result && result.sid) {
        await prisma.whatsAppMessage.create({
          data: {
            message_sid: result.sid,
            to,
            from: process.env.TWILIO_WHATSAPP_NUMBER || '',
            template_sid: contentSid || null,
            body: body || (contentVariables && JSON.stringify(contentVariables)) || null,
            status: result.status || 'sent',
            metadata: { raw: result }
          }
        });
      }
    } catch (dbErr) {
      console.error('Error writing WhatsApp message log to DB', dbErr);
    }
    return Promise.resolve(result || {});
  } catch (err) {
    console.error('WhatsApp Worker send error', err);
    return Promise.reject(err);
  }
});

whatsappQueue.on('completed', (job, res) => {
  console.log('✅ WhatsApp job completed:', job.id);
});

whatsappQueue.on('failed', (job, err) => {
  console.error('❌ WhatsApp job failed:', job.id, err);
});
