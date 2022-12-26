import { IsNotEmpty } from 'class-validator';

/**企业微信信息DTO */
export class CompanyDto {
  /**企业微信ID */
  @IsNotEmpty({ message: '企业微信ID不能为空' })
  corpid: string;

  /**企业微信密钥 */
  @IsNotEmpty({ message: '企业微信密钥不能为空' })
  corpsecret: string;

  /**企业微信说明 */
  @IsNotEmpty({ message: '企业微信说明不能为空' })
  description: string;

  /**状态，1表示可用，0表示禁用 */
  @IsNotEmpty({ message: '企业微信状态不能为空' })
  status: number;
}
