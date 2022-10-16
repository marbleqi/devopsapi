// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
// 内部依赖
import { Result, SettingEntity, SettingLogEntity } from '..';

/**配置服务 */
@Injectable()
export class SettingService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(SettingEntity)
    private settingRepository: Repository<SettingEntity>,
    @InjectRepository(SettingLogEntity)
    private settingLogRepository: Repository<SettingLogEntity>,
  ) {}

  async onApplicationBootstrap() {
    console.debug('初始化验证');
    // const  dto=new SettingDto({ code: 'sys', value: { ccd: 'dafsdf' })

    // const data = { code: 'syddddd333d', value: { ccd: 'dafcsdfgsdfsdfsdf' } };
    // const setting = this.settingRepository.create(data);
    // const result = await this.settingRepository.save(setting);
    // console.debug('result', result);
    // await setting.save({ data });
    //   console.debug(setting);

    //   const setting_log = new SettingLogEntity();
    //   // await setting_log.save({ data });
    //   console.debug(setting_log);
    // const setting = await this.get('syddddd333d');
    // console.debug(setting);
    // const settingdto = new SettingDto({ code: 'dd', value: {} });
    // console.debug(settingdto);
    // const value = { name: 0, title: '' };
    // await this.set('sys', value, 1);
  }

  /**
   * 配置查询（用于前端获取配置值）
   * @param code 配置code
   * @returns 配置详情
   */
  async get(code: string): Promise<SettingEntity> {
    return await this.settingRepository.findOne({ where: { code } });
  }

  /**
   * 配置修改
   * @param code 配置code
   * @param value 提交数据
   * @param updateUserId 操作用户ID
   * @returns 响应消息
   */
  async set(
    code: string,
    value: object,
    updateUserId: number,
  ): Promise<Result> {
    const params = { code, value, updateUserId };
    const setting = this.settingRepository.create(params);
    const result = await this.settingRepository.save(setting);
    console.debug('result', result);
    return { code: 0, msg: '新配置生效' };
  }

  @OnEvent('addLog')
  handleOrderCreatedEvent(payload: any) {
    console.debug('事件监听器B得到消息', payload);
  }
}
