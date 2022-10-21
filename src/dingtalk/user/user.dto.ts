import { IsNotEmpty } from 'class-validator';

/**钉钉用户信息DTO */
export class CreateDingtalkUserDto {
  /**钉钉用户ID */
  @IsNotEmpty({ message: '钉钉用户ID不能为空' })
  unionId: string;

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

/**钉钉用户信息DTO */
export class UpdateDingtalkUserDto {
  /**钉钉用户ID */
  @IsNotEmpty({ message: '钉钉用户ID不能为空' })
  unionId: string;

  /**用户ID */
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: number;
}
