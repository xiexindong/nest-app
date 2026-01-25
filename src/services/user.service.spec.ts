import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DatabaseService } from './database.service';
import { LoginDto } from '../dto/auth.dto';

describe('UserService', () => {
  let userService: UserService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseService,
          useValue: {
            executeQuery: jest.fn(),
            executeCommand: jest.fn(),
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const loginDto: LoginDto = { username: 'testuser', password: 'password123' };
      const hashedPassword = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'; // 'password123' hashed
      
      jest.spyOn(databaseService, 'executeQuery').mockResolvedValue([
        {
          id: 1,
          username: 'testuser',
          password: hashedPassword,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await userService.validateUser(loginDto);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.username).toBe('testuser');
      expect(databaseService.executeQuery).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['testuser'],
      );
    });

    it('should return null when user does not exist', async () => {
      const loginDto: LoginDto = { username: 'nonexistent', password: 'password123' };
      
      jest.spyOn(databaseService, 'executeQuery').mockResolvedValue([]);

      const result = await userService.validateUser(loginDto);

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const loginDto: LoginDto = { username: 'testuser', password: 'wrongpassword' };
      const hashedPassword = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'; // 'password123' hashed
      
      jest.spyOn(databaseService, 'executeQuery').mockResolvedValue([
        {
          id: 1,
          username: 'testuser',
          password: hashedPassword,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await userService.validateUser(loginDto);

      expect(result).toBeNull();
    });
  });

  describe('getPublicInfo', () => {
    it('should return public information', async () => {
      jest.spyOn(databaseService, 'executeQuery').mockResolvedValue([{ totalUsers: 5 }]);

      const result = await userService.getPublicInfo();

      expect(result).toEqual({
        totalUsers: 5,
        systemVersion: '1.0.0',
      });
      expect(databaseService.executeQuery).toHaveBeenCalledWith('SELECT COUNT(*) as totalUsers FROM users');
    });

    it('should return 0 totalUsers when no users exist', async () => {
      jest.spyOn(databaseService, 'executeQuery').mockResolvedValue([{ totalUsers: 0 }]);

      const result = await userService.getPublicInfo();

      expect(result.totalUsers).toBe(0);
    });
  });
});
