// 外部依赖
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  MoreThan,
} from 'typeorm';
import { firstValueFrom } from 'rxjs';
// 内部依赖
import { Result, OperateService, CommonService } from '../../shared';
import { KongProjectEntity, KongProjectLogEntity, HostService } from '..';

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
    private readonly clientService: HttpService,
    private readonly operateService: OperateService,
    private readonly commonService: CommonService,
    private readonly hostService: HostService,
  ) {}

  /**
   * 获取对象清单
   * @param hostId 站点ID
   * @param project 对象类型
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(
    hostId: number,
    project: string,
    operateId: number,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!project) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    /**返回字段 */
    const select = [
      'hostId',
      'project',
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
      project,
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<KongProjectEntity>;
    return await this.commonService.index(KongProjectEntity, select, where);
  }

  /**
   * 获取对象详情
   * @param hostId 站点ID
   * @param project 对象类型
   * @param id 服务ID
   * @returns 响应消息
   */
  async show(hostId: number, project: string, id: string): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!project) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的对象ID无效' };
    }
    let result: any = await this.hostService.show(hostId);
    if (result.code) {
      return result;
    }
    result = await firstValueFrom(
      this.clientService.get(`${result.data.url}/${project}/${id}`, {
        validateStatus: () => true,
      }),
    );
    if (result.status !== 200) {
      return { code: 404, msg: '未找到对象！' };
    }
    return { code: 0, msg: 'ok', data: result.data };
  }

  /**
   * 获取对象变更日志
   * @param hostId 站点ID
   * @param project 对象类型
   * @param id 服务ID
   * @returns 响应消息
   */
  async log(hostId: number, project: string, id: string): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!project) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的服务ID无效' };
    }
    /**用户对象 */
    const data: KongProjectLogEntity[] = await this.entityManager.findBy(
      KongProjectLogEntity,
      { hostId, project, id },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到记录' };
    }
  }

  /**
   * 对象数据同步
   * @param hostId 站点ID
   * @param project 对象类型
   * @returns 响应消息
   */
  async sync(
    hostId: number,
    project: string,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    console.debug('收到服务同步请求', hostId, project);
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!project) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    const result = await this.hostService.show(hostId);
    if (result.code) {
      return result;
    }
    console.debug(result, result.data.url);
    let next: any = await firstValueFrom(
      this.clientService.get(`${result.data.url}/${project}`, {
        validateStatus: () => true,
      }),
    );
    console.debug(
      'next',
      next.data.data.length,
      next.data.next,
      next.data.offset,
    );
    let apidata: any[] = next.data.data;
    // 当对象不止一页时轮询获取
    while (next.data.offset) {
      next = await firstValueFrom(
        this.clientService.get(`${result.data.url}${next.data.next}`, {
          validateStatus: () => true,
        }),
      );
      console.debug('next', next.data.next, next.data.offset);
      apidata = apidata.concat(next.data.data);
    }
    console.debug('接口对象记录数', apidata.length);
    const dbdata: KongProjectEntity[] = await this.entityManager.findBy(
      KongProjectEntity,
      { hostId, project },
    );
    console.debug('数据库对象记录数', dbdata.length);
    // 开始对接口数据和数据库数据进行比对后同步
    // 将接口中存在，但数据库中不存在的记录进行添加
    const adddata: any[] = apidata.filter((apiitem) => true);

    // 将数据库中存在，但接口中不存在的记录标记为删除

    // for (const item of data) {
    //   const single: KongProjectEntity = await this.entityManager.findOneBy(
    //     KongProjectEntity,
    //     {
    //       hostId,
    //       project,
    //       id: item.id,
    //     },
    //   );
    //   if (!single) {
    //     const operateId = await this.operateService.insert('kong');
    //     await this.entityManager.insert(KongProjectEntity, {
    //       hostId,
    //       project,
    //       id: item.id,
    //       config: item,
    //       operateId,
    //       reqId,
    //       updateUserId,
    //       updateAt: Date.now(),
    //       createUserId: updateUserId,
    //       createAt: Date.now(),
    //     });
    //   }
    // }
    return { code: 0, msg: 'ok' };
  }

  /**
   * 创建用户
   * @param hostId 站点ID
   * @param project 对象类型
   * @param value 提交消息体
   * @param updateUserId 创建用户的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    hostId: number,
    project: string,
    value: any,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!project) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    let result: any = await this.hostService.show(hostId);
    if (result.code) {
      return result;
    }
    result = await firstValueFrom(
      this.clientService.post(`${result.data.url}/${project}`, value, {
        validateStatus: () => true,
      }),
    );
    if (result.status !== 201) {
      return { code: 403, msg: result.data.message };
    }
    const operateId = await this.operateService.insert(project);
    result = await this.entityManager.insert(KongProjectEntity, {
      hostId,
      project,
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
   * @param project 对象类型
   * @param id 被更新的对象ID
   * @param value 提交消息体
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    hostId: number,
    project: string,
    id: string,
    value: any,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!project) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的服务ID无效' };
    }
    let result: any = await this.hostService.show(hostId);
    if (result.code) {
      return result;
    }
    result = await firstValueFrom(
      this.clientService.patch(
        `${result.data.url}/${project}/${id}`,
        value.data,
        {
          validateStatus: () => true,
        },
      ),
    );
    if (result.status !== 200) {
      return { code: 403, msg: result.data.message };
    }
    const operateId = await this.operateService.insert(project);
    result = await this.entityManager.update(
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
   * 删除对象
   * @param hostId 站点ID
   * @param project 对象类型
   * @param id 服务ID
   * @returns 响应消息
   */
  async destroy(
    hostId: number,
    project: string,
    id: string,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!hostId) {
      return { code: 400, msg: '传入的站点ID无效' };
    }
    if (!project) {
      return { code: 400, msg: '传入的对象类型无效' };
    }
    if (!id) {
      return { code: 400, msg: '传入的对象ID无效' };
    }
    let result: any = await this.hostService.show(hostId);
    if (result.code) {
      return result;
    }
    result = await firstValueFrom(
      this.clientService.delete(`${result.data.url}/${project}/${id}`, {
        validateStatus: () => true,
      }),
    );
    if (result.status !== 204) {
      return { code: 404, msg: '未找到对象！' };
    }
    console.debug(updateUserId, reqId);
    return { code: 0, msg: 'ok' };
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
