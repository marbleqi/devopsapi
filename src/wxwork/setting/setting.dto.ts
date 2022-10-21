import { IsNotEmpty } from 'class-validator';

/**菜单配置 */
export interface WxworkAppConfig {
  /**应用ID */
  agentid: string;
  /**应用秘钥 */
  secret: string;
}

export class WxworkSettingDto {
  @IsNotEmpty({ message: '企业ID不能为空' })
  corpid: string;

  @IsNotEmpty({ message: '自定义应用配置不能为空' })
  app: WxworkAppConfig;

  @IsNotEmpty({ message: '打卡应用配置不能为空' })
  checkin: WxworkAppConfig;
}
