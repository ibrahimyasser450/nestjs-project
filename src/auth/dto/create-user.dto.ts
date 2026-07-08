import {
  IsString,
  IsEmail,
  IsInt,
  Min,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt({ message: 'Age must be a number' })
  @Min(1)
  age?: number;
}
