// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  Between,
} from 'typeorm';
import { format } from 'date-fns';
// 内部依赖
import { Result, CommonService } from '../../shared';
import {
  KongLogEntity,
  KongLogCountEntity,
  KongLogYearEntity,
  KongLogMonthEntity,
  KongLogDayEntity,
  KongLogHourEntity,
  KongLogMinuteEntity,
} from '..';

@Injectable()
export class LogService {
  /**
   * 构造函数
   * @param commonService 通用服务
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly commonService: CommonService,
  ) {}

  /**
   * 获取路由日志
   * @param routeId 路由ID
   * @param start 开始时间
   * @param end 结束时间
   * @returns 响应消息
   */
  async index(routeId: string, start: number, end: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'logId',
      'routeId',
      'client_ip',
      'started_at',
    ] as FindOptionsSelect<KongLogEntity>;
    /**搜索条件 */
    const where = {
      routeId,
      started_at: Between(start, end),
    } as FindOptionsWhere<KongLogEntity>;
    return await this.commonService.index(KongLogEntity, select, where);
  }

  /**
   * 获取路由日志记录
   * @param logId 日志ID
   * @returns 响应消息
   */
  async show(logId: number): Promise<Result> {
    /**日志模块清单 */
    const data: KongLogEntity = await this.entityManager.findOneBy(
      KongLogEntity,
      { logId },
    );
    /**响应报文 */
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取路由日志
   * @param routeId 路由ID
   * @param type 路由ID
   * @param start 开始时间
   * @param end 结束时间
   * @returns 响应消息
   */
  async count(
    routeId: string,
    type: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
    start: number,
    end: number,
  ): Promise<Result> {
    if (type === 'year') {
      /**返回字段 */
      const select = [
        'routeId',
        'year',
        'count',
      ] as FindOptionsSelect<KongLogYearEntity>;
      /**搜索条件 */
      const where = {
        routeId,
        year: Between(format(start, 'yyyy'), format(end, 'yyyy')),
      } as FindOptionsWhere<KongLogYearEntity>;
      return await this.commonService.index(KongLogYearEntity, select, where);
    }
    if (type === 'month') {
      /**返回字段 */
      const select = [
        'routeId',
        'month',
        'count',
      ] as FindOptionsSelect<KongLogMonthEntity>;
      /**搜索条件 */
      const where = { id: routeId } as FindOptionsWhere<KongLogMonthEntity>;
      return await this.commonService.index(KongLogMonthEntity, select, where);
    }
    if (type === 'day') {
      /**返回字段 */
      const select = [
        'routeId',
        'year',
        'month',
        'day',
        'count',
      ] as FindOptionsSelect<KongLogDayEntity>;
      /**搜索条件 */
      const where = { id: routeId } as FindOptionsWhere<KongLogDayEntity>;
      return await this.commonService.index(KongLogDayEntity, select, where);
    }
    if (type === 'hour') {
      /**返回字段 */
      const select = [
        'routeId',
        'year',
        'month',
        'day',
        'count',
      ] as FindOptionsSelect<KongLogHourEntity>;
      /**搜索条件 */
      const where = { id: routeId } as FindOptionsWhere<KongLogHourEntity>;
      return await this.commonService.index(KongLogHourEntity, select, where);
    }
    if (type === 'minute') {
      /**返回字段 */
      const select = [
        'routeId',
        'year',
        'month',
        'day',
        'count',
      ] as FindOptionsSelect<KongLogMinuteEntity>;
      /**搜索条件 */
      const where = { id: routeId } as FindOptionsWhere<KongLogMinuteEntity>;
      return await this.commonService.index(KongLogMinuteEntity, select, where);
    }
    /**返回字段 */
    const select = [
      'routeId',
      'year',
      'month',
      'day',
      'count',
    ] as FindOptionsSelect<KongLogCountEntity>;
    /**搜索条件 */
    const where = { id: routeId } as FindOptionsWhere<KongLogCountEntity>;
    return await this.commonService.index(KongLogCountEntity, select, where);
  }
}
