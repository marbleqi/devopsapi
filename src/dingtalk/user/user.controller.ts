// 外部依赖
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { Ability, Abilities, AbilityService } from '../../auth';
import { CreateDingtalkUserDto, UpdateDingtalkUserDto, UserService } from '..';

@Controller('dingtalk/user')
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
      { id: 432, pid: 430, name: '钉钉用户列表', description: '钉钉用户列表' },
      { id: 435, pid: 430, name: '创建关联用户', description: '创建关联用户' },
      { id: 436, pid: 430, name: '更新关联用户', description: '更新关联用户' },
    ] as Ability[]);
  }

  @Get('index/:dept_id')
  @Abilities(432)
  async apiIndex(
    @Param('dept_id', new ParseIntPipe()) dept_id: number,
    @Res() res: Response,
  ) {
    res.locals.result = await this.user.apiIndex(dept_id);
    res.status(200).json(res.locals.result);
  }

  @Get('index')
  @Abilities(432)
  async dbIndex(
    @Query('operateid', new ParseIntPipe()) operateid: number,
    @Res() res: Response,
  ) {
    res.locals.result = await this.user.dbIndex(operateid);
    res.status(200).json(res.locals.result);
  }

  @Post('create')
  @Abilities(435)
  async create(@Body() value: CreateDingtalkUserDto, @Res() res: Response) {
    res.locals.result = await this.user.create(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }

  @Post('save')
  @Abilities(436)
  async save(@Body() value: UpdateDingtalkUserDto, @Res() res: Response) {
    res.locals.result = await this.user.save(
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}