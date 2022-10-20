// 外部依赖
import { Injectable } from '@nestjs/common';
// 内部依赖
import { Ability } from '..';

/**权限点服务 */
@Injectable()
export class AbilityService {
  /**应用中缓存的权限点对象列表 */
  private abilitylist: Ability[] = [];

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
