// 外部依赖
import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { QueueService, SettingEntity, SettingService } from '../../shared';
import { Ability, Abilities, AbilityService } from '../../auth';
import { SettingDto } from '..';

@Controller('sys/setting')
export class SettingController {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   * @param setting 注入的配置服务
   * @param queue 注入的队列服务
   */
  constructor(
    private readonly ability: AbilityService,
    private readonly setting: SettingService,
    private readonly queue: QueueService,
  ) {
    // 系统配置
    this.ability.add([
      { id: 113, pid: 110, name: '查看配置', description: '查看系统配置' },
      { id: 115, pid: 110, name: '修改配置', description: '修改系统配置' },
    ] as Ability[]);
  }
  /**
   * 获取系统配置
   * @param res 响应上下文
   */
  @Get('show')
  @Abilities(8, 9, 113)
  async get(@Res() res: Response): Promise<void> {
    /**配置对象 */
    const data: SettingEntity = await this.setting.get('sys');
    console.debug('data', data);
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
  @Abilities(9, 115)
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
