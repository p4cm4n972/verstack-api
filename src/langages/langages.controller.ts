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
import { Langage } from './entities/langage.entity';
import { CreateLangageDto } from './dto/create-langage.dto/create-langage.dto';
import { UpdateLangageDto } from './dto/update-langage.dto/update-langage.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';

@Controller('langages')
export class LangagesController {
  constructor(private readonly langagesService: LangagesService) {}

  @Get('all')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
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
