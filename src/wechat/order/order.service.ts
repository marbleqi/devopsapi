// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { format } from 'date-fns';
// 内部依赖
import { Result } from '../../shared';
import { WechatService } from '..';

@Injectable()
export class OrderService {
  /**
   * 构造函数
   * @param clientService http服务
   * @param WechatService 微信服务
   */
  constructor(
    private readonly clientService: HttpService,
    private readonly wechatService: WechatService,
  ) {}

  /**
   * 获取订单详情
   * @param value 订单条件
   * @returns 响应消息
   */
  async show(value: {
    mchid: string;
    orderType: 'out_trade_no' | 'transaction_id';
    orderId: string;
  }): Promise<Result> {
    const method: 'GET' | 'POST' = 'GET';
    let url: string;
    if (value.orderType === 'out_trade_no') {
      url = `/v3/pay/transactions/out-trade-no/${value.orderId}?mchid=${value.mchid}`;
    } else {
      url = `/v3/pay/transactions/id/${value.orderId}?mchid=${value.mchid}`;
    }
    const body = '';
    const params = { mchid: value.mchid, method, url, body };
    let result: any = await this.wechatService.sign(params);
    if (result.code !== 0) {
      return result;
    }
    // 签名成功，调用微信接口，查询订单
    const Authorization: string = result.data;
    result = await firstValueFrom(
      this.clientService.get(`https://api.mch.weixin.qq.com${url}`, {
        headers: { Authorization },
        validateStatus: () => true,
      }),
    );
    console.debug('订单接口结果', result.data);
    if (result.status === 200) {
      return {
        code: 0,
        msg: 'ok',
        data: {
          mchid: result.data.mchid,
          transaction_id: result.data.transaction_id,
          out_trade_no: result.data.out_trade_no,
          success_time: format(
            new Date(result.data.success_time),
            'yyyy-MM-dd HH:mm:ss',
          ),
          trade_state: result.data.trade_state,
          trade_state_desc: result.data.trade_state_desc,
          amount: result.data.amount.total,
        },
      };
    }
    return { code: result.status, msg: result.data.message };
  }
}
