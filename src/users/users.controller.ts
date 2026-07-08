import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  HttpStatus,
  Param,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../auth/dto/udapte-user.dto';
import { User } from './schemas/user.schema';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.getAllUsers();
  }

  @Get(':id')
  getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  async updateUserById(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.updateUserById(id, body);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id/delete')
  async deleteUserById(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.deleteUserById(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
