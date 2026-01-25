import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service.js';
import { DatabaseService } from '../../services/database.service';

@Module({
  controllers: [ItemController],
  providers: [ItemService, DatabaseService],
  exports: [ItemService],
})
export class ItemModule {}
