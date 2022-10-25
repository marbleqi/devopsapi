// 外部依赖
import { Controller, Res, Body, Get, Post } from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { SettingService } from '../../shared';
import { Ability, Abilities, AbilityService } from '../../auth';
import { DingtalkSettingDto, DingtalkService } from '..';

/**钉钉配置控制器 */
@Controller('dingtalk/setting')
export class SettingController {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   * @param setting 注入的配置服务
   */
  constructor(
    private readonly ability: AbilityService,
    private readonly setting: SettingService,
    private readonly dingtalk: DingtalkService,
  ) {
    this.ability.add([
      { id: 413, pid: 410, name: '查看钉钉配置', description: '查看钉钉配置' },
      { id: 416, pid: 410, name: '修改钉钉配置', description: '修改钉钉配置' },
    ] as Ability[]);
  }

  /**
   * 获取钉钉配置
   * @param res 响应上下文
   */
  @Get()
  @Abilities(413)
  async get(@Res() res: Response): Promise<void> {
    /**配置对象 */
    const data: object = await this.setting.get('dingtalk');
    if (data) {
      res.locals.result = { code: 0, msg: 'ok', data };
    } else {
      res.locals.result = { code: 404, msg: '未找到配置' };
    }
    res.status(200).json(res.locals.result);
  }

  /**
   * 设置钉钉配置
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post()
  @Abilities(416)
  async set(
    @Body() value: DingtalkSettingDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.setting.set(
      'dingtalk',
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
    // 配置修改成功后，立即重新刷新token
    if (!res.locals.result.code) {
      this.dingtalk.token(false);
    }
  }
}
