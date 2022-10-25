// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// 内部依赖
import { WxworkService } from '..';
@Injectable()
export class CheckinService {
  /**
   * 构造函数
   * @param client 注入的http服务
   * @param pg 注入的数据库服务
   * @param redis 注入的缓存服务
   * @param wxwork 注入的企业微信服务
   */
  constructor(
    private readonly client: HttpService,
    private readonly wxwork: WxworkService,
  ) {}

  async index(value: any) {
    console.debug('value', value);
    /**应用凭证 */
    const access_token = await this.wxwork.token('checkin');
    /**请求结果 */
    const result = await firstValueFrom(
      this.client.post(
        'https://qyapi.weixin.qq.com/cgi-bin/checkin/getcheckindata',
        value,
        { params: { access_token } },
      ),
    );
    if (result.data.errcode) {
      return { code: result.data.errcode, msg: result.data.errmsg };
    } else {
      return {
        code: 0,
        msg: 'ok',
        data: result.data.checkindata,
      };
    }
  }
}
