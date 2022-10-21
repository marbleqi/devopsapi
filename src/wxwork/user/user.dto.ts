import { IsNotEmpty } from 'class-validator';

/**企业微信用户信息DTO */
export class WxworkUserDto {
  /**企业微信用户信息ID */
  @IsNotEmpty({ message: '钉钉用户ID不能为空' })
  wxworkId: string;

  /**用户ID */
  userId: number;

  /**登陆名 */
  @IsNotEmpty({ message: '登陆名不能为空' })
  loginName: string;

  /**姓名 */
  @IsNotEmpty({ message: '姓名不能为空' })
  userName: string;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '用户状态不能为空' })
  status: number;

  /**授权角色 */
  @IsNotEmpty({ message: '授权角色不能为空' })
  roles: number[];
}
