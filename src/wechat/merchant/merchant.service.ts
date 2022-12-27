// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  MoreThan,
} from 'typeorm';
// 内部依赖
import { Result, OperateService, CommonService } from '../../shared';
import { MerchantDto, WechatMerchantEntity, WechatMerchantLogEntity } from '..';

@Injectable()
export class MerchantService {
  /**
   * 构造函数
   * @param entityManager 实体管理器
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
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
    ] as FindOptionsSelect<WechatMerchantEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<WechatMerchantEntity>;
    return await this.commonService.index(WechatMerchantEntity, select, where);
  }

  /**
   * 获取商家详情
   * @param mchid 商家ID
   * @returns 响应消息
   */
  async show(mchid: string): Promise<Result> {
    if (!mchid) {
      return { code: 400, msg: '传入的商家ID无效' };
    }
    /**用户对象 */
    const data: WechatMerchantEntity = await this.entityManager.findOneBy(
      WechatMerchantEntity,
      { mchid },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到商家微信' };
    }
  }

  /**
   * 获取商家变更日志
   * @param mchid 商家微信ID
   * @returns 响应消息
   */
  async log(mchid: string): Promise<Result> {
    if (!mchid) {
      return { code: 400, msg: '传入的商家微信ID无效' };
    }
    /**用户对象 */
    const data: WechatMerchantLogEntity[] = await this.entityManager.findBy(
      WechatMerchantLogEntity,
      { mchid },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到记录' };
    }
  }

  /**
   * 创建商家
   * @param value 提交的商家信息
   * @param updateUserId 创建商家的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: MerchantDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('wechat_merchant');
    const result = await this.entityManager.insert(WechatMerchantEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      this.eventEmitter.emit('wechat_merchant', value.mchid);
      return { code: 0, msg: '商家创建完成', operateId, reqId };
    } else {
      return { code: 400, msg: '商家创建失败', operateId, reqId };
    }
  }

  /**
   * 更新商家（含禁用）
   * @param mchid 被更新的商家ID
   * @param value 提交的商家信息
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    mchid: string,
    value: MerchantDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!mchid) {
      return { code: 400, msg: '传入的商家ID无效' };
    }
    const operateId = await this.operateService.insert('wechat_merchant');
    const result = await this.entityManager.update(
      WechatMerchantEntity,
      { mchid },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('wechat_merchant', value.mchid);
      return {
        code: 0,
        msg: '更新商家成功',
        operateId,
        reqId,
        mchid: value.mchid,
      };
    } else {
      return { code: 400, msg: '更新商家失败', operateId, reqId };
    }
  }

  /**
   * 商家排序
   * @param value 提交的排序信息
   * @returns 响应消息
   */
  async sort(value: object[]): Promise<Result> {
    if (!value.length) {
      return { code: 400, msg: '没有待排序的商家记录' };
    }
    for (const item of value) {
      await this.entityManager.update(
        WechatMerchantEntity,
        { mchid: item['mchid'] },
        { orderId: item['orderId'] },
      );
    }
    return { code: 0, msg: '商家排序成功' };
  }

  /**
   * 增加商家修改日志
   * @param mchid 商家ID
   */
  @OnEvent('wechat_merchant')
  async addLog(mchid: string) {
    /**商家对象 */
    const company = await this.entityManager.findOneBy(WechatMerchantEntity, {
      mchid,
    });
    /**添加日志 */
    this.entityManager.insert(WechatMerchantLogEntity, company);
  }
}
