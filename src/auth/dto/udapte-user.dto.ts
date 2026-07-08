import {
  IsString,
  IsEmail,
  IsInt,
  Min,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt({ message: 'Age must be a number' })
  @Min(1)
  age?: number;

  @IsOptional()
  @IsString()
  role?: string;
}
