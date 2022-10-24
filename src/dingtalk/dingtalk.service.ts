// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// 内部依赖
import { RedisService, SettingService } from '../shared';
import { Ability, AbilityService } from '../auth';

@Injectable()
export class DingtalkService {
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
      { id: 400, pid: 0, name: '钉钉', description: '钉钉管理' },
      { id: 410, pid: 400, name: '钉钉配置', description: '配置钉钉参数' },
      { id: 430, pid: 400, name: '钉钉用户管理', description: '钉钉用户管理' },
    ] as Ability[]);
  }

  /**
   * 获取钉钉应用凭证
   * @param cache 是否应用缓存，默认true
   * @returns 应用凭证
   */
  async token(cache = true): Promise<string> {
    if (cache) {
      /**应用凭证 */
      const token: string = await this.redis.get(`dingtalk`);
      // 如果应用凭证已缓存，则直接使用缓存的凭证
      if (token) {
        return token;
      }
    }
    // 如果不使用缓存，或应用凭证不存在，则重新获取凭证
    /**钉钉配置 */
    const setting: object = this.setting.read('dingtalk');
    console.debug('setting', setting);
    if (setting) {
      const result = await firstValueFrom(
        this.client.get('https://oapi.dingtalk.com/gettoken', {
          params: setting,
        }),
      );
      if (result.data.errcode === 0) {
        // 缓存应用凭证
        await this.redis.set('dingtalk', result.data.access_token);
        // 设置缓存时间
        await this.redis.expire('dingtalk', result.data.expires_in);
        // 返回缓存值
        return result.data.access_token;
      }
    }
    return null;
  }
}
