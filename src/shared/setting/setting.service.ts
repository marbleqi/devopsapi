// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EntityManager } from 'typeorm';
// 内部依赖
import { Result, SettingEntity, SettingLogEntity, OperateService } from '..';

/**配置服务 */
@Injectable()
export class SettingService implements OnApplicationBootstrap {
  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   * @param entityManager 实体管理器
   */
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly operateService: OperateService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async onApplicationBootstrap() {
    const result = await this.get('sys');
    if (!result) {
      console.debug('需要执行配置初始化');
      await this.entityManager.insert(SettingEntity, {
        code: 'sys',
        value: {
          name: '运维平台',
          description: '平台在手，天下我有。',
          title: '运维平台',
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

  /**
   * 配置查询（用于前端获取配置值）
   * @param code 配置code
   * @returns 配置详情
   */
  async get(code: string): Promise<SettingEntity | null> {
    return await this.entityManager.findOneBy(SettingEntity, { code });
  }

  /**
   * 配置日志查询（用于前端获取配置值）
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
    const setting = await this.get(code);
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
    /**配置对象 */
    const setting = await this.get(code);
    /**更新结果 */
    const result = await this.entityManager.insert(SettingLogEntity, setting);
    console.debug('result', result);
  }
}
