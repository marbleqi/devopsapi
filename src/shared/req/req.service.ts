// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  Not,
  Between,
} from 'typeorm';
// 内部依赖
import {
  Result,
  ReqEntity,
  ReqModuleEntity,
  ReqControllerEntity,
  ReqActionEntity,
  CommonService,
} from '..';

/**请求日志服务 */
@Injectable()
export class ReqService {
  constructor(
    private readonly commonService: CommonService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * 新增请求日志
   * @param data 更新数据
   * @returns 更新结果
   */
  async insert(data: object): Promise<number> {
    const result = await this.entityManager.insert(ReqEntity, data);
    if (result.identifiers.length) {
      return Number(result.identifiers[0].reqId);
    } else {
      return 0;
    }
  }

  /**
   * 更新请求日志
   * @param reqId 请求日志ID
   * @returns 更新结果
   */
  update(reqId: number, value: object): void {
    this.entityManager.update(
      ReqEntity,
      { reqId },
      { ...value, endAt: Date.now() },
    );
  }

  /**
   * 获取日志模块列表
   * @returns 响应消息
   */
  async module(): Promise<Result> {
    /**日志模块清单 */
    const data: ReqModuleEntity[] = await this.entityManager.find(
      ReqModuleEntity,
    );
    /**响应报文 */
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取日志控制器列表
   * @param module 模块名
   * @returns 响应消息
   */
  async controller(module: string): Promise<Result> {
    /**返回字段 */
    const select = ['controller'] as FindOptionsSelect<ReqControllerEntity>;
    /**搜索条件 */
    const where = { module } as FindOptionsWhere<ReqControllerEntity>;
    /**日志控制器清单 */
    return await this.commonService.index(ReqControllerEntity, select, where);
  }

  /**
   * 获取操作列表
   * @param module 模块名
   * @param controller 控制名
   * @returns 响应消息
   */
  async action(module: string, controller: string): Promise<Result> {
    /**返回字段 */
    const select = ['action'] as FindOptionsSelect<ReqActionEntity>;
    /**搜索条件 */
    const where = { module, controller } as FindOptionsWhere<ReqActionEntity>;
    /**日志控制器清单 */
    return await this.commonService.index(ReqActionEntity, select, where);
  }

  /**
   * 获取日志清单
   * @param value 提交条件
   * @param reqId 当前请求ID（去除当前日志ID）
   * @returns 响应消息
   */
  async index(value: any, reqId: number): Promise<Result> {
    console.debug('日志查询条件', value);
    /**返回字段 */
    const select = [
      'reqId',
      'userId',
      'module',
      'controller',
      'action',
      'status',
      'clientIp',
      'serverIp',
      'startAt',
      'endAt',
    ] as FindOptionsSelect<ReqEntity>;
    /**搜索条件 */
    const where: FindOptionsWhere<ReqEntity> = { reqId: Not(reqId) };
    if (value.userId && Number(value.userId)) {
      where['userId'] = Number(value.userId);
    }
    if (value.module) {
      where['module'] = value.module;
    }
    if (value.controller) {
      where['controller'] = value.controller;
    }
    if (value.action) {
      where['action'] = value.action;
    }
    if (value.status === '200') {
      where['status'] = 200;
    } else {
      where['status'] = Not(200);
    }
    if (typeof value.startAt === 'object' && value.startAt?.length > 1) {
      where['startAt'] = Between(
        Number(value.startAt[0]),
        Number(value.startAt[1]),
      );
    } else {
      where['startAt'] = Between(0, Date.now());
    }
    console.debug(select, where);
    return await this.commonService.index(ReqEntity, select, where);
  }

  /**
   * 获取日志详情
   * @param reqId 日志ID
   * @returns 响应消息
   */
  async show(reqId: number): Promise<Result> {
    /**日志ID */
    if (!reqId) {
      return { code: 403, msg: '传入的日志ID无效' };
    }
    /**日志模块清单 */
    const data: ReqEntity = await this.entityManager.findOneBy(ReqEntity, {
      reqId,
    });
    /**响应报文 */
    return { code: 0, msg: 'ok', data };
  }
}
