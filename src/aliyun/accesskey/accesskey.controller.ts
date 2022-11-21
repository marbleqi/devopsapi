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
import { AccesskeyDto, AccesskeyService } from '..';

@Controller('aliyun/accesskey')
export class AccesskeyController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param accesskeyService 注入的阿里云密钥服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly accesskeyService: AccesskeyService,
  ) {
    const type = '接口';
    const moduleName = '阿里云';
    const objectName = '密钥';
    // 密钥管理
    this.abilityService.add(
      [
        { id: 1012, pid: 1010, name: '密钥列表', description: '查看密钥列表' },
        { id: 1013, pid: 1010, name: '密钥详情', description: '查看密钥详情' },
        {
          id: 1014,
          pid: 1010,
          name: '密钥更新历史',
          description: '密钥更新历史',
        },
        { id: 1015, pid: 1010, name: '创建密钥', description: '创建新的密钥' },
        {
          id: 1016,
          pid: 1010,
          name: '修改密钥',
          description: '修改已有的密钥',
        },
        {
          id: 1017,
          pid: 1010,
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
  @Abilities(1012)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.accesskeyService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取密钥详情
   * @param keyId 密钥ID
   * @param res 响应上下文
   */
  @Get(':keyId/show')
  @Abilities(1013)
  async show(
    @Param('keyId', new ParseIntPipe()) keyId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.accesskeyService.show(keyId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取密钥变更日志
   * @param keyId 密钥ID
   * @param res 响应上下文
   */
  @Get(':keyId/log')
  @Abilities(1014)
  async log(
    @Param('keyId', new ParseIntPipe()) keyId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.accesskeyService.log(keyId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建密钥
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(1015)
  async create(
    @Body() value: AccesskeyDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.accesskeyService.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新密钥（含禁用和启用密钥）
   * @param keyId 密钥ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':keyId/update')
  @Abilities(1016)
  async update(
    @Param('keyId', new ParseIntPipe()) keyId: number,
    @Body() value: AccesskeyDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.accesskeyService.update(
      keyId,
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
  @Abilities(1017)
  async sort(@Body() value: object[], @Res() res: Response): Promise<void> {
    res.locals.result = await this.accesskeyService.sort(value);
    res.status(200).json(res.locals.result);
  }
}
