import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { Patch } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { User } from '@prisma/client';

import { getUser } from '../auth/decorators';
import { Jwt } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(Jwt)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  getMe(@getUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@Body() dto: EditUserDto, @getUser('id') userId: number) {
    return this.userService.editUser(userId, dto);
  }
}
