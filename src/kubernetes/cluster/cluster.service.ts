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
  ClusterDto,
  KubernetesClusterEntity,
  KubernetesClusterLogEntity,
} from '..';

@Injectable()
export class ClusterService {
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
   * 获取集群清单
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
    ] as FindOptionsSelect<KubernetesClusterEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<KubernetesClusterEntity>;
    return await this.commonService.index(
      KubernetesClusterEntity,
      select,
      where,
    );
  }

  /**
   * 获取集群详情
   * @param clusterId 集群ID
   * @returns 响应消息
   */
  async show(clusterId: number): Promise<Result> {
    /**集群ID */
    if (!clusterId) {
      return { code: 400, msg: '传入的集群ID无效' };
    }
    /**集群对象 */
    const data: KubernetesClusterEntity = await this.entityManager.findOneBy(
      KubernetesClusterEntity,
      { clusterId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到集群' };
    }
  }

  /**
   * 获取集群变更日志
   * @param clusterId 集群ID
   * @returns 响应消息
   */
  async log(clusterId: number): Promise<Result> {
    /**集群ID */
    if (!clusterId) {
      return { code: 400, msg: '传入的集群ID无效' };
    }
    /**集群对象 */
    const data: KubernetesClusterLogEntity[] = await this.entityManager.findBy(
      KubernetesClusterLogEntity,
      { clusterId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到集群' };
    }
  }

  /**
   * 创建集群
   * @param value 提交消息体
   * @param updateUserId 用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: ClusterDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('kubernetes_cluster');
    const result = await this.entityManager.insert(KubernetesClusterEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      const clusterId = Number(result.identifiers[0].clusterId);
      this.eventEmitter.emit('kubernetes_cluster', clusterId);
      return { code: 0, msg: '集群创建完成', operateId, reqId, clusterId };
    } else {
      return { code: 400, msg: '集群创建失败', operateId, reqId };
    }
  }

  /**
   * 更新集群（含禁用和启用集群）
   * @param clusterId 集群ID
   * @param value 提交消息体
   * @param updateUserId 用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    clusterId: number,
    value: ClusterDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!clusterId) {
      return { code: 400, msg: '传入的集群ID无效' };
    }
    const operateId = await this.operateService.insert('aliyun_accesskey');
    const result = await this.entityManager.update(
      KubernetesClusterEntity,
      { clusterId },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('kubernetes_cluster', clusterId);
      return { code: 0, msg: '更新集群成功', operateId, reqId, clusterId };
    } else {
      return { code: 400, msg: '更新集群失败', operateId, reqId };
    }
  }

  /**
   * 集群排序
   * @param value 提交消息体
   * @returns 响应消息
   */
  async sort(value: object[]): Promise<Result> {
    if (!value.length) {
      return { code: 400, msg: '没有待排序的集群记录' };
    }
    for (const item of value) {
      await this.entityManager.update(
        KubernetesClusterEntity,
        { clusterId: item['clusterId'] },
        { orderId: item['orderId'] },
      );
    }
    this.queueService.add('kubernetes_cluster', 'sort');
    return { code: 0, msg: '集群排序成功' };
  }

  /**
   * 增加集群修改日志
   * @param keyId 集群ID
   */
  @OnEvent('kubernetes_cluster')
  async addLog(clusterId: number) {
    /**集群对象 */
    const cluster = await this.entityManager.findOneBy(
      KubernetesClusterEntity,
      { clusterId },
    );
    /**添加日志 */
    await this.entityManager.insert(KubernetesClusterLogEntity, cluster);
  }
}
