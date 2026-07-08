import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PaymentLink extends Document {
  @Prop({ required: true })
  amount: number;
  @Prop({ required: true })
  customerEmail: string;
  @Prop({ required: true, enum: ['EGP', 'USD', 'EUR', 'GBP'], default: 'EGP' })
  currency: string;
  @Prop({})
  link?: string;
  @Prop({ required: true, ref: 'User', type: Types.ObjectId })
  createdBy: Types.ObjectId;
  @Prop({
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'paid' | 'failed';
  @Prop({ required: false })
  gatewayOrderId?: string;
  @Prop({ required: false, type: Object })
  request?: object;
  @Prop({ required: false, type: Object })
  response?: object;
}

export const PaymentLinkSchema = SchemaFactory.createForClass(PaymentLink);
