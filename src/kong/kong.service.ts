// 外部依赖
import { Injectable } from '@nestjs/common';
// 内部依赖
import { Ability, AbilityService } from '../auth';

@Injectable()
export class KongService {
  /**
   * 构造函数
   * @param ability 注入的权限点服务
   */
  constructor(private readonly ability: AbilityService) {
    // 用户管理
    this.ability.add([
      { id: 500, pid: 0, name: 'KONG管理', description: 'KONG管理' },
      { id: 510, pid: 500, name: '站点', description: '站点管理' },
      { id: 520, pid: 500, name: '路由', description: '路由管理' },
      { id: 530, pid: 500, name: '服务', description: '服务管理' },
      { id: 540, pid: 500, name: '用户', description: '用户管理' },
      { id: 550, pid: 500, name: '证书', description: '证书管理' },
      { id: 560, pid: 500, name: '上游', description: '上游管理' },
      { id: 570, pid: 500, name: '目标', description: '目标管理' },
      { id: 580, pid: 500, name: '插件', description: '插件管理' },
    ] as Ability[]);
  }
}
