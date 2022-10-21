import { IsNotEmpty } from 'class-validator';

export class DingtalkSettingDto {
  @IsNotEmpty({ message: 'agentid不能为空' })
  agentid: string;

  @IsNotEmpty({ message: 'appkey不能为空' })
  appkey: string;

  @IsNotEmpty({ message: 'appsecret不能为空' })
  appsecret: string;
}
