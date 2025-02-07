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
  findOne(@Param('id') id: string): string {
    return `This action returns  ${id}`;
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body): string {
    return `This action updates ${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return `This action removes ${id}`;
  }
}
