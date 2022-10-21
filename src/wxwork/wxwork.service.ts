// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// 内部依赖
import { RedisService, SettingService } from '../shared';
import { Ability, AbilityService } from '../auth';

/**企业微信服务 */
@Injectable()
export class WxworkService {
  /**
   * 构造函数
   * @param client 注入的http服务
   * @param ability 注入的权限点服务
   * @param redis 注入的缓存服务
   * @param setting 注入的配置服务
   */
  constructor(
    private readonly client: HttpService,
    private readonly ability: AbilityService,
    private readonly redis: RedisService,
    private readonly setting: SettingService,
  ) {
    // 系统管理
    this.ability.add([
      { id: 300, pid: 0, name: '企业微信', description: '企业微信管理' },
      {
        id: 310,
        pid: 300,
        name: '企业微信配置',
        description: '配置企业微信参数',
      },
      {
        id: 320,
        pid: 300,
        name: '企业微信部门管理',
        description: '企业微信部门管理',
      },
      {
        id: 330,
        pid: 300,
        name: '企业微信用户管理',
        description: '企业微信用户管理',
      },
      {
        id: 340,
        pid: 300,
        name: '工作日管理',
        description: '工作日管理',
      },
      {
        id: 350,
        pid: 300,
        name: '打卡管理',
        description: '打卡管理',
      },
      {
        id: 360,
        pid: 300,
        name: '机器人管理',
        description: '机器人管理',
      },
    ] as Ability[]);
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
      const token: string = await this.redis.get(`wxwork:${app}`);
      // 如果应用凭证已缓存，则直接使用缓存的凭证
      if (token) {
        return token;
      }
    }
    // 如果不使用缓存，或应用凭证不存在，则重新获取凭证
    /**企业微信配置 */
    const setting: object = this.setting.read('wxwork');
    if (setting) {
      /**企业ID */
      const corpId: string = setting['corpid'];
      /**应用Secret */
      const corpsecret: string = setting[app]['secret'];
      const params = { corpId, corpsecret };
      /**接口结果 */
      const result: any = await firstValueFrom(
        this.client.get('https://qyapi.weixin.qq.com/cgi-bin/gettoken', {
          params,
        }),
      );
      if (result.data.errcode === 0) {
        // 缓存应用凭证
        await this.redis.set(`wxwork:${app}`, result.data.access_token);
        // 设置缓存时间
        await this.redis.expire(`wxwork:${app}`, result.data.expires_in);
        // 返回缓存值
        return result.data.access_token;
      }
    }
    return null;
  }
}
