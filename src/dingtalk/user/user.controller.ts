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
      {
        id: 432,
        pid: 430,
        name: '用户列表',
        description: '查看用户列表，返回较多字段，用于列表查看',
      },
      { id: 435, pid: 430, name: '创建用户', description: '创建新的用户' },
      {
        id: 436,
        pid: 430,
        name: '更新用户',
        description: '更新已有的用户信息，含禁用',
      },
    ] as Ability[]);
  }

  @Get('index/:id')
  @Abilities(432)
  async apiindex(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() res: Response,
  ) {
    res.locals.result = await this.user.apiIndex(id);
    res.status(200).json(res.locals.result);
  }

  @Get('index')
  @Abilities(432)
  async dbindex(
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
