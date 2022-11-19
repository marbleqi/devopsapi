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
import { GrantDto, KongGrantEntity, KongGrantLogEntity } from '..';

@Injectable()
export class GrantService {
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
   * 获取授权清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'userId',
      'grant',
      'updateUserId',
      'updateAt',
      'operateId',
    ] as FindOptionsSelect<KongGrantEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<KongGrantEntity>;
    return await this.commonService.index(KongGrantEntity, select, where);
  }

  /**
   * 获取授权详情
   * @param userId 用户ID
   * @returns 响应消息
   */
  async show(userId: number): Promise<Result> {
    if (!userId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    /**用户对象 */
    const data: KongGrantEntity = await this.entityManager.findOneBy(
      KongGrantEntity,
      { userId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到授权' };
    }
  }

  /**
   * 获取授权变更日志
   * @param userId 用户ID
   * @returns 响应消息
   */
  async log(userId: number): Promise<Result> {
    if (!userId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    /**用户对象 */
    const data: KongGrantLogEntity[] = await this.entityManager.findBy(
      KongGrantLogEntity,
      { userId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到记录' };
    }
  }

  /**
   * 创建授权
   * @param value 提交的授权信息
   * @param updateUserId 创建授权的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: GrantDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('kong_grant');
    const result = await this.entityManager.insert(KongGrantEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      this.eventEmitter.emit('kong_grant', value.userId);
      return {
        code: 0,
        msg: '授权创建完成',
        operateId,
        reqId,
        userId: value.userId,
      };
    } else {
      return {
        code: 400,
        msg: '授权创建失败',
        operateId,
        reqId,
        userId: value.userId,
      };
    }
  }

  /**
   * 更新授权（含禁用和启用授权）
   * @param userId 被授权的用户ID
   * @param value 提交的授权信息
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    userId: number,
    value: GrantDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!userId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    const operateId = await this.operateService.insert('kong_grant');
    const result = await this.entityManager.update(
      KongGrantEntity,
      { userId },
      {
        ...value,
        userId,
        operateId,
        reqId,
        updateUserId,
        updateAt: Date.now(),
      },
    );
    if (result.affected) {
      this.eventEmitter.emit('kong_grant', userId);
      return { code: 0, msg: '更新授权成功', operateId, reqId, userId };
    } else {
      return { code: 400, msg: '更新授权失败', operateId, reqId };
    }
  }

  /**
   * 增加授权修改日志
   * @param userId 授权ID
   */
  @OnEvent('kong_grant')
  async addLog(userId: number) {
    /**授权对象 */
    const grant = await this.entityManager.findOneBy(KongGrantEntity, {
      userId,
    });
    /**添加日志 */
    this.entityManager.insert(KongGrantLogEntity, grant);
  }
}
