import { Injectable } from '@nestjs/common';
import { Permissions, Roles } from '../decorators/permission.decorator';
import { User } from '../models/user.model';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import * as crypto from 'crypto';
import { DatabaseService } from './database.service';

@Injectable()
@Roles('admin', 'user') // 使用Roles装饰器为类添加角色元数据
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {
    console.log('=== UserService 实例化 ===');
    console.log('UserService 构造函数被调用');
    console.log('Father 属性值:', this.Father);
    console.log('实例属性:', Object.getOwnPropertyNames(this));
  }

  private Father: string = 'admin';
  private Father22: string = 'admin';
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
  async getAllUsers() {
    const sql = 'SELECT * FROM users';
    return await this.databaseService.executeQuery<User>(sql);
  }

  /**
   * 根据ID获取用户
   * 需要'user'或'admin'权限
   */
  @Permissions('user', 'admin')
  async getUserById(id: number) {
    console.log(111111111, id);
    const sql = 'SELECT * FROM users WHERE id = ?';
    const users = await this.databaseService.executeQuery<User>(sql, [id]);
    return users.length > 0 ? users[0] : null;
  }

  /**
   * 创建用户
   * 需要'admin'权限
   */
  @Permissions('admin')
  async createUser(userData: {
    name: string;
    role: string;
    username: string;
    password: string;
    email: string;
  }) {
    const hashedPassword = this.hashPassword(userData.password);
    const sql = `
      INSERT INTO users (username, password, email, name, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const params = [
      userData.username,
      hashedPassword,
      userData.email,
      userData.name,
      userData.role,
    ];

    const insertId = await this.databaseService.executeCommand(sql, params);

    // 返回创建的用户信息
    return this.getUserById(insertId);
  }

  /**
   * 公共方法，不需要任何权限
   */
  async getPublicInfo() {
    const sql = 'SELECT COUNT(*) as totalUsers FROM users';
    // 定义明确的类型接口
    interface CountResult {
      totalUsers: number;
    }
    const result = await this.databaseService.executeQuery<CountResult>(sql);
    return {
      totalUsers: result[0]?.totalUsers || 0,
      systemVersion: '1.0.0',
    };
  }

  /**
   * 用户登录验证
   */
  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const { username, password } = loginDto;
    const sql = 'SELECT * FROM users WHERE username = ?';
    const users = await this.databaseService.executeQuery<User>(sql, [
      username,
    ]);

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    if (this.validatePassword(password, user.password)) {
      return user;
    }

    return null;
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const users = await this.databaseService.executeQuery<User>(sql, [
      username,
    ]);
    return users.length > 0 ? users[0] : null;
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await this.databaseService.executeQuery<User>(sql, [email]);
    return users.length > 0 ? users[0] : null;
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
    const sql = `
      UPDATE users 
      SET resetPasswordToken = ?, resetPasswordExpires = ?, updatedAt = NOW()
      WHERE id = ?
    `;
    await this.databaseService.executeCommand(sql, [token, expires, user.id]);

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
    const sql =
      'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()';
    const users = await this.databaseService.executeQuery<User>(sql, [token]);

    if (users.length === 0) {
      return { success: false, message: '令牌无效或已过期' };
    }

    const user = users[0];
    // 更新密码和清除令牌
    const hashedPassword = this.hashPassword(newPassword);
    const updateSql = `
      UPDATE users 
      SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL, updatedAt = NOW()
      WHERE id = ?
    `;

    await this.databaseService.executeCommand(updateSql, [
      hashedPassword,
      user.id,
    ]);

    return { success: true, message: '密码重置成功' };
  }

  /**
   * 根据ID获取用户（不包含密码）
   */
  async getUserByIdSafe(id: number): Promise<Omit<User, 'password'> | null> {
    const sql =
      'SELECT id, username, email, name, role, createdAt, updatedAt FROM users WHERE id = ?';
    const users = await this.databaseService.executeQuery<
      Omit<User, 'password'>
    >(sql, [id]);
    return users.length > 0 ? users[0] : null;
  }
}
