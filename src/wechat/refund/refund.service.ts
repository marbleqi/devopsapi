// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  MoreThan,
} from 'typeorm';
// 内部依赖
import { Result, OperateService, CommonService } from '../../shared';
import { RefundDto, WechatRefundEntity } from '..';

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
    private readonly operateService: OperateService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * 获取商家清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'mchid',
      'appid',
      'status',
      'orderId',
      'updateUserId',
      'updateAt',
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
    const operateId = await this.operateService.insert('wechat_refund');
    const result = await this.entityManager.insert(WechatRefundEntity, {
      ...value,
      operateId,
      reqId,
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      return { code: 0, msg: '商家创建完成', operateId, reqId };
    } else {
      return { code: 400, msg: '商家创建失败', operateId, reqId };
    }
  }
}
