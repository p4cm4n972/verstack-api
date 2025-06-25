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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';
import { CreateNewsDto } from './dto/create-news.dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto/update-news.dto';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}


  @Auth(AuthType.None)
  @Get('all')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    //  const { limit, offset } = paginationQuery;
    return this.newsService.findAll(paginationQuery);
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Roles(Role.Admin)
  @Post()
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }
  

  @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }

  @Auth(AuthType.None)
  @Post(':id/recommend')
  async recommend(@Param('id') id: string, @Body('userId') userId: string) {
    return this.newsService.recommend(id, userId);
  }

  @Auth(AuthType.None)
  @Post(':id/unrecommend')
  async unrecommend(@Param('id') id: string, @Body('userId') userId: string) {
    return this.newsService.unrecommend(id, userId);
  }
}
