import { IsNotEmpty } from 'class-validator';

export class MenuDto {
  @IsNotEmpty({ message: '应用名称不能为空' })
  name: string;

  @IsNotEmpty({ message: '应用标题不能为空' })
  title: string;

  @IsNotEmpty({ message: '应用说明不能为空' })
  description: string;

  @IsNotEmpty({ message: '令牌有效期设置不能为空' })
  expired: number;

  @IsNotEmpty({ message: '允许密码登陆设置不能为空' })
  password: boolean;

  @IsNotEmpty({ message: '允许企业微信登陆设置不能为空' })
  wxwork: boolean;

  @IsNotEmpty({ message: '允许钉钉登陆设置不能为空' })
  dingtalk: boolean;
}
