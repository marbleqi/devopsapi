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
} from '../auth';

@Injectable()
export class KongService implements OnApplicationBootstrap {
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
    const main = { pid: 500, moduleName: 'KONG', type: '对象' };
    // KONG管理
    this.abilityService.add([
      {
        id: main.pid,
        pid: 0,
        name: main.moduleName,
        description: 'KONG管理',
        type: '模块',
        moduleName: main.moduleName,
      },
    ] as Ability[]);
    [
      { id: 510, name: '站点', description: '站点管理' },
      { id: 520, name: '授权', description: '授权管理' },
      { id: 530, name: '路由', description: '路由管理' },
      { id: 540, name: '服务', description: '服务管理' },
      { id: 550, name: '用户', description: '用户管理' },
      { id: 560, name: '证书', description: '证书管理' },
      { id: 570, name: '上游', description: '上游管理' },
      { id: 580, name: '目标', description: '目标管理' },
      { id: 590, name: '插件', description: '插件管理' },
    ].map((item) =>
      this.abilityService.add([
        { ...main, ...item, objectName: item.name },
      ] as Ability[]),
    );
  }

  /**初始化 */
  async onApplicationBootstrap() {
    const kongAuth = await this.menuService.get('kong');
    let pMenuId: number;
    const params = {
      updateUserId: 1,
      updateAt: Date.now(),
      createUserId: 1,
      createAt: Date.now(),
    };
    if (kongAuth) {
      pMenuId = kongAuth.menuId;
    } else {
      const result = await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId: 0,
        link: 'kong',
        config: {
          text: 'KONG管理',
          description: 'KONG管理',
          reuse: true,
          isLeaf: false,
          icon: 'form',
        } as MenuConfig,
        abilities: [500],
      });
      pMenuId = Number(result.identifiers[0].menuId);
    }
    const menuList = [
      {
        ...params,
        pMenuId,
        link: '/kong/host',
        config: {
          text: '站点',
          description: '站点',
          reuse: true,
          isLeaf: true,
          icon: 'unordered-list',
        } as MenuConfig,
        abilities: [510],
      },
      {
        ...params,
        pMenuId,
        link: '/kong/grant',
        config: {
          text: '授权',
          description: '授权',
          reuse: true,
          isLeaf: true,
          icon: 'copyright',
        } as MenuConfig,
        abilities: [520],
      },
      {
        ...params,
        pMenuId,
        link: '/kong/new',
        config: {
          text: '新建代理',
          description: '创建服务及路由',
          reuse: true,
          isLeaf: true,
          icon: 'plus',
        } as MenuConfig,
        abilities: [530],
      },
      {
        ...params,
        pMenuId,
        link: '/kong/route',
        config: {
          text: '路由',
          description: '路由',
          reuse: true,
          isLeaf: true,
          icon: 'menu',
        } as MenuConfig,
        abilities: [530],
      },
      {
        ...params,
        pMenuId,
        link: '/kong/service',
        config: {
          text: '服务',
          description: '服务',
          reuse: true,
          isLeaf: true,
          icon: 'api',
        } as MenuConfig,
        abilities: [540],
      },
      {
        ...params,
        pMenuId,
        link: '/kong/consumer',
        config: {
          text: '用户',
          description: '用户',
          reuse: true,
          isLeaf: true,
          icon: 'user',
        } as MenuConfig,
        abilities: [550],
      },
      {
        ...params,
        pMenuId,
        link: '/kong/certificate',
        config: {
          text: '证书',
          description: '证书',
          reuse: true,
          isLeaf: true,
          icon: 'user',
        } as MenuConfig,
        abilities: [560],
      },
      {
        ...params,
        pMenuId,
        link: '/kong/upstream',
        config: {
          text: '上游',
          description: '上游',
          reuse: true,
          isLeaf: true,
          icon: 'car',
        } as MenuConfig,
        abilities: [560],
      },
      {
        ...params,
        pMenuId,
        link: '/kong/target',
        config: {
          text: '目标',
          description: '目标',
          reuse: true,
          isLeaf: true,
          icon: 'aim',
        } as MenuConfig,
        abilities: [580],
      },
      {
        ...params,
        pMenuId,
        link: '/kong/plugin',
        config: {
          text: '插件',
          description: '插件',
          reuse: true,
          isLeaf: true,
          icon: 'mac-command',
        } as MenuConfig,
        abilities: [590],
      },
    ];
    for (const menuItem of menuList) {
      await this.menuService.set(menuItem);
    }
  }
}
