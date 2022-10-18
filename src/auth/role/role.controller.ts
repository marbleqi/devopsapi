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
import {
  Ability,
  Abilities,
  AbilityService,
  RoleService,
  UserService,
} from '..';

@Controller('auth/role')
export class RoleController {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   * @param role 注入的角色服务
   * @param user 注入的用户服务
   */
  constructor(
    private readonly ability: AbilityService,
    private readonly role: RoleService,
    private readonly user: UserService,
  ) {
    // 角色管理
    this.ability.add([
      {
        id: 141,
        pid: 140,
        name: '角色选项',
        description: '获取角色选项，仅返回角色ID和角色名称两项',
      },
      {
        id: 142,
        pid: 140,
        name: '角色列表',
        description: '查看角色列表，返回较多字段，用于列表查看',
      },
      {
        id: 143,
        pid: 140,
        name: '角色详情',
        description: '查看角色详情，编辑页面初始化时数据',
      },
      { id: 144, pid: 140, name: '创建角色', description: '创建新的角色' },
      { id: 145, pid: 140, name: '修改角色', description: '修改已有的角色' },
      {
        id: 146,
        pid: 140,
        name: '角色排序',
        description: '对已有的角色进行排序',
      },
    ] as Ability[]);
  }

  /**
   * 获取角色清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(8, 9, 141, 142)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.role.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取角色详情
   * @param roleId 角色ID
   * @param res 响应上下文
   */
  @Get(':roleId/show')
  @Abilities(8, 9, 143)
  async show(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.role.show(roleId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取角色变更日志
   * @param id 角色ID
   * @param res 响应上下文
   */
  @Get(':roleId/log')
  @Abilities(8, 9, 143)
  async log(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.role.log(roleId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建角色
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(9, 144)
  async create(@Body() value: object, @Res() res: Response): Promise<void> {
    res.locals.result = await this.role.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新角色（含禁用和启用角色）
   * @param roleId 角色ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':roleId/update')
  @Abilities(9, 145)
  async update(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Body() value: object,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.role.update(
      roleId,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 角色排序
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('sort')
  @Abilities(9, 146)
  async sort(@Body() value: object[], @Res() res: Response): Promise<void> {
    res.locals.result = await this.role.sort(value);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取授权角色的用户清单
   * @param roleId 提交消息体
   * @param res 响应上下文
   */
  @Get(':roleId/grant')
  @Abilities(9, 153)
  async granted(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.user.granted(roleId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 设置授权角色的用户清单
   * @param roleId 待授权的角色
   * @param userIds 待授权角色的用户清单
   * @param res 响应上下文
   */
  @Post(':roleId/grant')
  @Abilities(9, 155)
  async grant(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Body() userIds: number[],
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.user.grant(
      roleId,
      userIds,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
