import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { loginDto } from 'src/auth/dto/sign-in.dto';
import { User } from 'src/users/schemas/user.schema';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signup(
    @Body() body: CreateUserDto,
  ): Promise<{ user: User; token: string }> {
    return await this.authService.signup(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: loginDto): Promise<any> {
    return await this.authService.login(body);
  }
}
