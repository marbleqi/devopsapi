// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
// 内部依赖
import { OperateEntity } from '..';

@Injectable()
export class OperateService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async set(operateName: string): Promise<number> {
    const result = await this.entityManager.insert(OperateEntity, {
      operateName,
    });
    return Math.max(
      ...result.identifiers.map((item: any) => Number(item.operateId), 0),
    );
  }
}
