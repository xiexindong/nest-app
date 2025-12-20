# NestJS 初学者指南

## 目录
1. [NestJS 简介](#nestjs-简介)
2. [项目结构](#项目结构)
3. [核心概念](#核心概念)
4. [装饰器详解](#装饰器详解)
5. [Reflect 元数据系统](#reflect-元数据系统)
6. [依赖注入](#依赖注入)
7. [模块系统](#模块系统)
8. [控制器和服务](#控制器和服务)
9. [实际示例：权限管理系统](#实际示例权限管理系统)
10. [常见问题与解决方案](#常见问题与解决方案)

## NestJS 简介

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的框架。它使用 TypeScript 构建，结合了面向对象编程(OOP)、函数式编程(FP)和函数响应式编程(FRP)的元素。

### 主要特点
- **TypeScript 支持**：完全支持 TypeScript，提供强类型和现代语言特性
- **模块化架构**：通过模块组织应用程序结构
- **依赖注入**：强大的 IoC 容器管理依赖关系
- **装饰器**：使用装饰器简化配置和元数据管理
- **灵活性**：可与多种数据库（SQL、NoSQL）和前端框架集成

## 项目结构

一个典型的 NestJS 项目结构如下：

```
src/
├── app.controller.ts         # 应用程序主控制器
├── app.module.ts            # 应用程序根模块
├── app.service.ts           # 应用程序主服务
├── main.ts                  # 应用程序入口点
├── controllers/             # 控制器目录
│   └── user.controller.ts   # 用户控制器
├── services/                # 服务目录
│   └── user.service.ts      # 用户服务
├── decorators/              # 自定义装饰器目录
│   └── permission.decorator.ts  # 权限装饰器
└── modules/                 # 模块目录
    └── user/                # 用户模块
        ├── user.module.ts
        ├── user.controller.ts
        └── user.service.ts
```

## 核心概念

### 模块 (Modules)
模块是 NestJS 应用程序的基本构建块。每个应用程序至少有一个模块（根模块）。

```typescript
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [],      // 导入其他模块
  controllers: [UserController],  // 声明控制器
  providers: [UserService],        // 声明服务提供者
  exports: [UserService],         // 导出服务供其他模块使用
})
export class UserModule {}
```

### 控制器 (Controllers)
控制器负责处理传入的请求并返回响应给客户端。

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')  // 路由前缀 /users
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()  // GET /users
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')  // GET /users/:id
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()  // POST /users
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
```

### 服务 (Services)
服务负责处理业务逻辑，通常与数据库交互。

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly users = [];

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    return this.users.find(user => user.id === id);
  }

  create(userData) {
    const newUser = { id: Date.now().toString(), ...userData };
    this.users.push(newUser);
    return newUser;
  }
}
```

## 装饰器详解

装饰器是一种特殊类型的声明，可以附加到类声明、方法、访问器、属性或参数上。在 NestJS 中，装饰器用于添加元数据和配置行为。

### 常用内置装饰器

#### 类装饰器
```typescript
import { Controller, Module, Injectable } from '@nestjs/common';

@Controller('users')  // 控制器装饰器，指定路由前缀
export class UserController {}

@Module({})  // 模块装饰器
export class UserModule {}

@Injectable()  // 服务装饰器，标记类为可注入的服务
export class UserService {}
```

#### 方法装饰器
```typescript
import { Get, Post, Put, Delete } from '@nestjs/common';

export class UserController {
  @Get()  // GET 请求处理
  getUsers() {}

  @Post()  // POST 请求处理
  createUser() {}

  @Put(':id')  // PUT 请求处理，带路径参数
  updateUser() {}

  @Delete(':id')  // DELETE 请求处理
  deleteUser() {}
}
```

#### 参数装饰器
```typescript
import { Body, Param, Query, Headers } from '@nestjs/common';

export class UserController {
  // 从请求体获取数据
  createUser(@Body() userData: CreateUserDto) {}

  // 从路径参数获取数据
  getUserById(@Param('id') id: string) {}

  // 从查询参数获取数据
  searchUsers(@Query('keyword') keyword: string) {}

  // 从请求头获取数据
  checkAuth(@Headers('authorization') auth: string) {}
}
```

### 自定义装饰器

您可以创建自己的装饰器来添加特定功能。

#### 简单装饰器
```typescript
// 创建一个日志装饰器
export function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`调用方法: ${propertyKey}，参数:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`方法 ${propertyKey} 执行完成，返回值:`, result);
    return result;
  };
  
  return descriptor;
}

// 使用装饰器
export class UserService {
  @Log
  getUser(id: string) {
    return { id, name: '张三' };
  }
}
```

#### 带参数的装饰器工厂
```typescript
// 创建一个角色验证装饰器
export function Roles(...roles: string[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 将角色信息存储到元数据中
    Reflect.defineMetadata('roles', roles, target, propertyKey);
    return descriptor;
  };
}

// 使用装饰器
export class UserController {
  @Roles('admin', 'moderator')
  deleteUser() {
    // 只有 admin 或 moderator 角色才能访问此方法
  }
}
```

## Reflect 元数据系统

Reflect 是 JavaScript 的内置对象，提供了一些方法来操作对象和元数据。在 NestJS 中，Reflect 主要用于存储和检索装饰器添加的元数据。

### 基本用法

#### 设置和获取元数据
```typescript
import 'reflect-metadata'; // 必须导入以启用元数据支持

// 定义元数据键
const METADATA_KEY = Symbol('custom-key');

// 设置元数据
Reflect.defineMetadata(METADATA_KEY, 'some value', SomeClass);

// 获取元数据
const value = Reflect.getMetadata(METADATA_KEY, SomeClass);
console.log(value); // 'some value'
```

#### 方法级别的元数据
```typescript
// 为方法设置元数据
Reflect.defineMetadata(METADATA_KEY, 'method value', SomeClass.prototype, 'someMethod');

// 获取方法元数据
const methodValue = Reflect.getMetadata(METADATA_KEY, SomeClass.prototype, 'someMethod');
```

#### 检查元数据是否存在
```typescript
// 检查类是否有元数据
const hasMetadata = Reflect.hasMetadata(METADATA_KEY, SomeClass);

// 检查方法是否有元数据
const hasMethodMetadata = Reflect.hasMetadata(METADATA_KEY, SomeClass.prototype, 'someMethod');
```

#### 获取所有元数据键
```typescript
// 获取类的所有元数据键
const keys = Reflect.getMetadataKeys(SomeClass);

// 获取方法的所有元数据键
const methodKeys = Reflect.getMetadataKeys(SomeClass.prototype, 'someMethod');
```

#### 删除元数据
```typescript
// 删除类的元数据
Reflect.deleteMetadata(METADATA_KEY, SomeClass);

// 删除方法的元数据
Reflect.deleteMetadata(METADATA_KEY, SomeClass.prototype, 'someMethod');
```

### 在装饰器中使用 Reflect

```typescript
import 'reflect-metadata';

// 定义元数据键常量
const PERMISSION_KEY = Symbol('permissions');

// 创建权限装饰器
export const RequirePermissions = (...permissions: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 使用 Reflect 存储权限信息到方法的元数据中
    Reflect.defineMetadata(PERMISSION_KEY, permissions, target, propertyKey);
    return descriptor;
  };
};

// 创建权限检查函数
export const checkPermissions = (target: any, propertyKey: string, userPermissions: string[]) => {
  // 使用 Reflect 获取方法的权限要求
  const requiredPermissions = Reflect.getMetadata(PERMISSION_KEY, target, propertyKey) || [];
  
  // 检查用户是否有足够权限
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

// 使用装饰器和权限检查
export class UserController {
  @RequirePermissions('admin', 'moderator')
  deleteUser() {
    // 删除用户逻辑
  }
}

// 在运行时检查权限
const controller = new UserController();
const userPermissions = ['user'];
const canDelete = checkPermissions(controller, 'deleteUser', userPermissions);
console.log(canDelete); // false，因为用户没有所需权限
```

## 依赖注入

依赖注入(DI)是一种设计模式，用于实现控制反转(IoC)，使代码更加模块化和可测试。

### 基本概念

```typescript
import { Injectable, Inject } from '@nestjs/common';

// 定义一个服务
@Injectable()
export class DatabaseService {
  connect() {
    console.log('连接到数据库');
  }
}

// 定义另一个服务，依赖于 DatabaseService
@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}  // 依赖注入

  getUsers() {
    this.databaseService.connect();
    return [];  // 返回用户列表
  }
}
```

### 自定义提供者

```typescript
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',  // 使用字符串作为提供者令牌
      useFactory: async () => {
        // 工厂函数，可以执行异步操作
        const connection = await createConnection();
        return connection;
      },
    },
    {
      provide: DatabaseService,
      useExisting: 'DATABASE_CONNECTION',  // 使用现有提供者
    },
  ],
})
export class AppModule {}
```

### 注入自定义提供者

```typescript
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly dbConnection: any
  ) {}

  getUsers() {
    return this.dbConnection.query('SELECT * FROM users');
  }
}
```

## 模块系统

模块是 NestJS 应用程序的基本组织单元。它们帮助将相关功能组织在一起。

### 导入模块

```typescript
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],  // 导入其他模块
})
export class AppModule {}
```

### 导出服务

```typescript
// user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  providers: [UserService],
  exports: [UserService],  // 导出 UserService 供其他模块使用
})
export class UserModule {}

