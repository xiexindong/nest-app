import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../services/database.service';
import { Item } from '../../entities/item.entity';
import { CreateItemDto, UpdateItemDto } from './dto/index.js';

@Injectable()
export class ItemService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const query = `
      INSERT INTO items (name, description, price, quantity, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    const insertId = await this.databaseService.executeCommand(query, [
      createItemDto.name,
      createItemDto.description,
      createItemDto.price,
      createItemDto.quantity,
    ]);

    return this.findOne(insertId);
  }

  async findAll(): Promise<Item[]> {
    const query = 'SELECT * FROM items ORDER BY created_at DESC';
    return this.databaseService.executeQuery<Item>(query);
  }

  async findOne(id: number): Promise<Item> {
    const query = 'SELECT * FROM items WHERE id = ?';
    const items = await this.databaseService.executeQuery<Item>(query, [id]);
    if (items.length === 0) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return items[0];
  }

  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    // 检查商品是否存在
    await this.findOne(id);

    const query = `
      UPDATE items
      SET name = ?, description = ?, price = ?, quantity = ?, updated_at = NOW()
      WHERE id = ?
    `;
    await this.databaseService.executeQuery<any>(query, [
      updateItemDto.name,
      updateItemDto.description,
      updateItemDto.price,
      updateItemDto.quantity,
      id,
    ]);

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    // 检查商品是否存在
    await this.findOne(id);

    const query = 'DELETE FROM items WHERE id = ?';
    await this.databaseService.executeQuery<any>(query, [id]);

    return { message: `Item with ID ${id} deleted successfully` };
  }
}
