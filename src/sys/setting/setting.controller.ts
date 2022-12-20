// 外部依赖
import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { SettingService } from '../../shared';
import { Ability, Abilities, AbilityService } from '../../auth';
import { SettingDto } from '..';

@Controller('sys/setting')
export class SettingController {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   * @param setting 注入的配置服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly setting: SettingService,
  ) {
    const main = {
      pid: 210,
      moduleName: '系统管理',
      objectName: '配置',
      type: '接口',
    };
    // 系统配置
    [
      { id: 213, name: '查看配置', description: '查看系统配置' },
      { id: 215, name: '修改配置', description: '修改系统配置' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }
  /**
   * 获取系统配置
   * @param res 响应上下文
   */
  @Get('show')
  @Abilities(213)
  async get(@Res() res: Response): Promise<void> {
    /**配置对象 */
    const data = await this.setting.get('sys');
    if (data) {
      res.locals.result = { code: 0, msg: 'ok', data };
    } else {
      res.locals.result = { code: 404, msg: '未找到配置' };
    }
    res.status(200).json(res.locals.result);
  }

  /**
   * 设置系统配置
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post()
  @Abilities(215)
  async set(@Body() value: SettingDto, @Res() res: Response): Promise<void> {
    res.locals.result = await this.setting.set(
      'sys',
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
  }
}
