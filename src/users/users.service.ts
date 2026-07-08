import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from '../auth/dto/udapte-user.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async createUser(
    body: CreateUserDto,
  ): Promise<{ user: User; token: string }> {
    const user = await this.userModel.findOne({ email: body.email });
    if (user) {
      throw new BadRequestException(`User already exists`);
    }
    const hashPassword = await bcrypt.hash(body.password, 10);
    const newUser = await this.userModel.create({
      ...body,
      password: hashPassword,
      role: 'user',
    });

    const payload = {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      user: newUser,
      token,
    };
  }

  async updateUserById(id: string, body: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async deleteUserById(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email: email });
    return user || null;
  }
}
