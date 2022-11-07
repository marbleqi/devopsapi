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
import { ServiceDto, KongServiceEntity, KongServiceLogEntity } from '..';

@Injectable()
export class ServiceService {
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
    ] as FindOptionsSelect<KongServiceEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<KongServiceEntity>;
    return await this.commonService.index(KongServiceEntity, select, where);
  }

  /**
   * 获取服务详情
   * @param id 服务ID
   * @returns 响应消息
   */
  async show(id: string): Promise<Result> {
    if (!id) {
      return { code: 400, msg: '传入的服务ID无效' };
    }
    /**服务对象 */
    const data: KongServiceEntity = await this.entityManager.findOneBy(
      KongServiceEntity,
      { id },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到角色' };
    }
  }

  /**
   * 获取服务变更日志
   * @param id 服务ID
   * @returns 响应消息
   */
  async log(id: string): Promise<Result> {
    if (!id) {
      return { code: 400, msg: '传入的服务ID无效' };
    }
    /**用户对象 */
    const data: KongServiceLogEntity[] = await this.entityManager.findBy(
      KongServiceLogEntity,
      { id },
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
    value: ServiceDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('kong_host');
    const result = await this.entityManager.insert(KongServiceEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
    });
    if (result.identifiers.length) {
      const hostId = Number(result.identifiers[0].hostId);
      this.eventEmitter.emit('kong_host', hostId);
      return { code: 0, msg: '服务创建完成', operateId, reqId, hostId };
    } else {
      return { code: 400, msg: '服务创建失败', operateId, reqId };
    }
  }

  /**
   * 更新服务（含禁用）
   * @param hostId 被更新的服务ID
   * @param value 提交消息体
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    id: string,
    value: ServiceDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!id) {
      return { code: 400, msg: '传入的服务ID无效' };
    }
    const operateId = await this.operateService.insert('user');
    const result = await this.entityManager.update(
      KongServiceEntity,
      { id },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('kong_service', id);
      return { code: 0, msg: '更新服务成功', operateId, reqId, id };
    } else {
      return { code: 400, msg: '更新服务失败', operateId, reqId };
    }
  }

  /**
   * 增加服务修改日志
   * @param id 服务ID
   */
  @OnEvent('kong_service')
  async addLog(id: string) {
    /**服务对象 */
    const host = await this.entityManager.findOneBy(KongServiceEntity, { id });
    /**添加日志 */
    this.entityManager.insert(KongServiceEntity, host);
  }
}
