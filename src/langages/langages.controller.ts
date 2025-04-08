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
import { LangagesService } from './langages.service';
import { CreateLangageDto } from './dto/create-langage.dto/create-langage.dto';
import { UpdateLangageDto } from './dto/update-langage.dto/update-langage.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

@Controller('api/langages')
export class LangagesController {
  constructor(private readonly langagesService: LangagesService) {}

  @Auth(AuthType.None)
  @Get('all')
  findAll(@ActiveUser() user: ActiveUserData, @Query() paginationQuery: PaginationQueryDto) {
    console.log('user', user);
     //  const { limit, offset } = paginationQuery;
      return this.langagesService.findAll(paginationQuery);
    }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.langagesService.findOne(id);
  }

  @Post()
  create(@Body() createLangageDto: CreateLangageDto) {
    return this.langagesService.create(createLangageDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLangageDto: UpdateLangageDto) {
    return this.langagesService.update(id, updateLangageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.langagesService.remove(id);
  }
}
