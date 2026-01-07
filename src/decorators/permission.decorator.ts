import 'reflect-metadata';

// 定义元数据键的常量
export const PERMISSION_KEY = Symbol('permission');

/**
 * 自定义权限装饰器
 * 使用Reflect存储权限信息到方法的元数据中
 * @param permissions 权限数组
 */
export const Permissions = (...permissions: string[]) => {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    // 使用Reflect.defineMetadata将权限信息存储到方法的元数据中
    Reflect.defineMetadata(PERMISSION_KEY, permissions, target, propertyKey);
    return descriptor;
  };
};

/**
 * 获取方法的权限信息
 * 使用Reflect.getMetadata从方法的元数据中获取权限信息
 * @param target 目标对象
 * @param propertyKey 方法名
 */
export const getPermissions = (
  target: any,
  propertyKey: string | symbol,
): string[] => {
  // 使用Reflect.getMetadata获取方法的权限信息
  // 如果没有设置权限要求，默认返回空数组
  return (
    (Reflect.getMetadata(PERMISSION_KEY, target, propertyKey) as string[]) || []
  );
};

/**
 * 检查用户是否有权限执行某个方法
 * 使用Reflect.hasMetadata检查方法是否有权限元数据
 * @param target 目标对象
 * @param propertyKey 方法名
 * @param userPermissions 用户权限数组
 */
export const hasPermission = (
  target: any,
  propertyKey: string | symbol,
  userPermissions: string[],
): boolean => {
  // 使用Reflect.hasMetadata检查方法是否有权限元数据
  if (!Reflect.hasMetadata(PERMISSION_KEY, target, propertyKey)) {
    return true; // 如果没有设置权限要求，默认允许访问
  }

  const requiredPermissions = getPermissions(target, propertyKey);
  // 检查用户是否拥有所需权限中的任意一个
  return requiredPermissions.some((permission) => {
    console.log('permission', permission);
    return userPermissions.includes(permission);
  });
};

/**
 * 自定义角色装饰器
 * 使用Reflect存储角色信息到类的元数据中
 * @param roles 角色数组
 */
export const Roles = (...roles: string[]) => {
  return (target: any) => {
    // 使用Reflect.defineMetadata将角色信息存储到类的元数据中
    Reflect.defineMetadata('roles', roles, target);
  };
};

/**
 * 获取类的角色信息
 * 使用Reflect.getMetadata从类的元数据中获取角色信息
 * @param target 目标类
 */
export const getRoles = (target: any): string[] => {
  // 使用Reflect.getMetadata获取类的角色信息
  return (Reflect.getMetadata('roles', target) as string[]) || [];
};
