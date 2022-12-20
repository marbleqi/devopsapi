// 外部依赖
import { Controller, Get, Post, Query, Body, Res } from '@nestjs/common';
import { Response } from 'express';
// 内部依赖
import { QueueService } from '../../shared';
import { Ability, Abilities, AbilityService } from '../../auth';

@Controller('sys/queue')
export class QueueController {
  /**
   *
   * @param abilityService 注入的共享权限点服务
   * @param queueService 注入的队列服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly queueService: QueueService,
  ) {
    const main = {
      pid: 230,
      moduleName: '系统管理',
      objectName: '队列',
      type: '接口',
    };
    // 队列管理
    [
      { id: 232, name: '任务列表', description: '查看任务列表' },
      { id: 238, name: '删除任务', description: '删除任务' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  /**
   * 获取任务清单
   * @param condition 任务条件
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(232)
  async index(@Query() condition: any, @Res() res: Response) {
    res.locals.result = await this.queueService.index(condition);
    res.status(200).json(res.locals.result);
  }

  /**
   * 移除指定任务
   * @param idlist 任务ID清单
   * @param res 响应上下文
   */
  @Post('remove')
  @Abilities(238)
  async remove(@Body('idlist') idlist: number[], @Res() res: Response) {
    res.locals.result = await this.queueService.remove(idlist);
    res.status(200).json(res.locals.result);
  }

  /**
   * 清空任务列表
   * @param res 响应上下文
   */
  @Post('clean')
  @Abilities(238)
  async clean(@Res() res: Response) {
    res.locals.result = await this.queueService.clean();
    res.status(200).json(res.locals.result);
  }
}
