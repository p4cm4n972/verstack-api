import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { NewsService } from './news.service';
import { News, Recommendation } from './entities/news.entity';
import { EventEntity } from '../events/entities/event.entity/event.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

const MockNewsModel: any = jest.fn();
MockNewsModel.find = jest.fn();
MockNewsModel.findOne = jest.fn();
MockNewsModel.findOneAndUpdate = jest.fn();
MockNewsModel.deleteOne = jest.fn();
MockNewsModel.findById = jest.fn();

const MockRecommendationModel: any = jest.fn();
MockRecommendationModel.findOne = jest.fn();
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

  it('incrementLikes should throw when article not found', async () => {
    (newsModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.incrementLikes('x', 'u')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne should return a news', async () => {
    const exec = jest.fn().mockResolvedValue({ id: '1' });
    (newsModel.findOne as jest.Mock).mockReturnValue({ exec });

    const result = await service.findOne('1');

    expect(newsModel.findOne).toHaveBeenCalledWith({ _id: '1' });
    expect(result).toEqual({ id: '1' });
  });

  it('findAll should query with pagination', async () => {
    const exec = jest.fn().mockResolvedValue(['a']);
    const limit = jest.fn().mockReturnValue({ exec });
    const skip = jest.fn().mockReturnValue({ limit });
    (newsModel.find as jest.Mock).mockReturnValue({ skip });

    const result = await service.findAll({ limit: 1, offset: 2 });

    expect(newsModel.find).toHaveBeenCalled();
    expect(skip).toHaveBeenCalledWith(2);
    expect(limit).toHaveBeenCalledWith(1);
    expect(exec).toHaveBeenCalled();
    expect(result).toEqual(['a']);
  });

  it('create should save a news', async () => {
    const dto: any = { title: 't' };
    const save = jest.fn().mockResolvedValue(dto);
    newsModel.mockImplementation(() => ({ save }));

    const result = await service.create(dto);

    expect(save).toHaveBeenCalled();
    expect(result).toEqual(dto);
  });

  it('update should return updated news', async () => {
    const updated = { title: 'u' };
    const exec = jest.fn().mockResolvedValue(updated);
    (newsModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec });

    const result = await service.update('1', { title: 'u' });

    expect(newsModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '1' },
      { $set: { title: 'u' } },
      { new: true },
    );
    expect(result).toEqual(updated);
  });

  it('update should throw when news not found', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    (newsModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec });
    await expect(service.update('1', {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove should delete news', async () => {
    const news = { _id: '1', save: jest.fn() };
    const execFind = jest.fn().mockResolvedValue(news);
    (newsModel.findOne as jest.Mock).mockReturnValue({ exec: execFind });
    const execDelete = jest.fn().mockResolvedValue({ deleted: true });
    (newsModel.deleteOne as jest.Mock).mockReturnValue({ exec: execDelete });

    const result = await service.remove('1');

    expect(execDelete).toHaveBeenCalled();
    expect(result).toEqual({ deleted: true });
  });

  it('remove should throw when news not found', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    (newsModel.findOne as jest.Mock).mockReturnValue({ exec });

    await expect(service.remove('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('recommendNews should create event and recommendation', async () => {
    const news = { _id: '1', recommendations: 0, save: jest.fn() } as any;
    const eventSave = jest.fn();
    eventModel.mockImplementation(() => ({ save: eventSave }));
    const recSave = jest.fn();
    recommendationModel.mockImplementation(() => ({ save: recSave }));
    (recommendationModel.findOne as jest.Mock).mockReturnValue({ session: jest.fn().mockResolvedValue(null) });
    const session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    (connection.startSession as jest.Mock).mockResolvedValue(session);

    await service.recommendNews(news, 'u');

    expect(news.recommendations).toBe(1);
    expect(eventSave).toHaveBeenCalledWith({ session });
    expect(recSave).toHaveBeenCalledWith({ session });
    expect(news.save).toHaveBeenCalledWith({ session });
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it('recommendNews should throw when already recommended', async () => {
    const news = { _id: '1', recommendations: 0, save: jest.fn() } as any;
    eventModel.mockImplementation(() => ({ save: jest.fn() }));
    recommendationModel.mockImplementation(() => ({ save: jest.fn() }));
    (recommendationModel.findOne as jest.Mock).mockReturnValue({ session: jest.fn().mockResolvedValue({}) });
    const session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    (connection.startSession as jest.Mock).mockResolvedValue(session);

    await expect(service.recommendNews(news, 'u')).rejects.toBeInstanceOf(ConflictException);
    expect(session.abortTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });
});
