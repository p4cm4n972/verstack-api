import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { mock, MockProxy } from 'jest-mock-extended';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: MockProxy<UsersService>;

  beforeEach(async () => {
    usersService = mock<UsersService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const query = { limit: 2, offset: 0 } as any;
      const expected = ['user'];
      usersService.findAll.mockResolvedValue(expected as any);

      const result = await controller.findAll(query);

      expect(usersService.findAll).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const id = '123';
      const user = { id } as any;
      usersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne(id);

      expect(usersService.findOne).toHaveBeenCalledWith(id);
      expect(result).toBe(user);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { email: 'a@b.c' } as any;
      const created = { id: '1', ...dto };
      usersService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = '1';
      const dto = { pseudo: 'new' };
      const updated = { id, ...dto } as any;
      usersService.update.mockResolvedValue(updated);

      const result = await controller.update(id, dto);

      expect(usersService.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBe(updated);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = '1';
      const removed = { deleted: true } as any;
      usersService.remove.mockResolvedValue(removed);

      const result = await controller.remove(id);

      expect(usersService.remove).toHaveBeenCalledWith(id);
      expect(result).toBe(removed);
    });
  });
});
