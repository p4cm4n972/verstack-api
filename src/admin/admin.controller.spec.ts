import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { LangageUpdateService } from '../langages/langage-update.service';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: LangageUpdateService, useValue: { syncAll: jest.fn() } }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
