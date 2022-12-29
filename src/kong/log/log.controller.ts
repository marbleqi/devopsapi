// 外部依赖
import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { Ability, Abilities, AbilityService } from '../../auth';
import { LogService } from '..';

@Controller('kong/log')
export class LogController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param hostService 注入的站点服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly logService: LogService,
  ) {
    const main = {
      pid: 530,
      moduleName: 'KONG',
      objectName: '路由',
      type: '接口',
    };
    // 站点管理
    [{ id: 538, name: '路由访问记录', description: '路由访问记录' }].map(
      (item) => this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  /**
   * 获取路由访问日志
   * @param routeId 路由ID
   * @param start 开始时间
   * @param end 结束时间
   * @param res 响应上下文
   */
  @Get(':routeId/index')
  @Abilities(538)
  async index(
    @Param('routeId') routeId: string,
    @Query('start', new ParseIntPipe()) start: number,
    @Query('end', new ParseIntPipe()) end: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.logService.index(routeId, start, end);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取路由访问日志
   * @param logId 日志ID
   * @param res 响应上下文
   */
  @Get(':logId/show')
  @Abilities(538)
  async show(
    @Param('logId', new ParseIntPipe()) logId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.logService.show(logId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取路由访问统计
   * @param routeId 路由ID
   * @param type 统计周期
   * @param start 开始时间
   * @param end 结束时间
   * @param res 响应上下文
   */
  @Get(':routeId/count')
  @Abilities(538)
  async count(
    @Param('routeId') routeId: string,
    @Query('type')
    type: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
    @Query('start', new ParseIntPipe()) start: number,
    @Query('end', new ParseIntPipe()) end: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.logService.count(routeId, type, start, end);
    res.status(200).json(res.locals.result);
  }
}
