// 外部依赖
import { Module } from '@nestjs/common';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import {
  InitService,
  UserService,
  InitController,
  UserController,
  CommonGateway,
} from '.';

@Module({
  imports: [SharedModule, AuthModule],
  providers: [CommonGateway, InitService, UserService],
  controllers: [UserController, InitController],
})
export class CommonModule {}
