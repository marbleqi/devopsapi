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

@Controller('kong/certificate')
export class CertificateController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点证书
   * @param projectService 注入的对象证书
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly projectService: ProjectService,
  ) {
    // 证书管理
    this.abilityService.add([
      { id: 551, pid: 550, name: '证书同步', description: '证书同步' },
      { id: 552, pid: 550, name: '证书列表', description: '证书列表' },
      { id: 553, pid: 550, name: '证书详情', description: '证书详情' },
      { id: 554, pid: 550, name: '证书变更历史', description: '创建证书' },
      { id: 555, pid: 550, name: '创建证书', description: '创建证书' },
      { id: 556, pid: 550, name: '修改证书', description: '修改证书' },
      { id: 557, pid: 550, name: '删除证书', description: '删除证书' },
    ] as Ability[]);
  }

  /**
   * 证书数据同步
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
      'certificates',
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取证书清单
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
      'certificates',
      operateId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取证书详情
   * @param hostId 站点ID
   * @param id 证书ID
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
      'certificates',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取证书变更日志
   * @param hostId 站点ID
   * @param id 证书ID
   * @param res 响应上下文
   */
  @Get(':hostId/:id/log')
  @Abilities(554)
  async log(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.projectService.log(
      hostId,
      'certificates',
      id,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建证书
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
      'certificates',
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新证书
   * @param hostId 站点ID
   * @param id 证书ID
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
      'certificates',
      id,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 删除证书
   * @param hostId 站点ID
   * @param id 证书ID
   * @param res 响应上下文
   */
  @Delete(':hostId/:id')
  @Abilities(557)
  async destroy(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    console.debug('删除请求数据', hostId, id);
    res.locals.result = await this.projectService.destroy(
      hostId,
      'certificates',
      id,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
