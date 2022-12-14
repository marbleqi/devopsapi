// 外部依赖
import { Controller, Res, Body, Get, Post } from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { SettingService } from '../../shared';
import { Ability, Abilities, AbilityService } from '../../auth';
import { WxworkSettingDto, WxworkService } from '..';

/**企业微信配置控制器 */
@Controller('wxwork/setting')
export class SettingController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param settingService 注入的配置服务
   * @param wxworkService 注入的企业微信服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly settingService: SettingService,
    private readonly wxworkService: WxworkService,
  ) {
    this.abilityService.add([
      { id: 313, pid: 310, name: '查企业微信配置', description: '查配置信息' },
      { id: 316, pid: 310, name: '改企业微信配置', description: '改配置信息' },
    ] as Ability[]);
  }
  /**
   * 获取企业微信配置
   * @param res 响应上下文
   */
  @Get()
  @Abilities(313)
  async get(@Res() res: Response): Promise<void> {
    /**配置对象 */
    const data: object = await this.settingService.get('wxwork');
    if (data) {
      res.locals.result = { code: 0, msg: 'ok', data };
    } else {
      res.locals.result = { code: 404, msg: '未找到配置' };
    }
    res.status(200).json(res.locals.result);
  }

  /**
   * 设置企业微信配置
   * @param value 提交消息体
   * @param res 响应上下文
   */
  @Post()
  @Abilities(316)
  async set(
    @Body() value: WxworkSettingDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.settingService.set(
      'wxwork',
      value,
      res.locals.userId,
      res.locals.reqId,
    );
    res.status(200).json(res.locals.result);
    // 配置修改成功后，立即重新刷新token
    if (!res.locals.result.code) {
      this.wxworkService.token('app', false);
      this.wxworkService.token('checkin', false);
    }
  }
}
