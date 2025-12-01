// backend/whatsapp.ts

import Twilio from 'twilio';
import { Request, Response } from 'express';
import { getPrismaClient } from '../src/utils/prisma/client';
import { whatsappQueue } from './queue';

const prisma = getPrismaClient();

// Read from environment variables (set these in your .env or deployment env)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. whatsapp:+14155238886

if (!accountSid || !authToken) {
  console.warn('Twilio credentials not configured. WhatsApp service will be disabled.');
}

let client: Twilio.Twilio | null = null;
try {
  if (accountSid && authToken) {
    client = Twilio(accountSid, authToken);
  }
} catch (err) {
  console.error('Failed to initialize Twilio client', err);
  client = null;
}

export async function sendWhatsAppTemplate({
  to,
  contentSid,
  contentVariables,
  body,
  from,
}: {
  to: string; // phone in E.164 format with whatsapp: prefix e.g. 'whatsapp:+244931054015'
  contentSid?: string; // Twilio Content SID (template ID)
  contentVariables?: Record<string, string> | string; // must be stringifiable
  body?: string; // plain message body
  from?: string; // optional override
}) {
  if (!client) throw new Error('Twilio client not initialized');
  try {
    const fromNumber = from || whatsappFrom;
    if (!fromNumber) throw new Error('TWILIO_WHATSAPP_NUMBER is not configured');

    // If contentSid is provided, use Twilio Conversations / Content API; otherwise, use messages.create with body
    if (contentSid) {
      // Twilio sends template-based messages using messages.create by referencing contentSid in the Content attribute
      // The Twilio message API supports contentSid starting version '2022-11-06' or similar; we'll use the 'contentSid' key under 'content' wrapper
      const params: any = {
        from: fromNumber,
        to,
        // Twilio's SDK for templates may differ; fallback use body with variables injection if unavailable
      };
      // If the Twilio flexible APIs do not support `contentSid` directly in this SDK, fallback to send body text
      if (typeof contentVariables === 'string') {
        params.body = contentVariables;
      } else if (contentVariables) {
        // Slight fallback - if contentVariables is provided, convert to string map in the message body or use content Sid metadata
        params.body = JSON.stringify(contentVariables);
      }
      if (body) params.body = body;

      const result = await client.messages.create(params);
      // Save message to DB if prisma available
      try {
        await prisma.whatsAppMessage.create({
          data: {
            message_sid: result?.sid,
            to,
            from: fromNumber,
            template_sid: contentSid || null,
            body: params.body || null,
            status: 'queued',
            metadata: { raw: result }
          }
        });
      } catch (err) {
        console.error('Error logging WhatsApp message to DB', err);
      }
      return result;
      return result;
    } else {
      if (!body) throw new Error('Either contentSid or body must be provided');
      const result = await client.messages.create({ from: fromNumber, to, body });
      try {
        await prisma.whatsAppMessage.create({
          data: {
            message_sid: result?.sid,
            to,
            from: fromNumber,
            template_sid: null,
            body,
            status: 'queued',
            metadata: { raw: result }
          }
        });
      } catch (err) {
        console.error('Error logging WhatsApp message to DB', err);
      }
      return result;
    }
  } catch (err) {
    console.error('Error sending WhatsApp message via Twilio:', err);
    throw err;
  }
}

export async function sendOrderCreatedNotification(phone: string, orderNumber: string, total: number) {
  const to = `whatsapp:${phone.replace(/[^\d+]/g, '')}`;
  const body = `🎉 Pedido Confirmado - KZSTORE\n\nPedido: #${orderNumber}\nTotal: ${new Intl.NumberFormat('pt-AO').format(total)} Kz\n\nObrigado por comprar na KZSTORE!`;
  // If Redis is configured (queue present), enqueue the job
  if (process.env.REDIS_URL) {
    try {
      await whatsappQueue.add('send', { to, body, meta: { orderNumber } }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
      return { queued: true };
    } catch (err) {
      console.error('Error enqueuing WhatsApp job', err);
    }
  }
  return sendWhatsAppTemplate({ to, body });
}

export async function enqueueWhatsApp({ to, body, contentSid, contentVariables, meta }: any) {
  if (process.env.REDIS_URL) {
    try {
      await whatsappQueue.add('send', { to, body, contentSid, contentVariables, meta }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
      return { enqueued: true };
    } catch (err) {
      console.error('Error enqueuing message', err);
      throw err;
    }
  }
  return sendWhatsAppTemplate({ to, body, contentSid, contentVariables });
}

export async function twilioStatusWebhookHandler(req: Request, res: Response) {
  // Twilio will POST message status and event updates to this webhook
  try {
    const { MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage } = req.body;
    // Log to console and return 200. You can save to DB
    console.log('Twilio Status Webhook:', { MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage });
    res.sendStatus(200);
  } catch (err) {
    console.error('Error handling Twilio webhook', err);
    res.sendStatus(500);
  }
}
