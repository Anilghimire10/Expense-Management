declare module 'zeptomail' {
  export interface SendMailResponse {
    data?: any;
    message?: string;
  }

  export interface SendMailRequest {
    from: {
      address: string;
      name?: string;
    };
    to: Array<{
      email_address: {
        address: string;
        name?: string;
      };
    }>;
    subject: string;
    htmlbody: string;
    attachments?: Array<{
      name: string;
      content: string;
      mime_type?: string;
    }>;
  }

  export class SendMailClient {
    constructor(config: { url: string; token: string });
    sendMail(data: SendMailRequest): Promise<SendMailResponse>;
  }
}
