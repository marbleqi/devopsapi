// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EntityManager, MoreThan } from 'typeorm';
// 内部依赖
import {
  Result,
  SettingEntity,
  SettingLogEntity,
  OperateService,
  QueueService,
} from '..';

/**配置服务 */
@Injectable()
export class SettingService implements OnApplicationBootstrap {
  /**配置码与配置值的Map */
  private settingMap: Map<string, object>;
  /**当前最新操作序号，用于差异更新数据 */
  private operateId: number;

  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   * @param queueService 队列服务
   * @param operateService 操作序号服务
   * @param entityManager 实体管理器
   */
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly queueService: QueueService,
    private readonly operateService: OperateService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.settingMap = new Map<string, object>();
    this.operateId = 0;
  }

  /**配置初始化 */
  async onApplicationBootstrap() {
    console.debug('配置服务初始化');
    await this.init();
    await this.reload();
    this.queueService.apiSub.subscribe(async (res) => {
      console.debug('收到消息', res);
      if (res.name === 'setting') {
        console.debug('更新配置缓存');
        await this.reload();
        console.debug('通知前端更新');
        this.queueService.webSub.next(res);
      }
    });
  }

  /**初始化，将数据存入数据库 */
  async init(): Promise<void> {
    /**判断是否已配置系统参数 */
    const result = await this.entityManager.findOne(SettingEntity, {
      select: ['code'],
      where: { code: 'sys' },
    });
    // 如果未配置系统参数，就初始化系统参数
    if (!result) {
      console.debug('需要执行配置初始化');
      await this.entityManager.insert(SettingEntity, {
        code: 'sys',
        value: {
          name: '运维平台',
          title: '运维平台',
          description: '平台在手，天下我有。',
          company: '***公司',
          domain: '***.com',
          icp: '*ICP备*号-*',
          expired: 30,
          password: true,
          wxwork: true,
          dingtalk: true,
        },
        updateUserId: 1,
        updateAt: Date.now(),
        createUserId: 1,
        createAt: Date.now(),
      });
    }
  }

  /**更新缓存的配置 */
  async reload(): Promise<void> {
    /**配置清单 */
    const settingList: SettingEntity[] = await this.entityManager.find(
      SettingEntity,
      {
        select: ['code', 'value', 'operateId'],
        where: { operateId: MoreThan(this.operateId) },
      },
    );
    for (const setting of settingList) {
      this.settingMap.set(setting.code, setting.value);
      if (this.operateId < setting.operateId) {
        this.operateId = setting.operateId;
      }
    }
  }

  /**
   * 配置读取（用于其他模块获取配置值）
   * @param code 配置code
   * @returns 配置值
   */
  read(code: string): object {
    return this.settingMap.get(code);
  }

  /**
   * 配置查询（用于前端获取配置详情）
   * @param code 配置code
   * @returns 配置详情
   */
  async get(code: string): Promise<SettingEntity | null> {
    return await this.entityManager.findOneBy(SettingEntity, { code });
  }

  /**
   * 配置日志查询（用于前端获取配置更新日志）
   * @param code 配置code
   * @returns 配置详情
   */
  async log(code: string): Promise<SettingLogEntity[] | null> {
    return await this.entityManager.findBy(SettingLogEntity, { code });
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
    const operateId = await this.operateService.insert('setting');
    const params = {
      code,
      value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
    };
    const setting = await this.entityManager.findOneBy(SettingEntity, { code });
    if (setting) {
      const result = await this.entityManager.update(
        SettingEntity,
        { code },
        params,
      );
      if (result.affected) {
        this.eventEmitter.emit('setting', code);
        return { code: 0, msg: '新配置已生效', operateId, reqId };
      } else {
        return { code: 400, msg: '新配置未生效', operateId, reqId };
      }
    } else {
      const result = await this.entityManager.insert(SettingEntity, {
        ...params,
        createUserId: params.updateUserId,
        createAt: params.updateAt,
      });
      if (result.identifiers.length) {
        this.eventEmitter.emit('setting', code);
        return { code: 0, msg: '新配置已生效', operateId, reqId };
      } else {
        return { code: 400, msg: '新配置未生效', operateId, reqId };
      }
    }
  }

  /**
   * 增加配置修改日志
   * @param code 更新配置
   */
  @OnEvent('setting')
  async addLog(code: string) {
    // 发送队列任务
    this.queueService.add('setting', code);
    /**配置对象 */
    const setting = await this.entityManager.findOneBy(SettingEntity, { code });
    /**添加日志 */
    this.entityManager.insert(SettingLogEntity, setting);
  }
}
