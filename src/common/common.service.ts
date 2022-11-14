import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
// 内部依赖
import { MenuConfig, MenuEntity, MenuService } from '../auth';

@Injectable()
export class CommonService implements OnApplicationBootstrap {
  /**
   * 构造函数
   * @param entityManager 实体管理器
   * @param menuService 注入的权限点服务
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly menuService: MenuService,
  ) {}

  async onApplicationBootstrap() {
    const commonAuth = await this.menuService.get('common');
    if (!commonAuth) {
      const params = {
        updateUserId: 1,
        updateAt: Date.now(),
        createUserId: 1,
        createAt: Date.now(),
      };
      const result = await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId: 0,
        link: 'common',
        config: {
          text: '常用',
          description: '常用功能',
          reuse: true,
          isLeaf: false,
          icon: 'coffee',
        } as MenuConfig,
        abilities: [],
      });
      const pMenuId = Number(result.identifiers[0].menuId);
      await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId,
        link: '/common/home',
        config: {
          text: '导航',
          description: '导航',
          reuse: true,
          isLeaf: true,
          icon: 'appstore',
        } as MenuConfig,
        abilities: [],
      });
    }
  }
}
