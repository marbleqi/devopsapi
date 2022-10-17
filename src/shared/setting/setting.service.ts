// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
// 内部依赖
import { Result, SettingEntity, SettingLogEntity, OperateService } from '..';

/**配置服务 */
@Injectable()
export class SettingService implements OnApplicationBootstrap {
  /**
   * 构造函数
   * @param operateService 操作序号服务
   * @param entityManager 实体管理器
   */
  constructor(
    private readonly operateService: OperateService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
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
    return await this.entityManager.findOne(SettingEntity, { where: { code } });
  }

  /**
   * 配置修改
   * @param code 配置code
   * @param value 提交数据
   * @param updateUserId 操作用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async set(
    code: string,
    value: object,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.set('setting');
    const params = { code, value, updateUserId, operateId, reqId };
    const setting = this.entityManager.create(SettingEntity, params);
    const settingresult = await this.entityManager.save(SettingEntity, setting);
    console.debug('settingresult', settingresult);
    // 如果数据更新，则记录配置历史记录更新（异步执行）
    if (settingresult?.updateAt) {
      this.entityManager.save(SettingLogEntity, setting);
    }
    return { code: 0, msg: '新配置生效', operateId, reqId };
  }
}
