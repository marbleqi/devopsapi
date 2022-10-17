// 外部依赖
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
// 内部依赖
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { SysModule } from './sys/sys.module';
import { TokenGuard } from './auth';
import { ReqInterceptor } from './shared';

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
        const synchronize = process.env.NODE_ENV === 'dev';
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
