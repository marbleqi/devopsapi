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

@Controller('kong/consumer')
export class ConsumerController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param projectService 注入的对象服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly projectService: ProjectService,
  ) {
    // 服务管理
    this.abilityService.add([
      { id: 541, pid: 540, name: '服务同步', description: '服务同步' },
      { id: 542, pid: 540, name: '服务列表', description: '服务列表' },
      { id: 543, pid: 540, name: '服务详情', description: '服务详情' },
      { id: 544, pid: 540, name: '服务变更历史', description: '创建服务' },
      { id: 545, pid: 540, name: '创建服务', description: '创建服务' },
      { id: 546, pid: 540, name: '修改服务', description: '修改服务' },
      { id: 547, pid: 540, name: '删除服务', description: '删除服务' },
    ] as Ability[]);
  }

  /**
   * 服务数据同步
   * @param hostId 站点ID
   * @param res 响应上下文
   */
  @Post(':hostId/sync')
  @Abilities(541)
  async sync(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.sync(
      hostId,
      'consumers',
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取服务清单
   * @param hostId 站点ID
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get(':hostId/index')
  @Abilities(542)
  async index(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    console.debug(hostId, operateId);
    res.locals.result = await this.projectService.index(
      hostId,
      'consumers',
      operateId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取服务详情
   * @param hostId 站点ID
   * @param id 服务ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/show')
  @Abilities(543)
  async show(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.show(
      hostId,
      'consumers',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取服务变更日志
   * @param hostId 站点ID
   * @param id 服务ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/log')
  @Abilities(544)
  async log(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.log(hostId, 'consumers', id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建服务
   * @param hostId 站点ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/create')
  @Abilities(545)
  async create(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.create(
      hostId,
      'consumers',
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新服务
   * @param hostId 站点ID
   * @param id 服务ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/:id/update')
  @Abilities(546)
  async update(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.update(
      hostId,
      'consumers',
      id,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 删除服务
   * @param hostId 站点ID
   * @param id 服务ID
   * @param res 响应上下文
   */
  @Delete(':hostId/:id')
  @Abilities(547)
  async destroy(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.destroy(
      hostId,
      'consumers',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
