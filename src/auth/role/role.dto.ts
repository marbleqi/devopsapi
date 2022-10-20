import { IsNotEmpty } from 'class-validator';

/**角色信息DTO */
export class RoleDto {
  /**角色名称 */
  @IsNotEmpty({ message: '角色名称不能为空' })
  roleName: string;

  /**角色说明 */
  @IsNotEmpty({ message: '角色说明不能为空' })
  description: string;

  /**角色配置 */
  config: any;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '状态不能为空' })
  status: number;

  /**授权权限点 */
  @IsNotEmpty({ message: '授权权限点不能为空' })
  abilities: number[];
}
