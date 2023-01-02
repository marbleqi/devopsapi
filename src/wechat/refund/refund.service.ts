// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { format } from 'date-fns';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  MoreThan,
} from 'typeorm';
// 内部依赖
import { Result, OperateService, CommonService } from '../../shared';
import {
  RefundDto,
  WechatRefundEntity,
  MerchantService,
  WechatService,
} from '..';

@Injectable()
export class RefundService {
  /**
   * 构造函数
   * @param entityManager 实体管理器
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly clientService: HttpService,
    private readonly operateService: OperateService,
    private readonly commonService: CommonService,
    private readonly merchantService: MerchantService,
    private readonly wechatService: WechatService,
  ) {}

  /**
   * 获取商家清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'refund_id',
      'out_refund_no',
      'amount',
      'status',
      'createUserId',
      'createAt',
      'operateId',
    ] as FindOptionsSelect<WechatRefundEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<WechatRefundEntity>;
    return await this.commonService.index(WechatRefundEntity, select, where);
  }

  /**
   * 获取退款单详情
   * @param refund_id 退款单ID
   * @returns 响应消息
   */
  async show(refund_id: string): Promise<Result> {
    if (!refund_id) {
      return { code: 400, msg: '传入的退款单ID无效' };
    }
    /**用户对象 */
    const data: WechatRefundEntity = await this.entityManager.findOneBy(
      WechatRefundEntity,
      { refund_id },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到退款记录' };
    }
  }

  /**
   * 发起退款
   * @param value 提交的退款信息
   * @param updateUserId 创建退款的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: RefundDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const mch: any = await this.merchantService.show(value.mchid);
    if (mch.code) {
      return { code: 403, msg: '无效商家！' };
    }
    const method: 'GET' | 'POST' = 'POST';
    const url = `/v3/refund/domestic/refunds`;
    const body: any = {
      out_trade_no: value.out_trade_no,
      out_refund_no: value.mchid + format(new Date(), 'yyyyMMddHHmmssSSSS'),
      amount: {
        total: value.amount,
        refund: value.refund,
        currency: 'CNY',
      },
    };
    const params = { mchid: value.mchid, method, url, body };
    let result: any = await this.wechatService.sign(params);
    if (result.code) {
      return result;
    }
    // 签名成功，调用微信接口，发起退款
    const Authorization: string = result.data;
    result = await firstValueFrom(
      this.clientService.post(`https://api.mch.weixin.qq.com${url}`, body, {
        headers: { Authorization },
        validateStatus: () => true,
      }),
    );
    if (result.status !== 200) {
      return { code: result.status, msg: result.data.message };
    }
    const data = result.data;
    console.debug('退款结果', data);
    const operateId = await this.operateService.insert('wechat_refund');
    result = await this.entityManager.insert(WechatRefundEntity, {
      refund_id: data.refund_id,
      mchid: value.mchid,
      out_refund_no: data.out_refund_no,
      transaction_id: data.transaction_id,
      out_trade_no: data.out_trade_no,
      channel: data.channel,
      user_received_account: data.user_received_account,
      create_time: data.create_time,
      status: data.status,
      funds_account: data.funds_account,
      amount: data.amount,
      operateId,
      reqId,
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      return { code: 0, msg: '退款成功', operateId, reqId };
    } else {
      return { code: 204, msg: '退款记录失败', operateId, reqId };
    }
  }
}
