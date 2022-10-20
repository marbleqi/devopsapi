// 外部依赖
import { Injectable } from '@nestjs/common';
// 内部依赖
import { Ability, AbilityService } from '../auth';

@Injectable()
export class SysService {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   */
  constructor(private readonly ability: AbilityService) {
    // 用户管理
    this.ability.add([
      { id: 100, pid: 0, name: '系统', description: '系统管理' },
      { id: 110, pid: 100, name: '配置', description: '系统参数配置' },
      { id: 120, pid: 100, name: '请求日志', description: '请求日志' },
      { id: 130, pid: 100, name: '队列', description: '队列管理' },
    ] as Ability[]);
  }
}