// auth.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule],  // 导入 UserModule 以使用其导出的服务
  providers: [AuthService],
})
export class AuthModule {
  constructor(private readonly userService: UserService) {}  // 可以注入 UserService
}
```

### 全局模块

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';

@Global()  // 标记为全局模块
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

// 现在可以在任何地方注入 ConfigService 而无需导入 ConfigModule
@Injectable()
export class AnyService {
  constructor(private readonly configService: ConfigService) {}
}
```

## 控制器和服务

### 控制器详解

控制器负责处理 HTTP 请求和响应。它们使用装饰器来定义路由和请求处理逻辑。

#### 请求处理

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';

@Controller('users')
export class UserController {
  // GET /users
  @Get()
  findAll() {
    return '返回所有用户';
  }

  // GET /users/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `返回 ID 为 ${id} 的用户`;
  }

  // POST /users
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return `创建用户: ${createUserDto.name}`;
  }

  // PUT /users/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return `更新 ID 为 ${id} 的用户`;
  }

  // DELETE /users/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return `删除 ID 为 ${id} 的用户`;
  }

  // GET /users/search?keyword=keyword
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return `搜索关键词: ${keyword}`;
  }

  // 获取请求头信息
  @Get('auth')
  getAuth(@Headers('authorization') auth: string) {
    return `授权信息: ${auth}`;
  }
}
```

#### 状态码和响应头

```typescript
import { Controller, Get, Post, HttpStatus, HttpCode, Header } from '@nestjs/common';

