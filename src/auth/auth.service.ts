// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
// 内部依赖
import {
  Ability,
  MenuConfig,
  MenuEntity,
  AbilityService,
  MenuService,
} from '.';

/**认证服务 */
@Injectable()
export class AuthService implements OnApplicationBootstrap {
  /**
   * 构造函数
   * @param entityManager 实体管理器
   * @param abilityService 注入的权限点服务
   * @param menuService 注入的权限点服务
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly abilityService: AbilityService,
    private readonly menuService: MenuService,
  ) {
    console.debug('认证基础服务', this);
    const moduleName = '认证';
    const objectName = '模块';
    let type = '模块';
    // 认证模块权限点
    this.abilityService.add([
      {
        id: 100,
        pid: 0,
        name: '访问控制',
        description: '访问控制',
        type,
        moduleName,
        objectName,
      },
    ] as Ability[]);
    type = '菜单';
    // 认证模块权限点
    this.abilityService.add([
      {
        id: 100,
        pid: 0,
        name: '访问控制',
        description: '访问控制',
        moduleName: '认证',
        type: '模块',
      },
      {
        id: 110,
        pid: 100,
        name: '权限点',
        description: '权限点管理',
        moduleName: '认证',
        objectName: '权限点',
        type: '菜单',
      },
      {
        id: 120,
        pid: 100,
        name: '菜单',
        description: '菜单管理',
        moduleName: '认证',
        objectName: '菜单',
        type: '菜单',
      },
      {
        id: 130,
        pid: 100,
        name: '角色',
        description: '角色管理',
        moduleName: '认证',
        objectName: '角色',
        type: '菜单',
      },
      {
        id: 140,
        pid: 100,
        name: '用户',
        description: '用户管理',
        moduleName: '认证',
        objectName: '用户',
        type: '菜单',
      },
      {
        id: 150,
        pid: 100,
        name: '令牌',
        description: '令牌管理',
        moduleName: '认证',
        objectName: '令牌',
        type: '菜单',
      },
    ] as Ability[]);
  }

  async onApplicationBootstrap() {
    const menuAuth = await this.menuService.get('auth');
    let pMenuId: number;
    const params = {
      updateUserId: 1,
      updateAt: Date.now(),
      createUserId: 1,
      createAt: Date.now(),
    };
    if (menuAuth) {
      pMenuId = menuAuth.menuId;
    } else {
      const result = await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId: 0,
        link: 'auth',
        config: {
          text: '访问控制',
          description: '访问控制',
          reuse: true,
          isLeaf: false,
          icon: 'form',
        } as MenuConfig,
        abilities: [100],
      });
      pMenuId = Number(result.identifiers[0].menuId);
    }
    const menuList = [
      {
        ...params,
        pMenuId,
        link: '/auth/ability',
        orderId: 1,
        config: {
          text: '权限点管理',
          description: '权限点管理',
          reuse: true,
          isLeaf: true,
          icon: 'safety-certificate',
        } as MenuConfig,
        abilities: [110],
      },
      {
        ...params,
        pMenuId,
        link: '/auth/menu',
        orderId: 2,
        config: {
          text: '菜单管理',
          description: '菜单管理',
          reuse: true,
          isLeaf: true,
          icon: 'menu',
        } as MenuConfig,
        abilities: [120],
      },
      {
        ...params,
        pMenuId,
        link: '/auth/role',
        orderId: 3,
        config: {
          text: '角色管理',
          description: '角色管理',
          reuse: true,
          isLeaf: true,
          icon: 'team',
        } as MenuConfig,
        abilities: [130],
      },
      {
        ...params,
        pMenuId,
        link: '/auth/user',
        orderId: 4,
        config: {
          text: '用户管理',
          description: '用户管理',
          reuse: true,
          isLeaf: true,
          icon: 'user',
        } as MenuConfig,
        abilities: [140],
      },
      {
        ...params,
        pMenuId,
        link: '/auth/token',
        orderId: 5,
        config: {
          text: '令牌管理',
          description: '令牌管理',
          reuse: true,
          isLeaf: true,
          icon: 'key',
        } as MenuConfig,
        abilities: [150],
      },
    ];
    for (const menuItem of menuList) {
      await this.menuService.set(menuItem);
    }
  }
}
