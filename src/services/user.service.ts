import { Injectable } from '@nestjs/common';
import { Permissions, Roles } from '../decorators/permission.decorator';
import { User } from '../models/user.model';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import * as crypto from 'crypto';

@Injectable()
@Roles('admin', 'user') // 使用Roles装饰器为类添加角色元数据
export class UserService {
  constructor() {
    console.log('=== UserService 实例化 ===');
    console.log('UserService 构造函数被调用');
  }

  // 模拟数据库中的用户数据，包含认证相关字段
  private users: User[] = [
    {
      id: 1,
      username: 'admin',
      password: this.hashPassword('admin123'),
      email: 'admin@example.com',
      name: '张三',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      username: 'user',
      password: this.hashPassword('user123'),
      email: 'user@example.com',
      name: '李四',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      username: 'guest',
      password: this.hashPassword('guest123'),
      email: 'guest@example.com',
      name: '王五',
      role: 'guest',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 简单的密码哈希方法
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // 验证密码
  private validatePassword(password: string, hashedPassword: string): boolean {
    const hash = this.hashPassword(password);
    return hash === hashedPassword;
  }

  // 生成随机令牌
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 获取所有用户
   * 需要'admin'权限
   */
  @Permissions('admin') // 使用Permissions装饰器为方法添加权限元数据
  getAllUsers() {
    return this.users;
  }

  /**
   * 根据ID获取用户
   * 需要'user'或'admin'权限
   */
  @Permissions('user', 'admin')
  getUserById(id: number) {
    console.log(111111111, id);
    return this.users.find((user) => user.id === id);
  }

  /**
   * 创建用户
   * 需要'admin'权限
   */
  @Permissions('admin')
  createUser(userData: {
    name: string;
    role: string;
    username: string;
    password: string;
    email: string;
  }) {
    const newUser: User = {
      id: this.users.length + 1,
      username: userData.username,
      password: this.hashPassword(userData.password),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  /**
   * 公共方法，不需要任何权限
   */
  getPublicInfo() {
    return {
      totalUsers: this.users.length,
      systemVersion: '1.0.0',
    };
  }

  /**
   * 用户登录验证
   */
  validateUser(loginDto: LoginDto): User | null {
    const { username, password } = loginDto;
    const user = this.users.find((u) => u.username === username);

    if (user && this.validatePassword(password, user.password)) {
      // 返回用户信息但不包含密码
      const { ...result } = user;
      return result as User;
    }

    return null;
  }

  /**
   * 根据用户名查找用户
   */
  findByUsername(username: string): User | null {
    return this.users.find((u) => u.username === username) || null;
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.email === email) || null);
  }

  /**
   * 生成重置密码令牌
   */
  async generateResetPasswordToken(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ token: string } | null> {
    const { email } = forgotPasswordDto;
    const user = await this.findByEmail(email);

    if (!user) {
      return null; // 为了安全，即使用户不存在也不暴露
    }

    const token = this.generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 令牌1小时后过期

    // 更新用户的重置密码令牌和过期时间
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    user.updatedAt = new Date();

    // 在实际应用中，这里应该发送邮件包含重置链接
    console.log(`重置密码令牌已生成: ${token}`);
    console.log(
      `模拟邮件发送: 请访问 http://localhost:3000/reset-password?token=${token}`,
    );

    return { token };
  }

  /**
   * 重置密码
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // 查找具有有效令牌的用户
    const user = this.users.find(
      (u) =>
        u.resetPasswordToken === token &&
        u.resetPasswordExpires &&
        u.resetPasswordExpires > new Date(),
    );

    if (!user) {
      return Promise.resolve({ success: false, message: '令牌无效或已过期' });
    }

    // 更新密码
    user.password = this.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date();

    return Promise.resolve({ success: true, message: '密码重置成功' });
  }

  /**
   * 根据ID获取用户（不包含密码）
   */
  async getUserByIdSafe(id: number): Promise<Omit<User, 'password'> | null> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      return null;
    }

    const { ...result } = user;
    return Promise.resolve(result);
  }
}
