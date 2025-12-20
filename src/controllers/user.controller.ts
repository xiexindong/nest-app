import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  getPermissions,
  getRoles,
  hasPermission,
} from '../decorators/permission.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // 此行仅为调试输出，已注释以避免语法错误
  // console.log(this.userService);
  /**
   * 模拟获取当前用户权限的方法
   * 在实际应用中，这通常从JWT令牌或会话中获取
   */
  private getCurrentUserPermissions(): string[] {
    // 这里模拟一个具有'user'和'read'权限的用户
    return ['user', 'read'];
  }

  /**
   * 使用Reflect检查权限的中间件方法
   */
  private checkPermission(methodName: string) {
    const userService = this.userService;
    const userPermissions = this.getCurrentUserPermissions();
    // 使用Reflect检查方法权限
    if (!hasPermission(userService, methodName, userPermissions)) {
      const requiredPermissions = getPermissions(userService, methodName);
      throw new ForbiddenException(
        `需要权限: ${requiredPermissions.join(', ')}, 当前权限: ${userPermissions.join(', ')}`,
      );
    }
  }

  @Get()
  getAllUsers() {
    // 使用Reflect检查权限
    this.checkPermission('getAllUsers');
    return this.userService.getAllUsers();
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    // 使用Reflect检查权限
    this.checkPermission('getUserById');
    return this.userService.getUserById(parseInt(id, 10));
  }

  @Post()
  createUser(@Body() userData: { name: string; role: string }) {
    // 使用Reflect检查权限
    this.checkPermission('createUser');
    return this.userService.createUser(userData);
  }

  @Get('public/info')
  getPublicInfo() {
    // 公共信息不需要权限检查
    return this.userService.getPublicInfo();
  }

  @Get('metadata/roles')
  getRolesMetadata() {
    // 使用Reflect获取类的角色元数据
    const roles = getRoles(this.userService.constructor);
    return {
      service: 'UserService',
      roles: roles,
      message: '这是通过Reflect.getMetadata从类元数据中获取的角色信息',
    };
  }

  @Get('metadata/permissions/:method')
  getPermissionsMetadata(@Param('method') method: string) {
    // 使用Reflect获取方法的权限元数据
    const permissions = getPermissions(this.userService, method);
    return {
      service: 'UserService',
      method: method,
      permissions: permissions,
      message: '这是通过Reflect.getMetadata从方法元数据中获取的权限信息',
    };
  }
}
