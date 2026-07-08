import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { User } from 'src/users/schemas/user.schema';
import { loginDto } from './dto/sign-in.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signup(body: CreateUserDto): Promise<{ user: User; token: string }> {
    return await this.usersService.createUser(body);
  }

  async login(body: loginDto): Promise<any> {
    // for admin
    if (
      body.email === process.env.ADMIN_EMAIL &&
      body.password === process.env.ADMIN_PASSWORD
    ) {
      const payload = {
        email: process.env.ADMIN_EMAIL,
        role: 'admin',
      };

      return {
        token: await this.jwtService.signAsync(payload),
      };
    }
    // for user
    const user = await this.usersService.getUserByEmail(body.email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid Password');
    }

    const payload = { id: user._id, email: user.email, role: user.role };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
