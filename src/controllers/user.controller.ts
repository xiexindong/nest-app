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
  constructor(private readonly userService: UserService) {
    console.log('UserController 实例化');
    console.log('UserService 实例:', userService);
  }
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
    console.log('=== checkPermission 被调用 ===');
    console.log('检查方法:', methodName);
    console.log('this.userService 类型:', typeof this.userService);
    console.log('this.userService 实例:', this.userService);

    const userService = this.userService;
    const userPermissions = this.getCurrentUserPermissions();
    // 使用Reflect检查方法权限
    if (!hasPermission(userService, methodName, userPermissions)) {
      const requiredPermissions = getPermissions(userService, methodName);
      throw new ForbiddenException(
        `需要权限: ${requiredPermissions.join(', ')}, 当前权限: ${userPermissions.join(', ')}`,
      );
    }
    console.log('权限检查通过');
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
  createUser(
    @Body() userData: { name: string; role: string; password: string },
  ) {
    // 使用Reflect检查权限
    this.checkPermission('createUser');
    const fullUserData = {
      ...userData,
      username: userData.name, // 使用 name 作为 username 的默认值
      email: `${userData.name}@example.com`, // 生成默认 email
    };
    return this.userService.createUser(fullUserData);
  }

  @Get('public/info')
  getPublicInfo() {
    // 公共信息不需要权限检查
    return this.userService.getPublicInfo();
  }

  @Get('debug/service')
  getServiceDebugInfo() {
    return {
      userServiceType: typeof this.userService,
      userServiceConstructor: this.userService.constructor.name,
      userServiceInstance: !!this.userService,
      hasGetAllUsers: typeof this.userService.getAllUsers === 'function',
      hasGetUserById: typeof this.userService.getUserById === 'function',
      hasCreateUser: typeof this.userService.createUser === 'function',
      hasGetPublicInfo: typeof this.userService.getPublicInfo === 'function',
      userServiceMethods: Object.getOwnPropertyNames(
        Object.getPrototypeOf(this.userService),
      ),
    };
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
