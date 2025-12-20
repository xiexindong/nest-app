import { Injectable } from '@nestjs/common';
import { Permissions, Roles } from '../decorators/permission.decorator';

@Injectable()
@Roles('admin', 'user') // 使用Roles装饰器为类添加角色元数据
export class UserService {
  private users = [
    { id: 1, name: '张三', role: 'admin' },
    { id: 2, name: '李四', role: 'user' },
    { id: 3, name: '王五', role: 'guest' },
  ];

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
  createUser(userData: { name: string; role: string }) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
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
}
