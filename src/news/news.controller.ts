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
import { NewsService } from './news.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { CreateLangageDto } from 'src/langages/dto/create-langage.dto/create-langage.dto';
import { UpdateLangageDto } from 'src/langages/dto/update-langage.dto/update-langage.dto';
import { CreateNewsDto } from './dto/create-news.dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto/update-news.dto';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';

@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}
  @Auth(AuthType.None)
  @Get('all')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    //  const { limit, offset } = paginationQuery;
    return this.newsService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Post()
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
