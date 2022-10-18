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
import { Ability, Abilities, AbilityService, UserService } from '..';

@Controller('auth/user')
export class UserController {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   * @param user 注入的用户服务
   */
  constructor(
    private readonly ability: AbilityService,
    private readonly user: UserService,
  ) {
    // 用户管理
    this.ability.add([
      {
        id: 151,
        pid: 150,
        name: '用户选项',
        description: '获取用户选项，仅返回用户ID和用户姓名两项',
      },
      {
        id: 152,
        pid: 150,
        name: '用户列表',
        description: '查看用户列表，返回较多字段，用于列表查看',
      },
      { id: 153, pid: 150, name: '用户详情', description: '查看用户详情' },
      { id: 154, pid: 150, name: '创建用户', description: '创建新的用户' },
      {
        id: 155,
        pid: 150,
        name: '更新用户',
        description: '更新已有的用户信息，含禁用',
      },
      {
        id: 156,
        pid: 150,
        name: '用户解锁',
        description: '对账户锁定的用户进行解锁',
      },
      { id: 157, pid: 150, name: '重置密码', description: '重置用户密码' },
    ] as Ability[]);
  }

  /**
   * 获取用户清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(8, 9, 151, 152)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.user.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取用户详情
   * @param userId 用户ID
   * @param res 响应上下文
   */
  @Get(':userId/show')
  @Abilities(8, 9, 153)
  async show(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.user.show(userId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取用户变更日志
   * @param id 用户ID
   * @param res 响应上下文
   */
  @Get(':userId/log')
  @Abilities(8, 9, 153)
  async log(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.user.log(userId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建用户
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post('create')
  @Abilities(9, 154)
  async create(@Body() value: object, @Res() res: Response): Promise<void> {
    res.locals.result = await this.user.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新用户（含禁用）
   * @param userId 用户ID
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post(':userId/update')
  @Abilities(9, 155)
  async update(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Body() value: object,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.user.update(
      userId,
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 解锁用户
   * @param id 角色ID
   * @param res 响应上下文
   */
  @Post(':userId/unlock')
  @Abilities(9, 156)
  async unlock(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.user.unlock(
      userId,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 重置用户密码
   * @param userId 用户ID
   * @param loginPsw 新密码
   * @param res 响应上下文
   */
  @Post(':userId/resetpsw')
  @Abilities(9, 157)
  async resetpsw(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Body('loginPsw') loginPsw: string,
    @Res() res: Response,
  ): Promise<void> {
    // 将上下文的密码替换，避免将密码明文记入日志
    res.locals.request.body.loginPsw = '************';
    res.locals.result = await this.user.resetpsw(
      userId,
      loginPsw,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
