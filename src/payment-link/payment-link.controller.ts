import {
  Controller,
  Body,
  Post,
  Req,
  UseGuards,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentLinkService } from './payment-link.service';
import { CreatePaymentLinkDto } from './dto/create.payment-link-dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { MailService } from 'src/mail/mail.service';

@Controller('payment-link')
export class PaymentLinkController {
  constructor(
    private readonly paymentLinkService: PaymentLinkService,
    private readonly mailService: MailService,
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  async createPaymentLink(
    @Body() Body: CreatePaymentLinkDto,
    @Req() req: Request & { user: { id: string; email: string } },
  ) {
    // crete paymentLink in DB (1)
    const paymentLink = await this.paymentLinkService.createPaymentLink(
      Body,
      req.user.id,
      req.user.email,
    );
    // create payment session with kashier and update paymentLink in DB (2)
    const updatedPaymentLink =
      await this.paymentLinkService.createPaymentSessionWithKashier(
        paymentLink,
      );
    // send payment link email (3)
    if (updatedPaymentLink?.customerEmail) {
      await this.mailService.sendPaymentLinkEmail(updatedPaymentLink);
    }
    return updatedPaymentLink;
  }

  @Post('webhook')
  async webhook(
    @Body() body: any,
    @Headers('x-kashier-signature') signature: string,
  ) {
    // verify the signature from kashier at header
    const isSignatureValid = this.paymentLinkService.verifyKashierSignature(
      body,
      signature,
    );
    if (!isSignatureValid) throw new BadRequestException('Invalid signature');
    // update the status of paymentLink in DB if the status success after paid
    const status = body.data.status === 'SUCCESS' ? 'paid' : 'failed';
    const paymentLink =
      await this.paymentLinkService.updatePaymentLinkAfterPayment(
        body.data.merchantOrderId,
        status,
      );
    // send payment success email
    if (paymentLink?.customerEmail && paymentLink.status === 'paid') {
      await this.mailService.sendPaymentSuccessEmail(paymentLink);
    }

    return { message: 'Webhook received' };
  }
}
