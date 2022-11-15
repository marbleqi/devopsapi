// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectEntityManager } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { EntityManager } from 'typeorm';
// 内部依赖
import { RedisService, SettingService } from '../shared';
import {
  Ability,
  AbilityService,
  MenuConfig,
  MenuEntity,
  MenuService,
} from '../auth';

@Injectable()
export class DingtalkService implements OnApplicationBootstrap {
  /**
   * 构造函数
   * @param clientService 注入的http服务
   * @param abilityService 注入的权限点服务
   * @param redisService 注入的缓存服务
   * @param settingService 注入的配置服务
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly clientService: HttpService,
    private readonly abilityService: AbilityService,
    private readonly redisService: RedisService,
    private readonly settingService: SettingService,
    private readonly menuService: MenuService,
  ) {
    // 系统管理
    this.abilityService.add([
      { id: 400, pid: 0, name: '钉钉', description: '钉钉管理' },
      { id: 410, pid: 400, name: '钉钉配置', description: '配置钉钉参数' },
      { id: 430, pid: 400, name: '钉钉用户管理', description: '钉钉用户管理' },
    ] as Ability[]);
  }

  async onApplicationBootstrap() {
    const dingtalkAuth = await this.menuService.get('dingtalk');
    let pMenuId: number;
    const params = {
      updateUserId: 1,
      updateAt: Date.now(),
      createUserId: 1,
      createAt: Date.now(),
    };
    if (dingtalkAuth) {
      pMenuId = dingtalkAuth.menuId;
    } else {
      const result = await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId: 0,
        link: 'dingtalk',
        config: {
          text: '钉钉',
          description: '钉钉',
          reuse: true,
          isLeaf: false,
          icon: 'coffee',
        } as MenuConfig,
        abilities: [400],
      });
      pMenuId = Number(result.identifiers[0].menuId);
    }
    const menuList = [
      {
        ...params,
        pMenuId,
        link: '/dingtalk/setting',
        config: {
          text: '参数设置',
          description: '参数设置',
          reuse: true,
          isLeaf: true,
          icon: 'unordered-list',
        } as MenuConfig,
        abilities: [410],
      },
      {
        ...params,
        pMenuId,
        link: '/dingtalk/user',
        config: {
          text: '用户',
          description: '用户',
          reuse: true,
          isLeaf: true,
          icon: 'user',
        } as MenuConfig,
        abilities: [430],
      },
    ];
    for (const menuItem of menuList) {
      await this.menuService.set(menuItem);
    }
  }

  /**
   * 获取钉钉应用凭证
   * @param cache 是否应用缓存，默认true
   * @returns 应用凭证
   */
  async token(cache = true): Promise<string> {
    if (cache) {
      /**应用凭证 */
      const token: string = await this.redisService.get(`dingtalk`);
      // 如果应用凭证已缓存，则直接使用缓存的凭证
      if (token) {
        return token;
      }
    }
    // 如果不使用缓存，或应用凭证不存在，则重新获取凭证
    /**钉钉配置 */
    const setting: object = this.settingService.read('dingtalk');
    console.debug('setting', setting);
    if (setting) {
      const result = await firstValueFrom(
        this.clientService.get('https://oapi.dingtalk.com/gettoken', {
          params: setting,
        }),
      );
      if (result.data.errcode === 0) {
        // 缓存应用凭证
        await this.redisService.set('dingtalk', result.data.access_token);
        // 设置缓存时间
        await this.redisService.expire('dingtalk', result.data.expires_in);
        // 返回缓存值
        return result.data.access_token;
      }
    }
    return null;
  }
}
