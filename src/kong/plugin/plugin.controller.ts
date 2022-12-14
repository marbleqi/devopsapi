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
import { ProjectService, PluginService } from '..';

@Controller('kong/plugin')
export class PluginController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点插件
   * @param projectService 注入的对象插件
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly projectService: ProjectService,
    private readonly pluginService: PluginService,
  ) {
    // 插件管理
    this.abilityService.add([
      { id: 591, pid: 590, name: '插件同步', description: '插件同步' },
      { id: 592, pid: 590, name: '插件列表', description: '插件列表' },
      { id: 593, pid: 590, name: '插件详情', description: '插件详情' },
      { id: 594, pid: 590, name: '插件变更历史', description: '创建插件' },
      { id: 595, pid: 590, name: '创建插件', description: '创建插件' },
      { id: 596, pid: 590, name: '修改插件', description: '修改插件' },
      { id: 597, pid: 590, name: '删除插件', description: '删除插件' },
    ] as Ability[]);
  }

  /**
   * 插件数据同步
   * @param hostId 站点ID
   * @param res 响应上下文
   */
  @Post(':hostId/sync')
  @Abilities(591)
  async sync(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.sync(
      hostId,
      'plugins',
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取可选的插件清单
   * @param hostId 站点ID
   * @param res 响应上下文
   */
  @Get(':hostId/plugin')
  @Abilities(592)
  async plugin(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.pluginService.plugin(hostId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取插件清单
   * @param hostId 站点ID
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get(':hostId/index')
  @Abilities(592)
  async index(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    console.debug(hostId, operateId);
    res.locals.result = await this.projectService.index(
      hostId,
      'plugins',
      operateId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取插件详情
   * @param hostId 站点ID
   * @param id 插件ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/show')
  @Abilities(593)
  async show(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.show(
      hostId,
      'plugins',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取插件变更日志
   * @param hostId 站点ID
   * @param id 插件ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/log')
  @Abilities(594)
  async log(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.log(hostId, 'plugins', id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建插件
   * @param hostId 站点ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/create')
  @Abilities(595)
  async create(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.create(
      hostId,
      'plugins',
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新插件
   * @param hostId 站点ID
   * @param id 插件ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':hostId/:id/update')
  @Abilities(596)
  async update(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Body() value: any,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.update(
      hostId,
      'plugins',
      id,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 删除插件
   * @param hostId 站点ID
   * @param id 插件ID
   * @param res 响应上下文
   */
  @Delete(':hostId/:id')
  @Abilities(597)
  async destroy(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.destroy(
      hostId,
      'plugins',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
