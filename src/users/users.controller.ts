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

@Controller('users')
export class UsersController {
constructor(private readonly usersService: UsersService) {}

  @Get('all')
  findAll(@Query() paginationQuery) {
    const { limit, offset } = paginationQuery;
    return this.usersService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: any) {
    console.log(id)
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: any, @Body() body) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: any) {
    return this.usersService.remove(id);
  }
}
