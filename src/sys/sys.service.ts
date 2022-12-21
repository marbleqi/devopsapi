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
export class SysService implements OnApplicationBootstrap {
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
    const main = { pid: 200, moduleName: '系统', type: '对象' };
    // 系统管理
    this.abilityService.add([
      {
        id: main.pid,
        pid: 0,
        name: main.moduleName,
        description: '系统模块',
        type: '模块',
        moduleName: main.moduleName,
      },
    ] as Ability[]);
    [
      { id: 210, name: '配置', description: '配置管理' },
      { id: 220, name: '请求', description: '请求日志管理' },
      { id: 230, name: '队列', description: '队列管理' },
    ].map((item) =>
      this.abilityService.add([
        { ...main, ...item, objectName: item.name },
      ] as Ability[]),
    );
  }

  async onApplicationBootstrap() {
    const sysAuth = await this.menuService.get('sys');
    let pMenuId: number;
    const params = {
      updateUserId: 1,
      updateAt: Date.now(),
      createUserId: 1,
      createAt: Date.now(),
    };
    if (sysAuth) {
      pMenuId = sysAuth.menuId;
    } else {
      const result = await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId: 0,
        link: 'sys',
        config: {
          text: '系统管理',
          description: '系统管理',
          reuse: true,
          isLeaf: false,
          icon: 'form',
        } as MenuConfig,
        abilities: [200],
      });
      pMenuId = Number(result.identifiers[0].menuId);
    }
    const menuList = [
      {
        ...params,
        pMenuId,
        link: '/sys/setting',
        orderId: 1,
        config: {
          text: '参数设置',
          description: '参数设置',
          reuse: true,
          isLeaf: true,
          icon: 'form',
        } as MenuConfig,
        abilities: [210],
      },
      {
        ...params,
        pMenuId,
        link: '/sys/req',
        orderId: 2,
        config: {
          text: '日志管理',
          description: '日志管理',
          reuse: true,
          isLeaf: true,
          icon: 'unordered-list',
        } as MenuConfig,
        abilities: [220],
      },
      {
        ...params,
        pMenuId,
        link: '/sys/queue',
        orderId: 3,
        config: {
          text: '队列管理',
          description: '队列管理',
          reuse: true,
          isLeaf: true,
          icon: 'ordered-list',
        } as MenuConfig,
        abilities: [230],
      },
    ];
    for (const menuItem of menuList) {
      await this.menuService.set(menuItem);
    }
  }
}
