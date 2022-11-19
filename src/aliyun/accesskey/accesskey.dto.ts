import { IsNotEmpty } from 'class-validator';

/**授权信息DTO */
export class AccesskeyDto {
  /**用户ID */
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: number;

  /**授权配置 */
  @IsNotEmpty({ message: '授权配置不能为空' })
  grant: any;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '授权状态不能为空' })
  status: number;
}
