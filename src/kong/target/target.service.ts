// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { firstValueFrom } from 'rxjs';
// 内部依赖
import { Result, OperateService } from '../../shared';
import { KongProjectLogEntity, HostService } from '..';

@Injectable()
export class TargetService {
  /**
   * 构造函数
   * @param clientService 客户端服务
   * @param operateService 操作序号服务
   * @param entityManager 实体管理器
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly clientService: HttpService,
    private readonly operateService: OperateService,
    private readonly hostService: HostService,
  ) {}

  /**
   * 获取目标清单
   * @param hostId 站点ID
   * @param id 上游ID
   * @returns 响应消息
   */
  async index(hostId: number, id: string): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的上游ID无效' };
    }
    const result = await this.hostService.show(hostId);
    if (result.code) {
      return result;
    }
    let next: any = await firstValueFrom(
      this.clientService.get(`${result.data.url}/upstreams/${id}/targets`, {
        validateStatus: () => true,
      }),
    );
    let data: any[] = next.data.data;
    // 当对象不止一页时轮询获取
    while (next.data.offset) {
      next = await firstValueFrom(
        this.clientService.get(`${result.data.url}${next.data.next}`, {
          validateStatus: () => true,
        }),
      );
      data = data.concat(next.data.data);
    }
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取目标变更日志（有关同一个上游的所以目标的变更记录到同一个变更历史中，使用上游ID为标记）
   * @param hostId 站点ID
   * @param id 上游ID
   * @returns 响应消息
   */
  async log(hostId: number, id: string): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的上游ID无效' };
    }
    /**用户对象 */
    const data: KongProjectLogEntity[] = await this.entityManager.findBy(
      KongProjectLogEntity,
      { hostId, project: 'targets', id },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到记录' };
    }
  }

  /**
   * 创建目标
   * @param hostId 站点ID
   * @param id 上游ID
   * @param value 提交目标消息
   * @param updateUserId 创建用户的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    hostId: number,
    id: string,
    value: any,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的上游ID无效' };
    }
    let result: any = await this.hostService.show(hostId);
    if (result.code) {
      return result;
    }
    result = await firstValueFrom(
      this.clientService.post(
        `${result.data.url}/upstreams/${id}/targets`,
        value,
        {
          validateStatus: () => true,
        },
      ),
    );
    if (result.status !== 201) {
      return { code: 403, msg: result.data.message };
    }
    // 接口调用成功后，更新日志数据库数据库
    const operateId = await this.operateService.insert('kong');
    await this.entityManager.insert(KongProjectLogEntity, {
      hostId,
      project: 'targets',
      id,
      config: result.data,
      status: 1,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
    });
    return { code: 0, msg: '目标创建完成', operateId, reqId };
  }

  /**
   * 删除目标
   * @param hostId 站点ID
   * @param id 上游ID
   * @param targetId 目标ID
   * @param updateUserId 创建用户的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async destroy(
    hostId: number,
    id: string,
    targetId: string,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的上游ID无效' };
    }
    if (!targetId) {
      return { code: 400, msg: '传入的目标无效' };
    }
    let result: any = await this.hostService.show(hostId);
    if (result.code) {
      return result;
    }
    result = await firstValueFrom(
      this.clientService.delete(
        `${result.data.url}/upstreams/${id}/targets/${targetId}`,
        {
          validateStatus: () => true,
        },
      ),
    );
    if (result.status !== 204) {
      return { code: 404, msg: '未找到对象！' };
    }
    // console.debug('删除结果：', result);
    // 接口调用成功后，更新日志数据库数据库
    const operateId = await this.operateService.insert('kong');
    await this.entityManager.insert(KongProjectLogEntity, {
      hostId,
      project: 'targets',
      id,
      config: { ...result.data, id: targetId },
      status: 0,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
    });
    return { code: 0, msg: 'ok' };
  }
}
