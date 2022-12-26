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
export class KubernetesService implements OnApplicationBootstrap {
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
    const main = { pid: 2000, moduleName: 'Kubernetes', type: '对象' };
    // 系统管理
    this.abilityService.add([
      {
        id: main.pid,
        pid: 0,
        name: main.moduleName,
        description: 'Kubernetes',
        type: '模块',
        moduleName: main.moduleName,
      },
    ] as Ability[]);
    [
      { id: 2010, name: '集群', description: '集群管理' },
      { id: 2020, name: '节点', description: '节点管理' },
      { id: 2030, name: '命名空间', description: '命名空间管理' },
    ].map((item) =>
      this.abilityService.add([
        { ...main, ...item, objectName: item.name },
      ] as Ability[]),
    );
  }

  async onApplicationBootstrap() {
    const sysAuth = await this.menuService.get('kubernetes');
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
        link: 'kubernetes',
        config: {
          text: '集群管理',
          description: '集群管理',
          reuse: true,
          isLeaf: false,
          icon: 'form',
        } as MenuConfig,
        abilities: [2000],
      });
      pMenuId = Number(result.identifiers[0].menuId);
    }
    const menuList = [
      {
        ...params,
        pMenuId,
        link: '/kubernetes/cluster',
        orderId: 1,
        config: {
          text: '集群',
          description: '集群',
          reuse: true,
          isLeaf: true,
          icon: 'trophy',
        } as MenuConfig,
        abilities: [2010],
      },
      {
        ...params,
        pMenuId,
        link: '/kubernetes/node',
        orderId: 2,
        config: {
          text: '节点',
          description: '节点',
          reuse: true,
          isLeaf: true,
          icon: 'select',
        } as MenuConfig,
        abilities: [2020],
      },
      {
        ...params,
        pMenuId,
        link: '/kubernetes/namespace',
        orderId: 3,
        config: {
          text: '命名空间',
          description: '命名空间',
          reuse: true,
          isLeaf: true,
          icon: 'namespace',
        } as MenuConfig,
        abilities: [2030],
      },
    ];
    for (const menuItem of menuList) {
      await this.menuService.set(menuItem);
    }
  }
}
