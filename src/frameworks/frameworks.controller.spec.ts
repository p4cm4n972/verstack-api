import { Test, TestingModule } from '@nestjs/testing';
import { FrameworksController } from './frameworks.controller';

describe('FrameworkController', () => {
  let controller: FrameworksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrameworksController],
    }).compile();

    controller = module.get<FrameworksController>(FrameworksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
