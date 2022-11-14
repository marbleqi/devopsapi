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
    // 用户管理
    this.abilityService.add([
      { id: 500, pid: 0, name: 'KONG管理', description: 'KONG管理' },
      { id: 510, pid: 500, name: '站点', description: '站点管理' },
      { id: 520, pid: 500, name: '路由', description: '路由管理' },
      { id: 530, pid: 500, name: '服务', description: '服务管理' },
      { id: 540, pid: 500, name: '用户', description: '用户管理' },
      { id: 550, pid: 500, name: '证书', description: '证书管理' },
      { id: 560, pid: 500, name: '上游', description: '上游管理' },
      { id: 570, pid: 500, name: '目标', description: '目标管理' },
      { id: 580, pid: 500, name: '插件', description: '插件管理' },
    ] as Ability[]);
  }

  /**初始化 */
  async onApplicationBootstrap() {
    console.debug('KONG服务初始化');
    const kongAuth = await this.menuService.get('kong');
    if (!kongAuth) {
      const params = {
        updateUserId: 1,
        updateAt: Date.now(),
        createUserId: 1,
        createAt: Date.now(),
      };
      const result = await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId: 0,
        link: 'kong',
        config: {
          text: '系统管理',
          description: '系统管理',
          reuse: true,
          isLeaf: false,
          icon: 'form',
        } as MenuConfig,
        abilities: [200],
      });
      const pMenuId = Number(result.identifiers[0].menuId);
      await this.entityManager.insert(MenuEntity, [
        {
          ...params,
          pMenuId,
          link: '/kong/host',
          config: {
            text: '站点',
            description: '站点',
            reuse: true,
            isLeaf: true,
            icon: 'form',
          } as MenuConfig,
          abilities: [210],
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
            icon: 'unordered-list',
          } as MenuConfig,
          abilities: [220],
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
            icon: 'ordered-list',
          } as MenuConfig,
          abilities: [230],
        },
      ]);
    }
  }
}
