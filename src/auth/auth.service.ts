// 外部依赖
import { Injectable } from '@nestjs/common';
// 内部依赖
import { Ability, AbilityService } from '.';

/**认证服务 */
@Injectable()
export class AuthService {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   */
  constructor(private readonly ability: AbilityService) {
    // 认证模块权限点
    this.ability.add([
      {
        id: 200,
        pid: 0,
        name: '访问控制',
        description: '访问控制',
        moduleName: '认证',
      },
      {
        id: 210,
        pid: 200,
        name: '权限点',
        description: '权限点管理',
        moduleName: '认证',
        objectName: '权限点',
      },
      {
        id: 220,
        pid: 200,
        name: '菜单',
        description: '菜单管理',
        moduleName: '认证',
        objectName: '菜单',
      },
      {
        id: 230,
        pid: 200,
        name: '角色',
        description: '角色管理',
        moduleName: '认证',
        objectName: '角色',
      },
      {
        id: 240,
        pid: 200,
        name: '用户',
        description: '用户管理',
        moduleName: '认证',
        objectName: '用户',
      },
      {
        id: 250,
        pid: 200,
        name: '令牌',
        description: '令牌管理',
        moduleName: '认证',
        objectName: '令牌',
      },
    ] as Ability[]);
  }
}
