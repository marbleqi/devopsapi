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

/**企业微信服务 */
@Injectable()
export class WxworkService implements OnApplicationBootstrap {
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
    const main = { pid: 300, moduleName: '企业微信', type: '对象' };
    // 企业微信
    this.abilityService.add([
      {
        id: main.pid,
        pid: 0,
        name: main.moduleName,
        description: '企业微信',
        type: '模块',
        moduleName: main.moduleName,
      },
    ] as Ability[]);
    [
      { id: 310, name: '企业微信配置', description: '企业微信配置' },
      { id: 320, name: '企业微信部门', description: '企业微信部门' },
      { id: 330, name: '企业微信用户', description: '企业微信用户' },
      { id: 340, name: '工作日管理', description: '工作日管理' },
      { id: 350, name: '打卡管理', description: '打卡管理' },
      { id: 360, name: '机器人管理', description: '机器人管理' },
    ].map((item) =>
      this.abilityService.add([
        { ...main, ...item, objectName: item.name },
      ] as Ability[]),
    );
  }

  async onApplicationBootstrap() {
    const wxworkAuth = await this.menuService.get('wxwork');
    let pMenuId: number;
    const params = {
      updateUserId: 1,
      updateAt: Date.now(),
      createUserId: 1,
      createAt: Date.now(),
    };
    if (wxworkAuth) {
      pMenuId = wxworkAuth.menuId;
    } else {
      const result = await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId: 0,
        link: 'wxwork',
        config: {
          text: '企业微信',
          description: '企业微信',
          reuse: true,
          isLeaf: false,
          icon: 'coffee',
        } as MenuConfig,
        abilities: [300],
      });
      pMenuId = Number(result.identifiers[0].menuId);
    }
    const menuList = [
      {
        ...params,
        pMenuId,
        link: '/wxwork/setting',
        config: {
          text: '参数设置',
          description: '参数设置',
          reuse: true,
          isLeaf: true,
          icon: 'unordered-list',
        } as MenuConfig,
        abilities: [310],
      },
      {
        ...params,
        pMenuId,
        link: '/wxwork/user',
        config: {
          text: '用户',
          description: '用户',
          reuse: true,
          isLeaf: true,
          icon: 'user',
        } as MenuConfig,
        abilities: [330],
      },
    ];
    for (const menuItem of menuList) {
      await this.menuService.set(menuItem);
    }
  }

  /**
   * 获取企业微信应用凭证
   * @param app 应用类型
   * @param cache 是否应用缓存，默认true
   * @returns 应用凭证
   */
  async token(app: string, cache = true): Promise<string> {
    // 默认使用缓存中的凭证
    if (cache) {
      /**应用凭证 */
      const token: string = await this.redisService.get(`wxwork:${app}`);
      // 如果应用凭证已缓存，则直接使用缓存的凭证
      if (token) {
        return token;
      }
    }
    // 如果不使用缓存，或应用凭证不存在，则重新获取凭证
    /**企业微信配置 */
    const setting: object = this.settingService.read('wxwork');
    if (setting) {
      /**企业ID */
      const corpid: string = setting['corpid'];
      /**应用Secret */
      const corpsecret: string = setting[app]['secret'];
      const params = { corpid, corpsecret };
      /**接口结果 */
      const result: any = await firstValueFrom(
        this.clientService.get('https://qyapi.weixin.qq.com/cgi-bin/gettoken', {
          params,
        }),
      );
      if (result.data.errcode === 0) {
        // 缓存应用凭证
        await this.redisService.set(`wxwork:${app}`, result.data.access_token);
        // 设置缓存时间
        await this.redisService.expire(`wxwork:${app}`, result.data.expires_in);
        // 返回缓存值
        return result.data.access_token;
      }
    }
    return null;
  }
}
