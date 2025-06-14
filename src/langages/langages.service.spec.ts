import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { LangagesService } from './langages.service';
import { Langage } from './entities/langage.entity';
import { EventEntity } from '../events/entities/event.entity/event.entity';
import { Connection } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

const MockLangageModel: any = jest.fn();
MockLangageModel.find = jest.fn();
MockLangageModel.findOne = jest.fn();
MockLangageModel.findOneAndUpdate = jest.fn();
MockLangageModel.deleteOne = jest.fn();

const MockEventModel: any = jest.fn();

describe('LangagesService', () => {
  let service: LangagesService;
  let langageModel: typeof MockLangageModel;
  let eventModel: typeof MockEventModel;
  let connection: any;

  beforeEach(async () => {
    langageModel = MockLangageModel as any;
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
        LangagesService,
        { provide: getModelToken(Langage.name), useValue: langageModel },
        { provide: getModelToken(EventEntity.name), useValue: eventModel },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get<LangagesService>(LangagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should query with pagination', async () => {
    const exec = jest.fn().mockResolvedValue(['a']);
    const limit = jest.fn().mockReturnValue({ exec });
    const skip = jest.fn().mockReturnValue({ limit });
    (langageModel.find as jest.Mock).mockReturnValue({ skip });

    const result = await service.findAll({ limit: 1, offset: 2 });

    expect(langageModel.find).toHaveBeenCalled();
    expect(skip).toHaveBeenCalledWith(2);
    expect(limit).toHaveBeenCalledWith(1);
    expect(exec).toHaveBeenCalled();
    expect(result).toEqual(['a']);
  });

  it('findOne should return a langage', async () => {
    const langage = { id: '1' };
    const exec = jest.fn().mockResolvedValue(langage);
    (langageModel.findOne as jest.Mock).mockReturnValue({ exec });

    const result = await service.findOne('1');

    expect(langageModel.findOne).toHaveBeenCalledWith({ _id: '1' });
    expect(result).toEqual(langage);
  });

  it('findOne should throw when langage not found', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    (langageModel.findOne as jest.Mock).mockReturnValue({ exec });

    await expect(service.findOne('2')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create should save a new langage', async () => {
    const dto: any = { name: 'JS' };
    const save = jest.fn().mockResolvedValue(dto);
    langageModel.mockImplementation(() => ({ save }));

    const result = await service.create(dto);

    expect(save).toHaveBeenCalled();
    expect(result).toEqual(dto);
  });

  it('update should return updated langage', async () => {
    const updated = { name: 'Updated' };
    const exec = jest.fn().mockResolvedValue(updated);
    (langageModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec });

    const result = await service.update('1', { name: 'Updated' });

    expect(langageModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '1' },
      { $set: { name: 'Updated' } },
      { new: true },
    );
    expect(result).toEqual(updated);
  });

  it('update should throw when langage not found', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    (langageModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec });
    await expect(service.update('1', {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove should delete langage', async () => {
    const langage = { _id: '1', save: jest.fn() };
    const execFind = jest.fn().mockResolvedValue(langage);
    (langageModel.findOne as jest.Mock).mockReturnValue({ exec: execFind });
    const execDelete = jest.fn().mockResolvedValue({ deleted: true });
    (langageModel.deleteOne as jest.Mock).mockReturnValue({ exec: execDelete });

    const result = await service.remove('1');

    expect(execDelete).toHaveBeenCalled();
    expect(result).toEqual({ deleted: true });
  });

  it('remove should throw when langage not found', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    (langageModel.findOne as jest.Mock).mockReturnValue({ exec });
    await expect(service.remove('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('recommendLangage should create event and save langage', async () => {
    const langage = { _id: '1', recommendations: 0, save: jest.fn() } as any;
    const eventSave = jest.fn();
    eventModel.mockImplementation(() => ({ save: eventSave }));
    const session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    (connection.startSession as jest.Mock).mockResolvedValue(session);

    await service.recommendLangage(langage);

    expect(langage.recommendations).toBe(1);
    expect(eventSave).toHaveBeenCalledWith({ session });
    expect(langage.save).toHaveBeenCalledWith({ session });
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });
});
