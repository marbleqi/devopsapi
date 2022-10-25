// 外部依赖
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
// 内部依赖
import { SharedModule } from './shared/shared.module';
import { SysModule } from './sys/sys.module';
import { AuthModule } from './auth/auth.module';
import { TokenGuard } from './auth';
import { ReqInterceptor } from './shared';
import { PassportModule } from './passport/passport.module';
import { CommonModule } from './common/common.module';
import { WxworkModule } from './wxwork/wxwork.module';
import { DingtalkModule } from './dingtalk/dingtalk.module';
import { KongModule } from './kong/kong.module';
import { AliyunModule } from './aliyun/aliyun.module';
import { AlipayModule } from './alipay/alipay.module';
import { AndroidModule } from './android/android.module';
import { AccountModule } from './account/account.module';
import { KubernetesModule } from './kubernetes/kubernetes.module';
import { NacosModule } from './nacos/nacos.module';
import { NotifyModule } from './notify/notify.module';
import { WechatModule } from './wechat/wechat.module';

/**主模块 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // 进行配置参数验证
        if (!process.env.POSTGRES_HOST) {
          throw new Error('未配置数据库地址');
        }
        const host = process.env.POSTGRES_HOST;
        if (!process.env.POSTGRES_DB) {
          throw new Error('未配置数据库名');
        }
        const port = parseInt(process.env.POSTGRES_PORT, 10) || 5432;
        const database = process.env.POSTGRES_DB;
        if (!process.env.POSTGRES_USER) {
          throw new Error('未配置数据库用户');
        }
        const username = process.env.POSTGRES_USER;
        if (!process.env.POSTGRES_PSW) {
          throw new Error('未配置数据库密码');
        }
        const password = process.env.POSTGRES_PSW;
        console.debug('当前环境', process.env.NODE_ENV);
        /**同步配置，当开发环境和演示环境时，自动同步表结构 */
        const synchronize = ['dev', 'demo'].includes(process.env.NODE_ENV);
        return {
          type: 'postgres',
          host,
          port,
          database,
          username,
          password,
          synchronize,
          autoLoadEntities: true,
        } as TypeOrmModuleOptions;
      },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    SharedModule,
    AuthModule,
    SharedModule,
    AuthModule,
    SysModule,
    PassportModule,
    CommonModule,
    WxworkModule,
    DingtalkModule,
    KongModule,
    AliyunModule,
    AlipayModule,
    AndroidModule,
    AccountModule,
    KubernetesModule,
    NacosModule,
    NotifyModule,
    WechatModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TokenGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ReqInterceptor,
    },
  ],
})
export class AppModule {}
