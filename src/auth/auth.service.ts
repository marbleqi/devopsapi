// 外部依赖
import { Injectable } from '@nestjs/common';
// 内部依赖
import { Ability, AbilityService } from '.';

@Injectable()
export class AuthService {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   */
  constructor(private readonly ability: AbilityService) {
    // 用户管理
    this.ability.add([
      { id: 200, pid: 0, name: '访问控制', description: '访问控制' },
      { id: 210, pid: 200, name: '权限点', description: '权限点管理' },
      { id: 220, pid: 200, name: '菜单', description: '菜单管理' },
      { id: 230, pid: 200, name: '角色', description: '角色管理' },
      { id: 240, pid: 200, name: '用户', description: '用户管理' },
      { id: 250, pid: 200, name: '令牌', description: '令牌管理' },
    ] as Ability[]);
  }
}
