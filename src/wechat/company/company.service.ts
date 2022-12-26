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
import { CompanyDto, WechatCompanyEntity, WechatCompanyLogEntity } from '..';

@Injectable()
export class CompanyService {
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
   * 获取企业清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'corpid',
      'description',
      'status',
      'orderId',
      'updateUserId',
      'updateAt',
      'operateId',
    ] as FindOptionsSelect<WechatCompanyEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<WechatCompanyEntity>;
    return await this.commonService.index(WechatCompanyEntity, select, where);
  }

  /**
   * 获取企业详情
   * @param corpid 企业微信ID
   * @returns 响应消息
   */
  async show(corpid: string): Promise<Result> {
    if (!corpid) {
      return { code: 400, msg: '传入的企业微信ID无效' };
    }
    /**用户对象 */
    const data: WechatCompanyEntity = await this.entityManager.findOneBy(
      WechatCompanyEntity,
      { corpid },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到企业微信' };
    }
  }

  /**
   * 获取企业变更日志
   * @param corpid 企业微信ID
   * @returns 响应消息
   */
  async log(corpid: string): Promise<Result> {
    if (!corpid) {
      return { code: 400, msg: '传入的企业微信ID无效' };
    }
    /**用户对象 */
    const data: WechatCompanyLogEntity[] = await this.entityManager.findBy(
      WechatCompanyLogEntity,
      { corpid },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到记录' };
    }
  }

  /**
   * 创建企业
   * @param value 提交的企业信息
   * @param updateUserId 创建企业的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: CompanyDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('wechat_company');
    const result = await this.entityManager.insert(WechatCompanyEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      this.eventEmitter.emit('wechat_company', value.corpid);
      return { code: 0, msg: '企业创建完成', operateId, reqId };
    } else {
      return { code: 400, msg: '企业创建失败', operateId, reqId };
    }
  }

  /**
   * 更新企业（含禁用）
   * @param corpid 被更新的企业ID
   * @param value 提交的企业信息
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    corpid: string,
    value: CompanyDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!corpid) {
      return { code: 400, msg: '传入的企业ID无效' };
    }
    const operateId = await this.operateService.insert('wechat_company');
    const result = await this.entityManager.update(
      WechatCompanyEntity,
      { corpid },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('wechat_company', corpid);
      return { code: 0, msg: '更新企业成功', operateId, reqId, corpid };
    } else {
      return { code: 400, msg: '更新企业失败', operateId, reqId };
    }
  }

  /**
   * 企业排序
   * @param value 提交的排序信息
   * @returns 响应消息
   */
  async sort(value: object[]): Promise<Result> {
    if (!value.length) {
      return { code: 400, msg: '没有待排序的企业记录' };
    }
    for (const item of value) {
      await this.entityManager.update(
        WechatCompanyEntity,
        { corpid: item['corpid'] },
        { orderId: item['orderId'] },
      );
    }
    return { code: 0, msg: '企业排序成功' };
  }

  /**
   * 增加企业修改日志
   * @param corpid 企业ID
   */
  @OnEvent('wechat_company')
  async addLog(corpid: string) {
    /**企业对象 */
    const company = await this.entityManager.findOneBy(WechatCompanyEntity, {
      corpid,
    });
    /**添加日志 */
    this.entityManager.insert(WechatCompanyLogEntity, company);
  }
}