@Controller()
export class AppController {
  // 自定义状态码
  @Post()
  @HttpCode(HttpStatus.CREATED)  // 设置状态码为 201
  create() {
    return '创建成功';
  }

  // 自定义响应头
  @Get()
  @Header('Cache-Control', 'none')  // 设置响应头
  findAll() {
    return '所有用户';
  }
}
```

### 服务详解

服务负责处理业务逻辑。它们通常与数据库交互、执行计算或协调其他服务。

#### 基本服务

```typescript
import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  private readonly users: User[] = [];

  create(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      id: this.users.length + 1,
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  update(id: number, userData: Partial<User>): User | null {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return null;
    }
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }

  remove(id: number): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }
    
    this.users.splice(userIndex, 1);
    return true;
  }
}
```

#### 异步服务

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AsyncUserService {
  async findAll(): Promise<User[]> {
    // 模拟异步数据库查询
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([{ id: 1, name: '张三', email: 'zhangsan@example.com' }]);
      }, 1000);
    });
  }

  async findOne(id: number): Promise<User | null> {
    const users = await this.findAll();
    return users.find(user => user.id === id) || null;
  }
}
```

## 实际示例：权限管理系统

让我们通过一个完整的权限管理系统示例来巩固所学知识。

### 1. 创建权限装饰器

