// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
// 内部依赖
import { OperateEntity } from '..';

/**操作序号服务 */
@Injectable()
export class OperateService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async insert(operateName: string): Promise<number> {
    const result = await this.entityManager.insert(OperateEntity, {
      operateName,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      return Number(result.identifiers[0].operateId);
    } else {
      return 0;
    }
  }
}
