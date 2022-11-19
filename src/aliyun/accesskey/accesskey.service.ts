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
import {
  Result,
  OperateService,
  QueueService,
  CommonService,
} from '../../shared';
import {
  AccesskeyDto,
  AliyunAccesskeyEntity,
  AliyunAccesskeyLogEntity,
} from '..';

@Injectable()
export class AccesskeyService {
  /**
   * 构造函数
   * @param entityManager 实体管理器
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   * @param queueService 消息队列
   * @param commonService 通用服务
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
    private readonly operateService: OperateService,
    private readonly queueService: QueueService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * 获取阿里云密钥清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'keyId',
      'name',
      'description',
      'accessKeyId',
      'status',
      'orderId',
      'updateUserId',
      'updateAt',
      'operateId',
    ] as FindOptionsSelect<AliyunAccesskeyEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<AliyunAccesskeyEntity>;
    return await this.commonService.index(AliyunAccesskeyEntity, select, where);
  }

  /**
   * 获取阿里云密钥详情
   * @param keyId 阿里云密钥ID
   * @returns 响应消息
   */
  async show(keyId: number): Promise<Result> {
    /**阿里云密钥ID */
    if (!keyId) {
      return { code: 400, msg: '传入的阿里云密钥ID无效' };
    }
    /**阿里云密钥对象 */
    const data: AliyunAccesskeyEntity = await this.entityManager.findOneBy(
      AliyunAccesskeyEntity,
      { keyId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到阿里云密钥' };
    }
  }

  /**
   * 获取阿里云密钥变更日志
   * @param keyId 阿里云密钥ID
   * @returns 响应消息
   */
  async log(keyId: number): Promise<Result> {
    /**阿里云密钥ID */
    if (!keyId) {
      return { code: 400, msg: '传入的阿里云密钥ID无效' };
    }
    /**阿里云密钥对象 */
    const data: AliyunAccesskeyLogEntity[] = await this.entityManager.findBy(
      AliyunAccesskeyLogEntity,
      { keyId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到阿里云密钥' };
    }
  }

  /**
   * 创建阿里云密钥
   * @param value 提交消息体
   * @param updateUserId 用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: AccesskeyDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('aliyun_accesskey');
    const result = await this.entityManager.insert(AliyunAccesskeyEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      const keyId = Number(result.identifiers[0].keyId);
      this.eventEmitter.emit('aliyun_accesskey', keyId);
      return { code: 0, msg: '阿里云密钥创建完成', operateId, reqId, keyId };
    } else {
      return { code: 400, msg: '阿里云密钥创建失败', operateId, reqId };
    }
  }

  /**
   * 更新阿里云密钥（含禁用和启用阿里云密钥）
   * @param keyId 阿里云密钥ID
   * @param value 提交消息体
   * @param updateUserId 用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    keyId: number,
    value: AccesskeyDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!keyId) {
      return { code: 400, msg: '传入的阿里云密钥ID无效' };
    }
    const operateId = await this.operateService.insert('aliyun_accesskey');
    const result = await this.entityManager.update(
      AliyunAccesskeyEntity,
      { keyId },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('aliyun_accesskey', keyId);
      return { code: 0, msg: '更新阿里云密钥成功', operateId, reqId, keyId };
    } else {
      return { code: 400, msg: '更新阿里云密钥失败', operateId, reqId };
    }
  }

  /**
   * 阿里云密钥排序
   * @param value 提交消息体
   * @returns 响应消息
   */
  async sort(value: object[]): Promise<Result> {
    if (!value.length) {
      return { code: 400, msg: '没有待排序的阿里云密钥记录' };
    }
    for (const item of value) {
      await this.entityManager.update(
        AliyunAccesskeyEntity,
        { keyId: item['keyId'] },
        { orderId: item['orderId'] },
      );
    }
    this.queueService.add('aliyun_accesskey', 'sort');
    return { code: 0, msg: '阿里云密钥排序成功' };
  }

  /**
   * 增加阿里云密钥修改日志
   * @param keyId 阿里云密钥ID
   */
  @OnEvent('aliyun_accesskey')
  async addLog(keyId: number) {
    /**阿里云密钥对象 */
    const accesskey = await this.entityManager.findOneBy(
      AliyunAccesskeyEntity,
      { keyId },
    );
    /**添加日志 */
    await this.entityManager.insert(AliyunAccesskeyLogEntity, accesskey);
  }
}
