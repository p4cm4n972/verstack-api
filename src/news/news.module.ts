import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchema } from './entities/news.entity';
import {
  EventEntity,
  EventSchema,
} from 'src/events/entities/event.entity/event.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: News.name,
        schema: NewsSchema,
      },
      {
        name: EventEntity.name,
        schema: EventSchema,
      },
    ]),
  ],
  controllers: [NewsController],
  providers: [{ provide: NewsService, useClass: NewsService }],
})
export class NewsModule {}
