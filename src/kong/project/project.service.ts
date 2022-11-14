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
import { KongProjectEntity, KongProjectLogEntity } from '..';

@Injectable()
export class ProjectService {
  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   * @param entityManager 实体管理器
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
    private readonly operateService: OperateService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * 获取对象清单
   * @param hostId 站点ID
   * @param projectType 对象类型
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(
    hostId: number,
    projectType: string,
    operateId: number,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!projectType) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    /**返回字段 */
    const select = [
      'hostId',
      'projectType',
      'id',
      'config',
      'status',
      'updateUserId',
      'updateAt',
      'operateId',
    ] as FindOptionsSelect<KongProjectEntity>;
    /**搜索条件 */
    const where = {
      hostId,
      projectType,
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<KongProjectEntity>;
    return await this.commonService.index(KongProjectEntity, select, where);
  }

  /**
   * 获取对象详情
   * @param hostId 站点ID
   * @param projectType 对象类型
   * @param id 服务ID
   * @returns 响应消息
   */
  async show(hostId: number, projectType: string, id: string): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!projectType) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的对象ID无效' };
    }
    /**服务对象 */
    const data: KongProjectEntity = await this.entityManager.findOneBy(
      KongProjectEntity,
      { hostId, projectType, id },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到角色' };
    }
  }

  /**
   * 获取对象变更日志
   * @param hostId 站点ID
   * @param projectType 对象类型
   * @param id 服务ID
   * @returns 响应消息
   */
  async log(hostId: number, projectType: string, id: string): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!projectType) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的服务ID无效' };
    }
    /**用户对象 */
    const data: KongProjectLogEntity[] = await this.entityManager.findBy(
      KongProjectLogEntity,
      { hostId, projectType, id },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到记录' };
    }
  }

  /**
   * 创建用户
   * @param hostId 站点ID
   * @param projectType 对象类型
   * @param value 提交消息体
   * @param updateUserId 创建用户的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    hostId: number,
    projectType: string,
    value: any,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!projectType) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    const operateId = await this.operateService.insert(projectType);
    const result = await this.entityManager.insert(KongProjectEntity, {
      hostId,
      projectType,
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
    });
    if (result.identifiers.length) {
      return { code: 0, msg: '对象创建完成', operateId, reqId };
    } else {
      return { code: 400, msg: '对象创建失败', operateId, reqId };
    }
  }

  /**
   * 更新对象（含禁用）
   * @param hostId 站点ID
   * @param projectType 对象类型
   * @param id 被更新的对象ID
   * @param value 提交消息体
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    hostId: number,
    projectType: string,
    id: string,
    value: any,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!projectType) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的服务ID无效' };
    }
    const operateId = await this.operateService.insert(projectType);
    const result = await this.entityManager.update(
      KongProjectEntity,
      { id },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('kong_project', id);
      return { code: 0, msg: '更新服务成功', operateId, reqId, id };
    } else {
      return { code: 400, msg: '更新服务失败', operateId, reqId };
    }
  }

  /**
   * 增加服务修改日志
   * @param id 服务ID
   */
  @OnEvent('kong_project')
  async addLog(id: string) {
    /**服务对象 */
    const host = await this.entityManager.findOneBy(KongProjectEntity, { id });
    /**添加日志 */
    this.entityManager.insert(KongProjectLogEntity, host);
  }
}
