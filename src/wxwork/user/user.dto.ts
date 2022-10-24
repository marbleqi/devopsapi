import { IsNotEmpty } from 'class-validator';
import { UserConfig } from '../../auth';

/**创建用户并关联企业微信账号的DTO */
export class CreateWxworkUserDto {
  /**企业微信用户信息ID */
  @IsNotEmpty({ message: '企业微信用户ID不能为空' })
  wxworkId: string;

  /**登陆名 */
  @IsNotEmpty({ message: '登陆名不能为空' })
  loginName: string;

  /**姓名 */
  @IsNotEmpty({ message: '姓名不能为空' })
  userName: string;

  /**用户配置 */
  @IsNotEmpty({ message: '用户配置不能为空' })
  config: UserConfig;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '用户状态不能为空' })
  status: number;

  /**授权角色 */
  @IsNotEmpty({ message: '授权角色不能为空' })
  roles: number[];
}

/**企业微信用户信息DTO */
export class UpdateWxworkUserDto {
  /**企业微信用户信息ID */
  @IsNotEmpty({ message: '企业微信用户ID不能为空' })
  wxworkId: string;

  /**用户ID */
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: number;
}
