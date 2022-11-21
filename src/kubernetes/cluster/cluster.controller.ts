// 外部依赖
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { Ability, Abilities, AbilityService } from '../../auth';
import { ClusterDto, ClusterService } from '..';

@Controller('kubernetes/cluster')
export class ClusterController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param clusterService 注入的阿里云密钥服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly clusterService: ClusterService,
  ) {
    const type = '接口';
    const moduleName = 'Kubernetes';
    const objectName = '集群';
    // 密钥管理
    this.abilityService.add(
      [
        { id: 2012, pid: 2010, name: '密钥列表', description: '查看密钥列表' },
        { id: 2013, pid: 2010, name: '密钥详情', description: '查看密钥详情' },
        {
          id: 2014,
          pid: 2010,
          name: '密钥更新历史',
          description: '密钥更新历史',
        },
        { id: 2015, pid: 2010, name: '创建密钥', description: '创建新的密钥' },
        {
          id: 2016,
          pid: 2010,
          name: '修改密钥',
          description: '修改已有的密钥',
        },
        {
          id: 2017,
          pid: 2010,
          name: '密钥排序',
          description: '对密钥进行排序',
        },
      ].map((item) => ({ ...item, type, moduleName, objectName })) as Ability[],
    );
  }

  /**
   * 获取密钥清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(2012)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.clusterService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取密钥详情
   * @param clusterId 密钥ID
   * @param res 响应上下文
   */
  @Get(':clusterId/show')
  @Abilities(2013)
  async show(
    @Param('clusterId', new ParseIntPipe()) clusterId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.clusterService.show(clusterId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取密钥变更日志
   * @param clusterId 密钥ID
   * @param res 响应上下文
   */
  @Get(':clusterId/log')
  @Abilities(134)
  async log(
    @Param('clusterId', new ParseIntPipe()) clusterId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.clusterService.log(clusterId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建密钥
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(135)
  async create(@Body() value: ClusterDto, @Res() res: Response): Promise<void> {
    res.locals.result = await this.clusterService.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新密钥（含禁用和启用密钥）
   * @param clusterId 密钥ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':clusterId/update')
  @Abilities(136)
  async update(
    @Param('clusterId', new ParseIntPipe()) clusterId: number,
    @Body() value: ClusterDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.clusterService.update(
      clusterId,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 密钥排序
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('sort')
  @Abilities(137)
  async sort(@Body() value: object[], @Res() res: Response): Promise<void> {
    res.locals.result = await this.clusterService.sort(value);
    res.status(200).json(res.locals.result);
  }
}
