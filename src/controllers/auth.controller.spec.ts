import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from '../services/user.service';
import { JwtService } from '../utils/jwt.util';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: {
            validateUser: jest.fn(),
            generateResetPasswordToken: jest.fn(),
            resetPassword: jest.fn(),
            getUserByIdSafe: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and refresh token when login is successful', async () => {
      const loginDto: LoginDto = { username: 'testuser', password: 'password123' };
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // 模拟JwtService的方法
      jest.spyOn(JwtService, 'generateToken').mockReturnValue('mockAccessToken');
      jest.spyOn(JwtService, 'generateRefreshToken').mockReturnValue('mockRefreshToken');
      jest.spyOn(userService, 'validateUser').mockResolvedValue(mockUser);

      const result = await authController.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('登录成功');
      expect(result.data.accessToken).toBe('mockAccessToken');
      expect(result.data.refreshToken).toBe('mockRefreshToken');
      expect(result.data.user.id).toBe(1);
      expect(userService.validateUser).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = { username: 'testuser', password: 'wrongpassword' };
      
      jest.spyOn(userService, 'validateUser').mockResolvedValue(null);

      await expect(authController.login(loginDto)).rejects.toThrow(
        new HttpException('用户名或密码错误', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('forgotPassword', () => {
    it('should return success message when email is valid', async () => {
      const forgotPasswordDto: ForgotPasswordDto = { email: 'test@example.com' };
      
      jest.spyOn(userService, 'generateResetPasswordToken').mockResolvedValue({ token: 'mockToken' });

      const result = await authController.forgotPassword(forgotPasswordDto);

      expect(result.success).toBe(true);
      expect(result.message).toContain('如果该邮箱存在于我们的系统中');
      expect(userService.generateResetPasswordToken).toHaveBeenCalledWith(forgotPasswordDto);
    });

    it('should return success message even when email is invalid', async () => {
      const forgotPasswordDto: ForgotPasswordDto = { email: 'nonexistent@example.com' };
      
      jest.spyOn(userService, 'generateResetPasswordToken').mockResolvedValue(null);

      const result = await authController.forgotPassword(forgotPasswordDto);

      expect(result.success).toBe(true);
      expect(result.message).toContain('如果该邮箱存在于我们的系统中');
    });
  });

  describe('resetPassword', () => {
    it('should return success message when password is reset successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = { token: 'validToken', newPassword: 'newPassword123' };
      
      jest.spyOn(userService, 'resetPassword').mockResolvedValue({ success: true, message: '密码重置成功' });

      const result = await authController.resetPassword(resetPasswordDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('密码重置成功');
    });

    it('should throw BadRequestException when token is invalid', async () => {
      const resetPasswordDto: ResetPasswordDto = { token: 'invalidToken', newPassword: 'newPassword123' };
      
      jest.spyOn(userService, 'resetPassword').mockResolvedValue({ success: false, message: '令牌无效' });

      await expect(authController.resetPassword(resetPasswordDto)).rejects.toThrow(
        new HttpException('令牌无效', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new access token and refresh token when refresh token is valid', async () => {
      const refreshTokenDto = { refreshToken: 'validRefreshToken' };
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // 模拟JwtService的方法
      jest.spyOn(JwtService, 'verifyRefreshToken').mockReturnValue({ sub: 1, jti: 'test-jti' });
      jest.spyOn(JwtService, 'generateToken').mockReturnValue('newMockAccessToken');
      jest.spyOn(JwtService, 'generateRefreshToken').mockReturnValue('newMockRefreshToken');
      jest.spyOn(userService, 'getUserByIdSafe').mockResolvedValue(mockUser);

      const result = await authController.refreshToken(refreshTokenDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('令牌刷新成功');
      expect(result.data.accessToken).toBe('newMockAccessToken');
      expect(result.data.refreshToken).toBe('newMockRefreshToken');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshTokenDto = { refreshToken: 'invalidRefreshToken' };
      
      // 模拟JwtService的方法抛出错误
      jest.spyOn(JwtService, 'verifyRefreshToken').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authController.refreshToken(refreshTokenDto)).rejects.toThrow(
        new HttpException('刷新令牌失败', HttpStatus.UNAUTHORIZED),
      );
    });
  });
});
