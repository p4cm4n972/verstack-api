import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { NewsService } from './news.service';
import { News, Recommendation } from './entities/news.entity';
import { EventEntity } from '../events/entities/event.entity/event.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

const MockNewsModel: any = jest.fn();
MockNewsModel.findOne = jest.fn();
MockNewsModel.findById = jest.fn();

const MockRecommendationModel: any = jest.fn();
const MockEventModel: any = jest.fn();

describe('NewsService', () => {
  let service: NewsService;
  let newsModel: typeof MockNewsModel;
  let recommendationModel: typeof MockRecommendationModel;
  let eventModel: typeof MockEventModel;
  let connection: any;

  beforeEach(async () => {
    newsModel = MockNewsModel as any;
    recommendationModel = MockRecommendationModel as any;
    eventModel = MockEventModel as any;
    connection = {
      startSession: jest.fn().mockResolvedValue({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: getModelToken(News.name), useValue: newsModel },
        { provide: getModelToken(Recommendation.name), useValue: recommendationModel },
        { provide: getConnectionToken(), useValue: connection },
        { provide: getModelToken(EventEntity.name), useValue: eventModel },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne should throw when not found', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    (newsModel.findOne as jest.Mock).mockReturnValue({ exec });

    await expect(service.findOne('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('incrementLikes should add like for new user', async () => {
    const article = { likedBy: [], recommendations: 0, save: jest.fn().mockResolvedValue({}) } as any;
    (newsModel.findById as jest.Mock).mockResolvedValue(article);

    const result = await service.incrementLikes('a', 'user');

    expect(newsModel.findById).toHaveBeenCalledWith('a');
    expect(article.recommendations).toBe(1);
    expect(article.likedBy).toContain('user');
    expect(article.save).toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('incrementLikes should throw when already liked', async () => {
    const article = { likedBy: ['user'], recommendations: 1 } as any;
    (newsModel.findById as jest.Mock).mockResolvedValue(article);

    await expect(service.incrementLikes('a', 'user')).rejects.toBeInstanceOf(ConflictException);
  });
});
