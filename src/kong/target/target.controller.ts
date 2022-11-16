// 外部依赖
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { Ability, Abilities, AbilityService } from '../../auth';
import { ProjectService } from '..';

@Controller('kong/target')
export class TargetController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点目标
   * @param projectService 注入的对象目标
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly projectService: ProjectService,
  ) {
    // 目标管理
    this.abilityService.add([
      { id: 571, pid: 570, name: '目标同步', description: '目标同步' },
      { id: 572, pid: 570, name: '目标列表', description: '目标列表' },
      { id: 573, pid: 570, name: '目标详情', description: '目标详情' },
      { id: 574, pid: 570, name: '目标变更历史', description: '创建目标' },
      { id: 575, pid: 570, name: '创建目标', description: '创建目标' },
      { id: 576, pid: 570, name: '修改目标', description: '修改目标' },
      { id: 577, pid: 570, name: '删除目标', description: '删除目标' },
    ] as Ability[]);
  }

  /**
   * 目标数据同步
   * @param hostId 站点ID
   * @param res 响应上下文
   */
  @Post(':hostId/sync')
  @Abilities(571)
  async sync(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.sync(
      hostId,
      'targets',
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取目标清单
   * @param hostId 站点ID
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get(':hostId/index')
  @Abilities(572)
  async index(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    console.debug(hostId, operateId);
    res.locals.result = await this.projectService.index(
      hostId,
      'targets',
      operateId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取目标详情
   * @param hostId 站点ID
   * @param id 目标ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/show')
  @Abilities(573)
  async show(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.show(
      hostId,
      'targets',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取目标变更日志
   * @param hostId 站点ID
   * @param id 目标ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/log')
  @Abilities(574)
  async log(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.log(hostId, 'targets', id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建目标
   * @param hostId 站点ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/create')
  @Abilities(575)
  async create(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.create(
      hostId,
      'targets',
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新目标
   * @param hostId 站点ID
   * @param id 目标ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/:id/update')
  @Abilities(576)
  async update(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.update(
      hostId,
      'targets',
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
  @Delete(':hostId/:id')
  @Abilities(577)
  async destroy(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.update(
      hostId,
      'targets',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
