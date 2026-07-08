/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { PaymentLink } from 'src/payment-link/schemas/payment-link.schema';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, html: string): Promise<any> {
    const info = await this.mailerService.sendMail({
      to,
      subject,
      html,
    });
    return info;
  }

  // (3) when want to create paymentLink (before payment)
  async sendPaymentLinkEmail(paymentLink: PaymentLink): Promise<any> {
    const html = `
    <h1>Payment link</h1>
    <p>Amount: ${paymentLink.amount}</p>
    <p>Currency: ${paymentLink.currency}</p>
    <p>Payment link: <a href="${paymentLink.link}">${paymentLink.link}</a></p>`;
    return await this.sendEmail(
      paymentLink.customerEmail,
      'Payment link',
      html,
    );
  }

  // (6) when want to create paymentLink (after payment)
  async sendPaymentSuccessEmail(paymentLink: PaymentLink): Promise<any> {
    const html = `
    <h1>Payment success</h1>
    <p>Amount: ${paymentLink.amount}</p>
    <p>Currency: ${paymentLink.currency}</p>`;
    return await this.sendEmail(
      paymentLink.customerEmail,
      'Payment success',
      html,
    );
  }
}