```typescript
// src/decorators/permission.decorator.ts
import 'reflect-metadata';

// 定义元数据键的常量
export const PERMISSION_KEY = Symbol('permission');
export const ROLE_KEY = Symbol('role');

/**
 * 权限装饰器
 * 使用 Reflect 存储权限信息到方法的元数据中
 */
export const RequirePermissions = (...permissions: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSION_KEY, permissions, target, propertyKey);
    return descriptor;
  };
};

/**
 * 角色装饰器
 * 使用 Reflect 存储角色信息到类的元数据中
 */
export const RequireRoles = (...roles: string[]) => {
  return (target: any) => {
    Reflect.defineMetadata(ROLE_KEY, roles, target);
  };
};

/**
 * 获取方法的权限信息
 */
export const getPermissions = (target: any, propertyKey: string): string[] => {
  return Reflect.getMetadata(PERMISSION_KEY, target, propertyKey) || [];
};

/**
 * 获取类的角色信息
 */
export const getRoles = (target: any): string[] => {
  return Reflect.getMetadata(ROLE_KEY, target) || [];
};

/**
 * 检查用户是否有权限执行某个方法
 */
export const hasPermission = (
  target: any,
  propertyKey: string,
  userPermissions: string[]
): boolean => {
  if (!Reflect.hasMetadata(PERMISSION_KEY, target, propertyKey)) {
    return true; // 如果没有设置权限要求，默认允许访问
  }

  const requiredPermissions = getPermissions(target, propertyKey);
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};
```

### 2. 创建用户服务

```typescript
// src/services/user.service.ts
import { Injectable } from '@nestjs/common';
import { RequireRoles } from '../decorators/permission.decorator';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

@Injectable()
@RequireRoles('admin', 'user')  // 类级别角色要求
export class UserService {
  private readonly users: User[] = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: 'user' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: 'guest' },
  ];

  @RequirePermissions('user:read')  // 方法级别权限要求
  findAll(): User[] {
    return this.users;
  }

  @RequirePermissions('user:read')
  findOne(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  @RequirePermissions('user:create')
  create(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      id: this.users.length + 1,
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  @RequirePermissions('user:update')
  update(id: number, userData: Partial<User>): User | null {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return null;
    }
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }

  @RequirePermissions('user:delete')
  remove(id: number): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }
    
    this.users.splice(userIndex, 1);
    return true;
  }
}
```

### 3. 创建用户控制器

```typescript
// src/controllers/user.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ForbiddenException,
  NotFoundException 
} from '@nestjs/common';
import { UserService, User } from '../services/user.service';
import { getPermissions, hasPermission } from '../decorators/permission.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 模拟获取当前用户权限
   * 在实际应用中，这通常从JWT令牌或会话中获取
   */
  private getCurrentUserPermissions(): string[] {
    // 这里模拟一个具有 'user:read' 和 'user:create' 权限的用户
    return ['user:read', 'user:create'];
  }

  /**
   * 使用 Reflect 检查权限的中间件方法
   */
  private checkPermission(methodName: string) {
    const userService = this.userService;
    const userPermissions = this.getCurrentUserPermissions();
    
    // 使用 Reflect 检查方法权限
    if (!hasPermission(userService, methodName, userPermissions)) {
      const requiredPermissions = getPermissions(userService, methodName);
      throw new ForbiddenException(
        `需要权限: ${requiredPermissions.join(', ')}, 当前权限: ${userPermissions.join(', ')}`
      );
    }
  }

  @Get()
  findAll(): User[] {
    this.checkPermission('findAll');
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): User {
    this.checkPermission('findOne');
    const user = this.userService.findOne(parseInt(id, 10));
    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }
    return user;
  }

  @Post()
  create(@Body() userData: Omit<User, 'id'>): User {
    this.checkPermission('create');
    return this.userService.create(userData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() userData: Partial<User>): User {
    this.checkPermission('update');
    const user = this.userService.update(parseInt(id, 10), userData);
    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }
    return user;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { message: string } {
    this.checkPermission('remove');
    const success = this.userService.remove(parseInt(id, 10));
    if (!success) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }
    return { message: `用户 ID ${id} 已删除` };
  }
}
```

### 4. 创建用户模块

