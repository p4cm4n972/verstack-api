import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UsersService } from './users.service';
import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { Role } from './enums/role.enum';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  findAll(@Query() paginationQuery) {
    const { limit, offset } = paginationQuery;
    return this.usersService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: any) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.Admin)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.Admin, Role.Regular, Role.Subscriber)
  @Patch(':id')
  update(@Param('id') id: any, @Body() body) {
    return this.usersService.update(id, body);
  }
  
  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: any) {
    return this.usersService.remove(id);
  }
}
