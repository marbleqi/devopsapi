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

@Controller('kong/route')
export class RouteController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点路由
   * @param projectService 注入的对象路由
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly projectService: ProjectService,
  ) {
    // 路由管理
    this.abilityService.add([
      { id: 521, pid: 520, name: '路由同步', description: '路由同步' },
      { id: 522, pid: 520, name: '路由列表', description: '路由列表' },
      { id: 523, pid: 520, name: '路由详情', description: '路由详情' },
      { id: 524, pid: 520, name: '路由变更历史', description: '创建路由' },
      { id: 525, pid: 520, name: '创建路由', description: '创建路由' },
      { id: 526, pid: 520, name: '修改路由', description: '修改路由' },
      { id: 527, pid: 520, name: '删除路由', description: '删除路由' },
    ] as Ability[]);
  }

  /**
   * 路由数据同步
   * @param hostId 站点ID
   * @param res 响应上下文
   */
  @Post(':hostId/sync')
  @Abilities(521)
  async sync(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.sync(
      hostId,
      'routes',
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取路由清单
   * @param hostId 站点ID
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get(':hostId/index')
  @Abilities(522)
  async index(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    console.debug(hostId, operateId);
    res.locals.result = await this.projectService.index(
      hostId,
      'routes',
      operateId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取路由详情
   * @param hostId 站点ID
   * @param id 路由ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/show')
  @Abilities(523)
  async show(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.show(
      hostId,
      'routes',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取路由变更日志
   * @param hostId 站点ID
   * @param id 路由ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/log')
  @Abilities(524)
  async log(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.log(hostId, 'routes', id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建路由
   * @param hostId 站点ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/create')
  @Abilities(525)
  async create(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.create(
      hostId,
      'routes',
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新路由
   * @param hostId 站点ID
   * @param id 路由ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/:id/update')
  @Abilities(526)
  async update(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.update(
      hostId,
      'routes',
      id,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 删除路由
   * @param hostId 站点ID
   * @param id 路由ID
   * @param res 响应上下文
   */
  @Delete(':hostId/:id')
  @Abilities(527)
  async destroy(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.update(
      hostId,
      'routes',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
