// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// 内部依赖
import { OperateEntity } from '..';

@Injectable()
export class OperateService {
  constructor(
    @InjectRepository(OperateEntity)
    private operateRepository: Repository<OperateEntity>,
  ) {}

  async set(operateName: string): Promise<number> {
    const operate = this.operateRepository.create({ operateName });
    const result = await this.operateRepository.save(operate);
    return result.operateId;
  }
}
