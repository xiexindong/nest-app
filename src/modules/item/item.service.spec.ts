import { Test, TestingModule } from '@nestjs/testing';
import { ItemService } from './item.service.js';
import { DatabaseService } from '../../services/database.service';
import { NotFoundException } from '@nestjs/common';

const mockDatabaseService = {
  executeQuery: jest.fn(),
};

describe('ItemService', () => {
  let service: ItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const createItemDto = {
        name: 'Test Item',
        description: 'Test Description',
        price: 99.99,
        quantity: 10,
      };

      const mockResult = { insertId: 1 };
      const mockItem = {
        id: 1,
        name: 'Test Item',
        description: 'Test Description',
        price: 99.99,
        quantity: 10,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDatabaseService.executeQuery
        .mockResolvedValueOnce([mockResult])
        .mockResolvedValueOnce([mockItem]);

      const result = await service.create(createItemDto);

      expect(result).toEqual(mockItem);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    it('should return all items', async () => {
      const mockItems = [
        {
          id: 1,
          name: 'Item 1',
          price: 99.99,
          quantity: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDatabaseService.executeQuery.mockResolvedValueOnce(mockItems);

      const result = await service.findAll();

      expect(result).toEqual(mockItems);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return an item by ID', async () => {
      const mockItem = {
        id: 1,
        name: 'Test Item',
        price: 99.99,
        quantity: 10,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDatabaseService.executeQuery.mockResolvedValueOnce([mockItem]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockItem);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockDatabaseService.executeQuery.mockResolvedValueOnce([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      const updateItemDto = {
        name: 'Updated Item',
        description: 'Updated Description',
        price: 199.99,
        quantity: 20,
      };

      const mockExistingItem = {
        id: 1,
        name: 'Test Item',
        price: 99.99,
        quantity: 10,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUpdatedItem = {
        id: 1,
        name: 'Updated Item',
        description: 'Updated Description',
        price: 199.99,
        quantity: 20,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDatabaseService.executeQuery
        .mockResolvedValueOnce([mockExistingItem])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([mockUpdatedItem]);

      const result = await service.update(1, updateItemDto);

      expect(result).toEqual(mockUpdatedItem);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(3);
    });

    it('should throw NotFoundException if item not found', async () => {
      const updateItemDto = {
        name: 'Updated Item',
        description: 'Updated Description',
        price: 199.99,
        quantity: 20,
      };

      mockDatabaseService.executeQuery.mockResolvedValueOnce([]);

      await expect(service.update(999, updateItemDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should delete an existing item', async () => {
      const mockExistingItem = {
        id: 1,
        name: 'Test Item',
        price: 99.99,
        quantity: 10,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDatabaseService.executeQuery
        .mockResolvedValueOnce([mockExistingItem])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await service.remove(1);

      expect(result).toEqual({
        message: 'Item with ID 1 deleted successfully',
      });
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if item not found', async () => {
      mockDatabaseService.executeQuery.mockResolvedValueOnce([]);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledTimes(1);
    });
  });
});
