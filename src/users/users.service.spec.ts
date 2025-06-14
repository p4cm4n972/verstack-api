import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const MockUserModel: any = jest.fn();
MockUserModel.findOne = jest.fn();

describe('UsersService', () => {
  let service: UsersService;
  let userModel: typeof MockUserModel;

  beforeEach(async () => {
    userModel = MockUserModel as any;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should save a user', async () => {
    const dto: any = { email: 'test@example.com' };
    const save = jest.fn().mockResolvedValue({ _id: '1', ...dto });
    userModel.mockImplementation(() => ({ save }));

    const result = await service.create(dto);

    expect(userModel).toHaveBeenCalledWith(dto);
    expect(save).toHaveBeenCalled();
    expect(result).toEqual({ _id: '1', ...dto });
  });

  it('findOne should return a user', async () => {
    const exec = jest.fn().mockResolvedValue({ _id: '1' });
    (userModel.findOne as jest.Mock).mockReturnValue({ exec });

    const result = await service.findOne('1');

    expect(userModel.findOne).toHaveBeenCalledWith({ _id: '1' });
    expect(result).toEqual({ _id: '1' });
  });
});
