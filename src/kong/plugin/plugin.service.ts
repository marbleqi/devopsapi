// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// 内部依赖
import { Result } from '../../shared';
import { HostService } from '..';

@Injectable()
export class PluginService {
  /**
   * 构造函数
   */
  constructor(
    private readonly clientService: HttpService,
    private readonly hostService: HostService,
  ) {}

  async plugin(hostId: number): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    let result: any = await this.hostService.show(hostId);
    if (result.code) {
      return result;
    }
    result = await firstValueFrom(
      this.clientService.get(`${result.data.url}/plugins/enabled`, {
        validateStatus: () => true,
      }),
    );
    if (result.data.enabled_plugins.length === 0) {
      return { code: 404, msg: '无可用插件！' };
    }
    return { code: 0, msg: 'ok', data: result.data.enabled_plugins };
  }
}
