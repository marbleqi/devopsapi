import { IsNotEmpty } from 'class-validator';

/**站点信息DTO */
export class CompanyDto {
  /**站点名 */
  @IsNotEmpty({ message: '站点名不能为空' })
  corpid: string;

  /**站点地址 */
  @IsNotEmpty({ message: '站点地址不能为空' })
  corpsecret: string;

  /**站点说明 */
  @IsNotEmpty({ message: '站点说明不能为空' })
  description: string;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '站点状态不能为空' })
  status: number;
}
