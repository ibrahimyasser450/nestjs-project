/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentLink } from './schemas/payment-link.schema';
import { Model } from 'mongoose';
import { CreatePaymentLinkDto } from './dto/create.payment-link-dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as queryString from 'qs';
import * as crypto from 'crypto';
import * as _ from 'lodash';

@Injectable()
export class PaymentLinkService {
  constructor(
    @InjectModel(PaymentLink.name)
    private readonly paymentLinkModel: Model<PaymentLink>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  // create payment link in DB (1) when want to create paymentLink (before payment)
  async createPaymentLink(
    body: CreatePaymentLinkDto,
    userId: string,
    email: string,
  ): Promise<PaymentLink> {
    const paymentLink = await this.paymentLinkModel.create({
      ...body,
      createdBy: userId,
      customerEmail: email,
    });
    return paymentLink;
  }

  // create payment session with kashier (2) when want to create paymentLink (before payment)
  async createPaymentSessionWithKashier(paymentLink: PaymentLink) {
    const url = 'https://test-api.kashier.io/v3/payment/sessions';
    const headers = {
      'Content-Type': 'application/json',
      'api-key': this.configService.get('KASHIER_API_KEY'),
      Authorization: this.configService.get('KASHIER_SECRET_KEY'),
    };
    const data = {
      amount: paymentLink.amount.toString(),
      currency: paymentLink.currency,
      order: paymentLink._id,
      merchantRedirect: 'https://example.com/redirect',
      display: 'en',
      allowedMethods: 'card,wallet',
      iframeBackgroundColor: '#FFFFFF',
      merchantId: this.configService.get('KASHIER_MERCHANT_ID'),
      brandColor: '#FF5733',
      defaultMethod: 'card',
      customer: {
        email: paymentLink.customerEmail,
        reference: paymentLink.createdBy,
      },
      saveCard: 'optional',
      interactionSource: 'ECOMMERCE',
      // serverWebhook => success-url will run when user paid (successful)
      // https://ulcerous-monet-overobedient.ngrok-free.dev (ngrok) => domain
      // payment-link => to come at this @Controller('payment-link')
      // webhook => endpint   @Post('webhook')
      serverWebhook:
        'https://ulcerous-monet-overobedient.ngrok-free.dev/payment-link/webhook',
    };

    const response = await firstValueFrom(
      this.httpService.post<{ sessionUrl: string; _id: string }>(url, data, {
        headers,
      }),
    );

    const RewResponse = {
      data: response.data,
      status: response.status,
    };

    // update the paymentLink in DB with the RewResponse
    const updatedPaymentLink = await this.paymentLinkModel.findByIdAndUpdate(
      paymentLink._id,
      {
        response: RewResponse,
        request: {
          url,
          headers,
          body: data,
        },
        link: response.data.sessionUrl, // session url
        gatewayOrderId: response.data._id, // session id
      },
      { returnDocument: 'after' }, // to return the new object after updated
    );

    return updatedPaymentLink;
  }

  // verify the signature from kashier at header (4) when want to create paymentLink (after payment)
  verifyKashierSignature(body: any, signature: string) {
    const sortedSignatureKeys = body.data.signatureKeys.sort();
    const APIKey = this.configService.get('KASHIER_API_KEY');
    if (!APIKey) throw new Error('KASHIER_API_KEY is not defined');
    const objectSignaturePayload = _.pick(body.data, sortedSignatureKeys);
    const signaturePayload = queryString.stringify(objectSignaturePayload);
    const computedSignature = crypto
      .createHmac('sha256', APIKey)
      .update(signaturePayload)
      .digest('hex');

    return computedSignature === signature;
  }

  // update the status of paymentLink in DB if the status success (5) when want to create paymentLink (after payment)
  async updatePaymentLinkAfterPayment(
    merchantOrderId: string,
    status: string,
  ): Promise<PaymentLink | null> {
    const paymentLink = await this.paymentLinkModel.findOneAndUpdate(
      { _id: merchantOrderId }, // merchantOrderId is payment link id
      { status: status },
      { returnDocument: 'after' },
    );

    return paymentLink;
  }
}
