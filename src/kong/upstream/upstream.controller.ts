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

@Controller('kong/upstream')
export class UpstreamController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点上游
   * @param projectService 注入的对象上游
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly projectService: ProjectService,
  ) {
    // 上游管理
    this.abilityService.add([
      { id: 561, pid: 560, name: '上游同步', description: '上游同步' },
      { id: 562, pid: 560, name: '上游列表', description: '上游列表' },
      { id: 563, pid: 560, name: '上游详情', description: '上游详情' },
      { id: 564, pid: 560, name: '上游变更历史', description: '创建上游' },
      { id: 565, pid: 560, name: '创建上游', description: '创建上游' },
      { id: 566, pid: 560, name: '修改上游', description: '修改上游' },
      { id: 567, pid: 560, name: '删除上游', description: '删除上游' },
    ] as Ability[]);
  }

  /**
   * 上游数据同步
   * @param hostId 站点ID
   * @param res 响应上下文
   */
  @Post(':hostId/sync')
  @Abilities(561)
  async sync(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.sync(
      hostId,
      'upstreams',
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取上游清单
   * @param hostId 站点ID
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get(':hostId/index')
  @Abilities(562)
  async index(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    console.debug(hostId, operateId);
    res.locals.result = await this.projectService.index(
      hostId,
      'upstreams',
      operateId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取上游详情
   * @param hostId 站点ID
   * @param id 上游ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/show')
  @Abilities(563)
  async show(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.show(
      hostId,
      'upstreams',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取上游变更日志
   * @param hostId 站点ID
   * @param id 上游ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/log')
  @Abilities(564)
  async log(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.log(hostId, 'upstreams', id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建上游
   * @param hostId 站点ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/create')
  @Abilities(565)
  async create(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.create(
      hostId,
      'upstreams',
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新上游
   * @param hostId 站点ID
   * @param id 上游ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/:id/update')
  @Abilities(566)
  async update(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.update(
      hostId,
      'upstreams',
      id,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 删除上游
   * @param hostId 站点ID
   * @param id 上游ID
   * @param res 响应上下文
   */
  @Delete(':hostId/:id')
  @Abilities(567)
  async destroy(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    console.debug('删除请求数据', hostId, id);
    res.locals.result = await this.projectService.destroy(
      hostId,
      'upstreams',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
