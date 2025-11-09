import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';

interface SendEmailParams {
  type: 'new_ticket' | 'admin_response';
  ticketId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  ticketUrl: string;
}

export async function sendTicketEmail(params: SendEmailParams): Promise<boolean> {
  try {
    console.log('📧 Sending ticket email:', params.type);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn('⚠️ No session found, skipping email');
      return false;
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/send-ticket-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Email send failed:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}