```typescript
// src/modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from '../../controllers/user.controller';
import { UserService } from '../../services/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### 5. 更新应用模块

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 6. 测试权限系统

```typescript
// src/controllers/metadata.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { getPermissions, getRoles } from '../decorators/permission.decorator';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly userService: UserService) {}

  @Get('roles')
  getRolesMetadata() {
    const roles = getRoles(this.userService.constructor);
    return {
      service: 'UserService',
      roles: roles,
      message: '这是通过 Reflect.getMetadata 从类元数据中获取的角色信息',
    };
  }

  @Get('permissions/:method')
  getPermissionsMetadata(@Param('method') method: string) {
    const permissions = getPermissions(this.userService, method);
    return {
      service: 'UserService',
      method: method,
      permissions: permissions,
      message: '这是通过 Reflect.getMetadata 从方法元数据中获取的权限信息',
    };
  }
}
```

## 常见问题与解决方案

### 1. Reflect 元数据不工作

**问题**：使用 `Reflect.getMetadata` 获取不到元数据，返回 `undefined`。

**原因**：没有导入 `reflect-metadata` 库。

**解决方案**：在应用程序的入口文件（通常是 `main.ts`）中导入 `reflect-metadata`：

```typescript
// main.ts
import 'reflect-metadata';  // 必须在所有其他导入之前
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

### 2. 装饰器不生效

**问题**：自定义装饰器没有按预期工作。

**原因**：
- 装饰器工厂函数没有返回装饰器函数
- 装饰器函数没有返回描述符对象

**解决方案**：

```typescript
// 错误的装饰器
export const MyDecorator = (value: string) => {
  // 缺少返回装饰器函数
};

// 正确的装饰器
export const MyDecorator = (value: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 装饰器逻辑
    return descriptor;  // 必须返回描述符
  };
};
```

### 3. 依赖注入失败

**问题**：服务无法注入，出现 "Cannot resolve dependency" 错误。

**原因**：
- 服务没有用 `@Injectable()` 装饰器标记
- 服务没有在模块的 `providers` 数组中注册
- 模块没有正确导入

**解决方案**：

```typescript
// 确保服务用 @Injectable() 标记
@Injectable()
export class MyService {}

// 确保服务在模块中注册
@Module({
  providers: [MyService],
})
export class MyModule {}

// 确保模块正确导入
@Module({
  imports: [MyModule],
})
export class AppModule {}
```

### 4. 循环依赖

**问题**：两个服务相互依赖，导致循环依赖错误。

**原因**：Service A 依赖 Service B，同时 Service B 也依赖 Service A。

**解决方案**：
- 重构代码，消除循环依赖
- 使用 `forwardRef` 延迟引用：

```typescript
import { Injectable, forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class ServiceA {
  constructor(
    @Inject(forwardRef(() => ServiceB))
    private readonly serviceB: ServiceB,
  ) {}
}

@Injectable()
export class ServiceB {
  constructor(
    @Inject(forwardRef(() => ServiceA))
    private readonly serviceA: ServiceA,
  ) {}
}
```

### 5. 装饰器执行顺序

**问题**：多个装饰器应用于同一方法时，执行顺序不符合预期。

**原因**：装饰器的执行顺序是从下到上，从右到左。

**解决方案**：了解装饰器执行顺序，并据此设计装饰器：

```typescript
class MyClass {
  @Decorator1()
  @Decorator2()
  myMethod() {}
}

// 执行顺序：
// 1. Decorator2
// 2. Decorator1
```

### 6. 类型安全

**问题**：使用装饰器后，TypeScript 类型推断不准确。

**原因**：装饰器可能会影响类型推断。

**解决方案**：使用类型断言或泛型：

```typescript
// 使用类型断言
const userService = this.userService as UserService;

// 使用泛型
@Injectable()
export class MyService<T> {
  constructor(private readonly repository: Repository<T>) {}
}
```

## 总结

NestJS 是一个强大的框架，它结合了现代 JavaScript/TypeScript 特性和成熟的设计模式。通过理解装饰器、Reflect 元数据系统和依赖注入等核心概念，您可以构建可维护、可扩展的应用程序。

### 关键要点

1. **装饰器**：用于添加元数据和配置行为，是 NestJS 的核心特性
2. **Reflect 元数据**：用于存储和检索装饰器添加的元数据
3. **依赖注入**：实现控制反转，使代码更加模块化和可测试
4. **模块系统**：组织应用程序结构，实现关注点分离
5. **控制器和服务**：分离请求处理和业务逻辑

### 学习建议

1. 从简单的 CRUD 应用程序开始
2. 逐步添加装饰器和元数据功能
3. 实践依赖注入和模块化设计
4. 阅读官方文档和示例代码
5. 参与社区讨论和开源项目

希望这份指南能帮助您更好地理解和使用 NestJS 框架！