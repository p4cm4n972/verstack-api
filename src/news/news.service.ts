import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { EventEntity } from 'src/events/entities/event.entity/event.entity';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto/create-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<News>,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventEntity>,
  ) {}

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.newsModel.find().skip(offset).limit(limit).exec();
  }

  findOne(id: string) {
    const news = this.newsModel.findOne({ _id: id }).exec();
    if (!news) {
      throw new NotFoundException(`Langage with id ${id} not found`);
    }
    return news;
  }

  create(createNewsDto: CreateNewsDto) {
    const news = new this.newsModel(createNewsDto);
    return news.save();
  }

  async update(id: string, updateNewsDto: any) {
    const existingNews = await this.newsModel
      .findOneAndUpdate({ _id: id }, { $set: updateNewsDto }, { new: true })
      .exec();
    if (!existingNews) {
      throw new NotFoundException(`News with id ${id} not found`);
    }
    return existingNews;
  }

  async remove(id: string) {
    const news = await this.findOne(id);
    if (!news) {
      throw new NotFoundException(`News with id ${id} not found`);
    }
    return this.newsModel.deleteOne({ _id: id }).exec();
  }

  async recommendNews(news: News) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      news.recommendations++;

      const recommendEvent = new this.eventModel({
        name: 'recommend_news',
        type: 'news',
        payload: { newsId: news._id },
      });
      await recommendEvent.save({ session });
      await news.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
}
