// 外部依赖
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// 内部依赖
import { SharedModule } from '../shared/shared.module';
import {
  MenuEntity,
  MenuLogEntity,
  RoleEntity,
  RoleLogEntity,
  UserEntity,
  UserLogEntity,
  AbilityService,
  RoleService,
  MenuService,
  UserService,
  TokenService,
  AbilityController,
  RoleController,
  MenuController,
  UserController,
  TokenController,
} from '.';

/**认证模块 */
@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      MenuEntity,
      MenuLogEntity,
      RoleEntity,
      RoleLogEntity,
      UserEntity,
      UserLogEntity,
    ]),
  ],
  providers: [
    AbilityService,
    RoleService,
    MenuService,
    UserService,
    TokenService,
  ],
  controllers: [
    AbilityController,
    RoleController,
    MenuController,
    UserController,
    TokenController,
  ],
  exports: [
    AbilityService,
    RoleService,
    MenuService,
    UserService,
    TokenService,
  ],
})
export class AuthModule {}
