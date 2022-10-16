// 外部依赖
import { SetMetadata } from '@nestjs/common';

/**权限点装饰器 */
export const Abilities = (...abilities: number[]) =>
  SetMetadata('abilities', abilities);
