// 外部依赖
import { Module } from '@nestjs/common';
// 内部依赖
import {
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
})
export class AuthModule {}
