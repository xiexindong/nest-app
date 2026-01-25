import { Test, TestingModule } from '@nestjs/testing';
import { DepatmentController } from './depatment.controller';

describe('DepatmentController', () => {
  let controller: DepatmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepatmentController],
    }).compile();

    controller = module.get<DepatmentController>(DepatmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
