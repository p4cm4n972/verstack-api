import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';
import { EventEntity } from '../events/entities/event.entity/event.entity';
import { News, Recommendation } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto/create-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<News>,
    @InjectModel(Recommendation.name) private readonly recommendationModel: Model<News>,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(EventEntity.name)
    private readonly eventModel: Model<EventEntity>,
  ) {}

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.newsModel.find().skip(offset).limit(limit).exec();
  }

  async findOne(id: string) {
    const news = await this.newsModel.findOne({ _id: id }).exec();
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

  /*async recommendNews(news: News) {
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
  }*/

    async recommendNews(news: News, userId: string) {
      const session = await this.connection.startSession();
      session.startTransaction();
    
      try {
        const alreadyRecommended = await this.recommendationModel.findOne({
          userId,
          articleId: news._id
        }).session(session);
    
        if (alreadyRecommended) {
          throw new ConflictException('Déjà recommandé');
        }
    
        news.recommendations++;
    
        const recommendEvent = new this.eventModel({
          name: 'recommend_news',
          type: 'news',
          payload: { newsId: news._id },
        });
    
        const recommendation = new this.recommendationModel({
          userId,
          articleId: news._id
        });
    
        await recommendEvent.save({ session });
        await recommendation.save({ session });
        await news.save({ session });
    
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
    

  async incrementLikes(id: string, userId: string): Promise<News> {
    const article = await this.newsModel.findById(id);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
  
    if (article.likedBy.includes(userId)) {
      throw new ConflictException('You have already liked this article');
    }
  
    article.recommendations = (article.recommendations || 0) + 1;
    article.likedBy.push(userId);
    return article.save();
  }
  
  async recommend(newsId: string, userId: string) {
    const news = await this.newsModel.findById(newsId);
    if (!news) throw new NotFoundException('News not found');
    if (news.likedBy.includes(userId)) throw new BadRequestException('Already recommended');

    news.likedBy.push(userId);
    news.recommendations = news.likedBy.length;
    await news.save();
    return news;
  }

  async unrecommend(newsId: string, userId: string) {
    const news = await this.newsModel.findById(newsId);
    if (!news) throw new NotFoundException('News not found');
    if (!news.likedBy.includes(userId)) throw new BadRequestException('Not recommended yet');

    news.likedBy = news.likedBy.filter(id => id !== userId);
    news.recommendations = news.likedBy.length;
    await news.save();
    return news;
  }
}
