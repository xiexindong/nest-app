import 'reflect-metadata';

// 定义元数据键的常量
export const PERMISSION_KEY = Symbol('permission');
export const ROLES_KEY = Symbol('roles');

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
    return userPermissions.includes(permission);
  });
};

/**
 * 自定义角色装饰器
 * 使用Reflect存储角色信息到方法的元数据中
 * @param roles 角色数组
 */
export function Roles(...roles: string[]) {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): any {
    if (propertyKey && descriptor) {
      // 方法级别的角色装饰器
      Reflect.defineMetadata(ROLES_KEY, roles, target, propertyKey);
      return descriptor;
    } else {
      // 类级别的角色装饰器
      Reflect.defineMetadata(ROLES_KEY, roles, target);
      return target;
    }
  };
}

/**
 * 获取类或方法的角色信息
 * 使用Reflect.getMetadata从类或方法的元数据中获取角色信息
 * @param target 目标对象
 * @param propertyKey 方法名（可选）
 */
export const getRoles = (
  target: any,
  propertyKey?: string | symbol,
): string[] => {
  if (propertyKey) {
    // 获取方法的角色信息
    return (
      (Reflect.getMetadata(ROLES_KEY, target, propertyKey) as string[]) || []
    );
  } else {
    // 获取类的角色信息
    return (Reflect.getMetadata(ROLES_KEY, target) as string[]) || [];
  }
};

/**
 * 检查用户是否有角色执行某个方法
 * 使用Reflect.hasMetadata检查方法是否有角色元数据
 * @param target 目标对象
 * @param propertyKey 方法名
 * @param userRole 用户角色
 */
export const hasRole = (
  target: any,
  propertyKey: string | symbol,
  userRole: string,
): boolean => {
  // 先检查方法级别的角色要求
  const methodRoles = getRoles(target, propertyKey);
  if (methodRoles.length > 0) {
    return methodRoles.includes(userRole);
  }

  // 再检查类级别的角色要求
  if (target && typeof target === 'object' && 'constructor' in target) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const classRoles = getRoles(Object.getPrototypeOf(target).constructor);
    if (classRoles.length > 0) {
      return classRoles.includes(userRole);
    }
  }

  // 如果没有设置角色要求，默认允许访问
  return true;
};

/**
 * 检查用户是否有权限和角色执行某个方法
 * 结合权限检查和角色检查
 * @param target 目标对象
 * @param propertyKey 方法名
 * @param userRole 用户角色
 * @param userPermissions 用户权限数组
 */
export const hasAccess = (
  target: any,
  propertyKey: string | symbol,
  userRole: string,
  userPermissions: string[],
): boolean => {
  // 角色检查
  const hasRoleAccess = hasRole(target, propertyKey, userRole);
  if (!hasRoleAccess) {
    return false;
  }

  // 权限检查
  return hasPermission(target, propertyKey, userPermissions);
};
