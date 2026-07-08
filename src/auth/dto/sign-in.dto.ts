import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class loginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8)
  password: string;
}
