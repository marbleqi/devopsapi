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
import { KongHostDto, KongHostEntity, KongHostLogEntity } from '..';

@Injectable()
export class HostService {
  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   * @param entityManager 实体管理器
   */
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly operateService: OperateService,
    private readonly commonService: CommonService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * 获取用户清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'hostId',
      'name',
      'description',
      'status',
      'updateUserId',
      'updateAt',
      'operateId',
    ] as FindOptionsSelect<KongHostEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<KongHostEntity>;
    return await this.commonService.index(KongHostEntity, select, where);
  }

  /**
   * 获取用户详情
   * @param hostId 用户ID
   * @returns 响应消息
   */
  async show(hostId: number): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    /**用户对象 */
    const data: KongHostEntity = await this.entityManager.findOneBy(
      KongHostEntity,
      { hostId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到角色' };
    }
  }

  /**
   * 获取用户变更日志
   * @param hostId 用户ID
   * @returns 响应消息
   */
  async log(hostId: number): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    /**用户对象 */
    const data: KongHostLogEntity[] = await this.entityManager.findBy(
      KongHostLogEntity,
      { hostId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到记录' };
    }
  }

  /**
   * 创建用户
   * @param value 提交消息体
   * @param updateUserId 创建用户的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: KongHostDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('kong_host');
    const result = await this.entityManager.insert(KongHostEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      const hostId = Number(result.identifiers[0].hostId);
      this.eventEmitter.emit('kong_host', hostId);
      return { code: 0, msg: '站点创建完成', operateId, reqId, hostId };
    } else {
      return { code: 400, msg: '站点创建失败', operateId, reqId };
    }
  }

  /**
   * 更新站点（含禁用）
   * @param hostId 被更新的站点ID
   * @param value 提交消息体
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    hostId: number,
    value: KongHostDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    const operateId = await this.operateService.insert('user');
    const result = await this.entityManager.update(
      KongHostEntity,
      { hostId },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('kong_host', hostId);
      return { code: 0, msg: '更新站点成功', operateId, reqId, hostId };
    } else {
      return { code: 400, msg: '更新站点失败', operateId, reqId };
    }
  }

  /**
   * 站点排序
   * @param value 提交消息体
   * @returns 响应消息
   */
  async sort(value: object[]): Promise<Result> {
    if (!value.length) {
      return { code: 400, msg: '没有待排序的站点记录' };
    }
    for (const item of value) {
      await this.entityManager.update(
        KongHostEntity,
        { hostId: item['hostId'] },
        { orderId: item['orderId'] },
      );
    }
    return { code: 0, msg: '站点排序成功' };
  }

  /**
   * 增加站点修改日志
   * @param hostId 站点ID
   */
  @OnEvent('kong_host')
  async addLog(hostId: number) {
    /**站点对象 */
    const host = await this.entityManager.findOneBy(KongHostEntity, { hostId });
    /**添加日志 */
    this.entityManager.insert(KongHostLogEntity, host);
  }
}
