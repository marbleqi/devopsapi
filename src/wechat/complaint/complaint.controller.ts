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
import { ResponseDto, CompleteDto, ComplaintService } from '..';

@Controller('wechat/complaint')
export class ComplaintController {
  /**
   * 构造函数
   * @param abilityService 注入的权限点服务
   * @param ComplaintService 注入的投诉服务
   */
  constructor(
    private readonly abilityService: AbilityService,
    private readonly complaintService: ComplaintService,
  ) {
    const main = {
      pid: 650,
      moduleName: '微信',
      objectName: '投诉',
      type: '接口',
    };
    // 投诉管理
    [
      { id: 652, name: '投诉列表', description: '投诉列表' },
      { id: 653, name: '投诉详情', description: '投诉详情' },
      { id: 654, name: '投诉历史', description: '投诉历史' },
      { id: 655, name: '投诉回复', description: '投诉回复' },
      { id: 656, name: '投诉完成', description: '投诉处理完成' },
    ].map((item) =>
      this.abilityService.add([{ ...main, ...item }] as Ability[]),
    );
  }

  /**
   * 获取投诉清单
   * @param operateId 操作序号，用于获取增量数据
   * @param res 响应上下文
   */
  @Get('index')
  @Abilities(612)
  async index(
    @Query('operateId', new ParseIntPipe()) operateId: number,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.complaintService.index(operateId);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取投诉详情
   * @param complaint_id 投诉微信ID
   * @param res 响应上下文
   */
  @Get(':complaint_id/show')
  @Abilities(613)
  async show(
    @Param('complaint_id') complaint_id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.complaintService.show(complaint_id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 获取投诉变更日志
   * @param corpid 投诉微信ID
   * @param res 响应上下文
   */
  @Get(':complaint_id/history')
  @Abilities(614)
  async history(
    @Param('complaint_id') complaint_id: string,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.complaintService.history(complaint_id);
    res.status(200).json(res.locals.result);
  }

  /**
   * 创建投诉
   * @param value 提交的投诉信息
   * @param res 响应上下文
   */
  @Post(':complaint_id/response')
  @Abilities(615)
  async response(
    @Param('complaint_id') complaint_id: string,
    @Body() value: ResponseDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.complaintService.response(
      complaint_id,
      value,
    );
    res.status(200).json(res.locals.result);
  }

  /**
   * 更新投诉（含禁用和启用投诉）
   * @param hostId 投诉ID
   * @param value 提交的投诉信息
   * @param res 响应上下文
   */
  @Post(':complaint_id/complete')
  @Abilities(616)
  async complete(
    @Param('complaint_id') complaint_id: string,
    @Body() value: CompleteDto,
    @Res() res: Response,
  ): Promise<void> {
    res.locals.result = await this.complaintService.complete(
      complaint_id,
      value,
    );
    res.status(200).json(res.locals.result);
  }
}
