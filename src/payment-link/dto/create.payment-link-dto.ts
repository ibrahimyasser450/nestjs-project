import {
  IsEmail,
  IsEnum,
  IsInt,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class CreatePaymentLinkDto {
  @IsPositive()
  @IsInt()
  amount: number;
  @IsEmail()
  @IsOptional()
  customerEmail: string;
  @IsEnum(['EGP', 'USD', 'EUR', 'GBP'], { message: 'Invalid currency' })
  @IsOptional()
  currency: string;
}
