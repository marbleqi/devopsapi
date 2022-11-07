// 外部依赖
import { IsNotEmpty } from 'class-validator';
// 内部依赖
import { MenuConfig } from '..';

/**菜单信息DTO */
export class MenuDto {
  /**上级菜单ID */
  @IsNotEmpty({ message: '上级菜单ID不能为空' })
  pMenuId: number;

  /**菜单配置 */
  @IsNotEmpty({ message: '菜单配置不能为空' })
  config: MenuConfig;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '状态不能为空' })
  status: number;

  /**授权权限点 */
  @IsNotEmpty({ message: '授权权限点不能为空' })
  abilities: number[];
}
