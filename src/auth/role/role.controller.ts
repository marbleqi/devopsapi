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
  RoleDto,
  AbilityService,
  RoleService,
  UserService,
} from '..';

/**角色控制器 */
@Controller('auth/role')
export class RoleController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param roleService 注入的角色服务
   * @param userService 注入的用户服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {
    const main = {
      pid: 130,
      moduleName: '认证',
      objectName: '角色',
      type: '接口',
    };
    // 角色管理
    [
      { id: 132, name: '角色列表', description: '角色列表' },
      { id: 133, name: '角色详情', description: '查看角色详情' },
      { id: 134, name: '角色历史', description: '角色更新历史' },
      { id: 135, name: '创建角色', description: '创建新的角色' },
      { id: 136, name: '修改角色', description: '修改已有的角色' },
      { id: 137, name: '角色排序', description: '对角色进行排序' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  /**
   * 获取角色清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(132)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.roleService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取角色详情
   * @param roleId 角色ID
   * @param res 响应上下文
   */
  @Get(':roleId/show')
  @Abilities(133)
  async show(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.roleService.show(roleId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取角色变更日志
   * @param roleId 角色ID
   * @param res 响应上下文
   */
  @Get(':roleId/log')
  @Abilities(134)
  async log(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.roleService.log(roleId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建角色
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(135)
  async create(@Body() value: RoleDto, @Res() res: Response): Promise<void> {
    res.locals.result = await this.roleService.create(
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
  @Abilities(136)
  async update(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Body() value: RoleDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.roleService.update(
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
  @Abilities(137)
  async sort(@Body() value: object[], @Res() res: Response): Promise<void> {
    res.locals.result = await this.roleService.sort(value);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取授权角色的用户清单
   * @param roleId 角色ID
   * @param res 响应上下文
   */
  @Get(':roleId/grant')
  @Abilities(153)
  async granted(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.userService.granted(roleId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 设置授权角色的用户清单
   * @param roleId 待授权的角色ID
   * @param userIds 待授权角色的用户清单
   * @param res 响应上下文
   */
  @Post(':roleId/grant')
  @Abilities(155)
  async grant(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Body() userIds: number[],
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.userService.grant(
      roleId,
      userIds,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
