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
    const main = {
      pid: 550,
      moduleName: 'KONG',
      objectName: '用户',
      type: '接口',
    };
    // 用户管理
    [
      { id: 551, name: '用户同步', description: '用户同步' },
      { id: 552, name: '用户列表', description: '用户列表' },
      { id: 553, name: '用户详情', description: '用户详情' },
      { id: 554, name: '用户变更历史', description: '创建用户' },
      { id: 555, name: '创建用户', description: '创建用户' },
      { id: 556, name: '修改用户', description: '修改用户' },
      { id: 557, name: '删除用户', description: '删除用户' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  /**
   * 服务数据同步
   * @param hostId 站点ID
   * @param res 响应上下文
   */
  @Post(':hostId/sync')
  @Abilities(551)
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
  @Abilities(552)
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
  @Abilities(553)
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
  @Abilities(554)
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
  @Abilities(555)
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
  @Abilities(556)
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
  @Abilities(557)
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
