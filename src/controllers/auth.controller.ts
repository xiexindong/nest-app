import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from '../services/user.service.js';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import { JwtService } from '../utils/jwt.util.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  /**
   * 用户登录接口
   */
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async login(@Body() loginDto: LoginDto) {
    try {
      // 验证用户凭据
      const user = await this.userService.validateUser(loginDto);
      if (!user) {
        throw new HttpException('用户名或密码错误', HttpStatus.UNAUTHORIZED);
      }
      // 生成JWT访问令牌
      const accessToken = JwtService.generateToken({
        sub: user.id,
        username: user.username,
        role: user.role,
      });

      // 生成JWT刷新令牌
      const refreshToken = JwtService.generateRefreshToken({
        sub: user.id,
        jti:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
      });

      // 返回用户信息和令牌
      return {
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('登录失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 忘记密码接口
   */
  @Post('forgot-password')
  @ApiOperation({ summary: '忘记密码' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: '处理成功' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const result =
        await this.userService.generateResetPasswordToken(forgotPasswordDto);

      // 为了安全，无论用户是否存在都返回相同的消息
      return {
        success: true,
        message:
          '如果该邮箱存在于我们的系统中，您将收到一封包含重置密码链接的邮件',
        // 在开发环境中返回令牌，生产环境中不应该返回
        ...(process.env.NODE_ENV === 'development' && result
          ? { token: result.token }
          : {}),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        '处理请求时出错',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 重置密码接口
   */
  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 400, description: '令牌无效或其他错误' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const result = await this.userService.resetPassword(resetPasswordDto);

      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('重置密码失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 验证令牌接口
   */
  @Post('verify-token')
  @ApiOperation({ summary: '验证令牌' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'JWT令牌' },
      },
      required: ['token'],
    },
  })
  @ApiResponse({ status: 200, description: '令牌有效' })
  @ApiResponse({ status: 400, description: '令牌不能为空' })
  @ApiResponse({ status: 401, description: '令牌无效' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async verifyToken(@Body() body: { token: string }) {
    try {
      const { token } = body;
      if (!token) {
        throw new HttpException('令牌不能为空', HttpStatus.BAD_REQUEST);
      }
      const payload = JwtService.verifyToken(token);
      // 获取用户详细信息
      const user = await this.userService.getUserByIdSafe(payload.sub);
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: '令牌有效',
        data: {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('令牌无效', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * 刷新令牌接口
   */
  @Post('refresh-token')
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', description: '刷新令牌' },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({ status: 200, description: '刷新令牌成功' })
  @ApiResponse({ status: 400, description: '刷新令牌不能为空' })
  @ApiResponse({ status: 401, description: '刷新令牌无效' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    try {
      const { refreshToken } = body;
      if (!refreshToken) {
        throw new HttpException('刷新令牌不能为空', HttpStatus.BAD_REQUEST);
      }

      // 验证刷新令牌
      const payload = JwtService.verifyRefreshToken(refreshToken);

      // 获取用户详细信息
      const user = await this.userService.getUserByIdSafe(payload.sub);
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }

      // 生成新的访问令牌
      const newAccessToken = JwtService.generateToken({
        sub: user.id,
        username: user.username,
        role: user.role,
      });

      // 生成新的刷新令牌
      const newRefreshToken = JwtService.generateRefreshToken({
        sub: user.id,
        jti:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
      });

      return {
        success: true,
        message: '令牌刷新成功',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('刷新令牌失败', HttpStatus.UNAUTHORIZED);
    }
  }
}
