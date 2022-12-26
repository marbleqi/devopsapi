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
export class WechatService implements OnApplicationBootstrap {
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
    const main = { pid: 600, moduleName: '微信', type: '对象' };
    // KONG管理
    this.abilityService.add([
      {
        id: main.pid,
        pid: 0,
        name: main.moduleName,
        description: '微信',
        type: '模块',
        moduleName: main.moduleName,
      },
    ] as Ability[]);
    [
      { id: 610, name: '企业', description: '企业管理' },
      { id: 620, name: '商家', description: '商家管理' },
      { id: 630, name: '订单', description: '订单管理' },
      { id: 640, name: '退款', description: '退款管理' },
      { id: 650, name: '投诉', description: '投诉管理' },
    ].map((item) =>
      this.abilityService.add([
        { ...main, ...item, objectName: item.name },
      ] as Ability[]),
    );
  }

  /**初始化 */
  async onApplicationBootstrap() {
    const wechatAuth = await this.menuService.get('wechat');
    let pMenuId: number;
    const params = {
      updateUserId: 1,
      updateAt: Date.now(),
      createUserId: 1,
      createAt: Date.now(),
    };
    if (wechatAuth) {
      pMenuId = wechatAuth.menuId;
    } else {
      const result = await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId: 0,
        link: 'wechat',
        config: {
          text: '微信',
          description: '微信管理',
          reuse: true,
          isLeaf: false,
          icon: 'wechat',
        } as MenuConfig,
        abilities: [600],
      });
      pMenuId = Number(result.identifiers[0].menuId);
    }
    const menuList = [
      {
        ...params,
        pMenuId,
        link: '/wechat/company',
        config: {
          text: '企业',
          description: '企业',
          reuse: true,
          isLeaf: true,
          icon: 'shop',
        } as MenuConfig,
        abilities: [610],
      },
      {
        ...params,
        pMenuId,
        link: '/wechat/merchant',
        config: {
          text: '商家',
          description: '商家',
          reuse: true,
          isLeaf: true,
          icon: 'shopping-cart',
        } as MenuConfig,
        abilities: [620],
      },
      {
        ...params,
        pMenuId,
        link: '/wechat/order',
        config: {
          text: '订单',
          description: '订单',
          reuse: true,
          isLeaf: true,
          icon: 'file-protect',
        } as MenuConfig,
        abilities: [630],
      },
      {
        ...params,
        pMenuId,
        link: '/wechat/refund',
        config: {
          text: '退款',
          description: '退款',
          reuse: true,
          isLeaf: true,
          icon: 'file-sync',
        } as MenuConfig,
        abilities: [640],
      },
      {
        ...params,
        pMenuId,
        link: '/wechat/complaint',
        config: {
          text: '投诉',
          description: '投诉',
          reuse: true,
          isLeaf: true,
          icon: 'alert',
        } as MenuConfig,
        abilities: [650],
      },
    ];
    for (const menuItem of menuList) {
      await this.menuService.set(menuItem);
    }
  }
}
