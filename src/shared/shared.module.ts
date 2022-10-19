// 外部依赖
import { Module } from '@nestjs/common';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import {
  ReqEntity,
  OperateEntity,
  SettingEntity,
  SettingLogEntity,
  QueueService,
  RedisService,
  CommonService,
  ReqService,
  OperateService,
  SettingService,
} from '.';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReqEntity,
      OperateEntity,
      SettingEntity,
      SettingLogEntity,
    ]),
    BullModule.registerQueueAsync({
      name: 'shared',
      useFactory: () => {
        if (!process.env.REDIS_HOST) {
          throw new Error('队列未配置缓存地址');
        }
        const host = process.env.REDIS_HOST;
        const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
        const db = process.env.REDIS_DB || 0;
        const password = process.env.REDIS_PSW || '';
        const redis = { host, port, db, password };
        console.debug('消息队列使用的Redis地址', redis);
        return { redis } as BullModuleOptions;
      },
    }),
  ],
  providers: [
    QueueService,
    RedisService,
    CommonService,
    ReqService,
    OperateService,
    SettingService,
  ],
  exports: [
    QueueService,
    RedisService,
    CommonService,
    ReqService,
    OperateService,
    SettingService,
  ],
})
export class SharedModule {}
