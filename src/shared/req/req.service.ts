// 外部依赖
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
// 内部依赖
import { ReqEntity } from '..';

@Injectable()
export class ReqService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  @OnEvent('addLog')
  handleOrderCreatedEvent(payload: any) {
    console.debug('事件监听器A得到消息', payload);
  }

  /**
   * 新增请求日志
   * @param data 更新数据
   * @returns 更新结果
   */
  async insert(data: object): Promise<number> {
    const result = await this.entityManager.insert(ReqEntity, data);
    if (result.identifiers.length) {
      return Number(result.identifiers[0].reqId);
    } else {
      return 0;
    }
  }

  /**
   * 更新请求日志
   * @param reqId 请求日志ID
   * @returns 更新结果
   */
  update(reqId: number, value: object): void {
    this.entityManager.update(
      ReqEntity,
      { reqId },
      { ...value, endAt: Date.now() },
    );
  }
}
