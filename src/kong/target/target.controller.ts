// 外部依赖
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { Ability, Abilities, AbilityService } from '../../auth';
import { TargetService } from '..';

@Controller('kong/target')
export class TargetController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点目标
   * @param targetService 注入的对象目标
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly targetService: TargetService,
  ) {
    // 目标管理
    this.abilityService.add([
      { id: 582, pid: 580, name: '目标列表', description: '目标列表' },
      { id: 584, pid: 580, name: '目标变更历史', description: '目标变更历史' },
      { id: 585, pid: 580, name: '创建目标', description: '创建目标' },
      { id: 587, pid: 580, name: '删除目标', description: '删除目标' },
    ] as Ability[]);
  }

  /**
   * 获取目标清单
   * @param hostId 站点ID
   * @param id 上游ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/index')
  @Abilities(582)
  async index(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.targetService.index(hostId, id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取目标变更日志
   * @param hostId 站点ID
   * @param id 目标ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/log')
  @Abilities(584)
  async log(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.targetService.log(hostId, id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建目标
   * @param hostId 站点ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/:id/create')
  @Abilities(585)
  async create(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.targetService.create(
      hostId,
      id,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 删除目标
   * @param hostId 站点ID
   * @param id 目标ID
   * @param res 响应上下文
   */
  @Delete(':hostId/:id/:targetId')
  @Abilities(587)
  async destroy(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Param('targetId') targetId: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.targetService.destroy(
      hostId,
      id,
      targetId,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
