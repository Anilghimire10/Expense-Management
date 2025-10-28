import dotenv from 'dotenv';
import { SendMailClient, SendMailResponse } from 'zeptomail';
import { ApiError } from './apiError';

dotenv.config();

const url = 'https://api.zeptomail.com/';
const token = process.env.ZEPTO_API_TOKEN as string;

if (!token) {
  throw new Error('ZEPTO_API_TOKEN is not defined in environment variables.');
}

const client = new SendMailClient({ url, token });

interface Attachment {
  name: string;
  content: string;
  mime_type?: string;
}

interface SendMailOptions {
  recipientEmail: string;
  subject?: string;
  emailBody?: string;
  attachments?: Attachment[];
}

export const sendMail = async ({
  recipientEmail,
  subject,
  emailBody,
  attachments,
}: SendMailOptions): Promise<SendMailResponse> => {
  try {
    const messageConfigurations = {
      from: {
        address: process.env.EMAIL_FROM as string,
        name: process.env.EMAIL_FROM_NAME as string,
      },
      to: [
        {
          email_address: {
            address: recipientEmail,
            name: recipientEmail,
          },
        },
      ],
      subject: subject || 'Untitled',
      htmlbody: emailBody || 'TemplateNotFound',
      attachments: attachments,
    };

    const response = await client.sendMail(messageConfigurations);
    return response;
  } catch (err: any) {
    throw new ApiError(err.message, err.statusCode || 500);
  }
};
