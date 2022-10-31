import { IsNotEmpty } from 'class-validator';

/**用户信息DTO */
export class KongHostDto {
  /**登陆名 */
  @IsNotEmpty({ message: '站点名不能为空' })
  name: string;

  /**姓名 */
  @IsNotEmpty({ message: '站点说明不能为空' })
  description: string;

  /**站点地址 */
  @IsNotEmpty({ message: '站点地址不能为空' })
  url: string;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '站点状态不能为空' })
  status: number;
}