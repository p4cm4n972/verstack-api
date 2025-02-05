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

@Controller('users')
export class UsersController {
  @Get('all')
  findAll(@Query() paginationQuery): string {
    const { limit, offset } = paginationQuery;
    return `This action returns all. Limit: ${limit}, Offset: ${offset}`;
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `This action returns  ${id}`;
  }

  @Post()
  create(@Body() body): string {
    return body;
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
