// 外部依赖
import { Injectable } from '@nestjs/common';
// 内部依赖
import { Ability } from '..';

/**权限点服务 */
@Injectable()
export class AbilityService {
  /**应用中缓存的权限点对象列表 */
  private abilitylist: Ability[];

  /**构造函数 */
  constructor() {
    this.abilitylist = [
      { id: 1, pid: 0, name: '默认权限', description: '系统默认权限' },
      {
        id: 8,
        pid: 1,
        name: '全局只读权限',
        description: '审查管理员权限，即全局只读类操作的权限',
      },
      {
        id: 9,
        pid: 1,
        name: '全局所有权限',
        description: '超级管理员权限，即所有权限',
      },
    ];
  }

  /**
   * 补充权限点
   * @param abilities 添加的权限点
   */
  add(abilities: Ability[]): void {
    this.abilitylist.push(...abilities);
  }

  /**
   * 获取权限点
   * @returns 权限点清单
   */
  get(): Ability[] {
    return this.abilitylist;
  }
}
