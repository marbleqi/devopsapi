// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { compare } from 'bcrypt';
// 内部依赖
import {
  Result,
  SettingEntity,
  CommonService,
  RedisService,
  SettingService,
} from '../shared';
import { UserEntity } from '../auth';

/**认证服务 */
@Injectable()
export class PassportService {
  /**
   * 构造函数
   * @param client 注入的http服务
   * @param redis 注入的缓存服务
   * @param common 注入的通用服务
   * @param setting 注入的共享配置服务
   */
  constructor(
    private readonly client: HttpService,
    private readonly redis: RedisService,
    private readonly common: CommonService,
    private readonly setting: SettingService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * 申请令牌
   * @param userId 待申请令牌的用户ID
   * @returns 响应消息
   */
  private async create(userId: number): Promise<Result> {
    /**系统配置参数 */
    const setting: object = this.setting.read('sys');
    /**令牌 */
    let token: string;
    /**令牌已存在标记 */
    let exists: number;
    do {
      token = this.common.random(40);
      exists = await this.redis.exists(`token:${token}`);
    } while (exists);
    /**令牌过期时间 */
    const expired = Date.now() + Number(setting['expired']) * 60000;
    // 缓存令牌
    await this.redis.hmset(
      `token:${token}`,
      'token',
      token,
      'userId',
      userId,
      'expired',
      expired,
      'createAt',
      Date.now(),
      'updateAt',
      Date.now(),
    );
    // 设置缓存有效期
    await this.redis.pexpire(
      `token:${token}`,
      Number(setting['expired']) * 60000 + 300000,
    );
    return {
      code: 0,
      msg: 'ok',
      data: { token, expired },
    };
  }

  /**
   * 获取初始化参数
   * @returns 响应消息
   */
  async startup(): Promise<Result> {
    const app: object = this.setting.read('sys');
    return { code: 0, msg: 'ok', data: { app } };
  }

  /**
   * 获取扫码相关信息
   * @param type 二维码类型
   * @returns 响应消息
   */
  async qrurl(type: string): Promise<Result> {
    if (type === 'wxwork') {
      /**企业微信配置参数 */
      const setting: object = this.setting.read('wxwork');
      return {
        code: 0,
        msg: 'ok',
        data: {
          appid: setting['corpid'],
          agentid: setting['app']['agentid'],
        },
      };
    }
    if (type === 'dingtalk') {
      /**钉钉配置参数 */
      const setting: object = this.setting.read('dingtalk');
      return { code: 0, msg: 'ok', data: { appkey: setting['appkey'] } };
    }
  }

  /**
   * 用户名密码登陆验证
   * @param loginName 登陆名
   * @param loginPsw 登陆密码明文
   * @param loginIp 登陆IP
   * @returns 响应消息
   */
  async login(
    loginName: string,
    loginPsw: string,
    loginIp: string,
  ): Promise<Result> {
    const setting: object = this.setting.read('sys');
    /**系统配置 */
    if (!setting['password']) {
      return { code: 401, msg: '系统不允许使用密码登陆' };
    }
    /**用户对象 */
    const user = await this.entityManager.findOne(UserEntity, {
      select: [
        'userId',
        'config',
        'status',
        'pswTimes',
        'password',
        'firstLoginAt',
      ],
      where: {
        loginName,
      },
    });
    console.debug('user', user);
    // 判断用户是否存在
    if (!user) {
      return { code: 401, msg: '用户不存在' };
    }
    // 判断用户状态
    if (!user.status) {
      return { code: 401, msg: '用户状态为禁用' };
    }
    // 判断是否授权用户密码登陆
    if (!user.config['pswlogin']) {
      return { code: 401, msg: '该用户不允许使用密码登陆方式！' };
    }
    // 判断密码错误次数是否超过限制
    if (user.pswTimes >= 5) {
      return { code: 401, msg: '密码错误超过5次，请联系管理员重置密码！' };
    }
    /**判断密码是否一致 */
    const check = await compare(loginPsw, user.password);
    console.debug('check', check);
    // 判断密码密文是否一致
    if (!check) {
      // 密码密文不一致，密码错误计数加1
      this.entityManager.increment(
        UserEntity,
        { userId: user.userId },
        'pswTimes',
        1,
      );
      return {
        code: 401,
        msg: `密码已连续输错${user.pswTimes + 1}次,超过5次将锁定！`,
      };
    }
    // 验证通过后，更新用户登陆信息
    if (user.firstLoginAt) {
      this.entityManager.update(
        UserEntity,
        { userId: user.userId },
        {
          lastLoginIp: loginIp,
          lastLoginAt: Date.now(),
          lastSessionAt: Date.now(),
        },
      );
    } else {
      this.entityManager.update(
        UserEntity,
        { userId: user.userId },
        {
          firstLoginAt: Date.now(),
          lastLoginIp: loginIp,
          lastLoginAt: Date.now(),
          lastSessionAt: Date.now(),
        },
      );
    }
    // 增加登陆次数
    this.entityManager.increment(
      UserEntity,
      { userId: user.userId },
      'loginTimes',
      1,
    );
    return await this.create(user.userId);
  }

  /**
   * 第三方回调
   * @param value 扫码回调信息
   * @param loginip 登陆IP
   * @returns 响应消息
   */
  async callback(
    type = 'wxwork',
    value: any,
    loginip: string,
  ): Promise<Result> {
    console.debug(type, value, loginip);
    /**系统配置 */
    // const setting: SettingEntity = await this.setting.get('sys');

    return { code: 0, msg: 'ok' };
    // 开始临时code换用户ID
    // if (type === 'dingtalk') {
    //   // 钉钉认证
    //   if (!setting.value['dingtalk']) {
    //     return { code: 401, msg: '系统不允许使用钉钉登陆' };
    //   }
    //   /**钉钉配置 */
    //   const dingtalk: SettingEntity = await this.setting.get('dingtalk');
    //   console.debug('dingtalk', dingtalk);
    //   /**接口调用结果 */
    //   let result: any = await firstValueFrom(
    //     this.client.post(
    //       'https://api.dingtalk.com/v1.0/oauth2/userAccessToken',
    //       {
    //         clientId: dingtalk['appkey'],
    //         clientSecret: dingtalk['secret'],
    //         code: value.authCode,
    //         grantType: 'authorization_code',
    //       },
    //       { validateStatus: () => true },
    //     ),
    //   );
    //   console.debug('令牌结果', result.data);
    //   if (result.status != 200) {
    //     return { code: result.status, msg: result.data.message };
    //   }
    //   /**用户凭证 */
    //   const access_token = result.data.accessToken;
    //   // 用户凭证换用户unionId
    //   result = await firstValueFrom(
    //     this.client.get('https://api.dingtalk.com/v1.0/contact/users/me', {
    //       headers: { 'x-acs-dingtalk-access-token': access_token },
    //       validateStatus: () => true,
    //     }),
    //   );
    //   console.debug('用户信息', result.data);
    //   if (result.status != 200) {
    //     return { code: result.status, msg: result.data.message };
    //   }
    //   sqltext = `SELECT userid, status FROM dingtalk_users WHERE unionid = $1`;
    //   const dingtalkuser: object = await this.pg.show(sqltext, [
    //     result.data.unionId,
    //   ]);
    //   console.debug('dingtalkuser', dingtalkuser);
    //   if (!dingtalkuser) {
    //     return { code: 401, msg: '该钉钉未绑定用户' };
    //   }
    //   if (!dingtalkuser['status']) {
    //     return { code: 401, msg: '用户状态为禁用' };
    //   }
    //   userid = dingtalkuser['userid'];
    // } else {
    //   // 企业微信认证
    //   if (!setting.value['wxwork']) {
    //     return { code: 401, msg: '系统不允许使用企业微信登陆' };
    //   }
    //   /**应用凭证 */
    //   const access_token = await this.wxwork.token('app');
    //   /**接口调用结果 */
    //   const result: any = await firstValueFrom(
    //     this.client.get(
    //       'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo',
    //       { params: { access_token, code: value.code } },
    //     ),
    //   );
    //   // 接口调用失败
    //   if (result.data.errcode) {
    //     // 如果是应用凭证过期，则重新获取应用凭证
    //     if (result.data.errcode === 40014) {
    //       await this.wxwork.token('app', false);
    //     }
    //     return { code: result.data.errcode, msg: result.data.errmsg };
    //   }
    //   /**企业微信ID */
    //   const wxworkid = result.data.UserId;
    //   console.debug('wxworkid', wxworkid);
    //   sqltext = `SELECT wxworkid, userid, status FROM wxwork_users WHERE wxworkid = $1`;
    //   const wxworkuser: object = await this.pg.show(sqltext, [wxworkid]);
    //   if (!wxworkuser) {
    //     return { code: 401, msg: '该企业微信未绑定用户' };
    //   }
    //   // 判断用户状态
    //   if (!wxworkuser['status']) {
    //     return { code: 401, msg: '用户状态为禁用' };
    //   }
    //   // 判断用户状态
    //   if (!wxworkuser['userid']) {
    //     return { code: 401, msg: '关联用户无效' };
    //   }
    //   userid = wxworkuser['userid'];
    // }
    // sqltext = `SELECT config, status, first_login_at FROM sys_users WHERE userid = $1`;
    // const user: object = await this.pg.show(sqltext, [userid]);
    // // 判断用户是否存在
    // if (!user) {
    //   return { code: 401, msg: '用户不存在' };
    // }
    // // 判断用户状态
    // if (!user['status']) {
    //   return { code: 401, msg: '用户状态为禁用' };
    // }
    // // 判断是否授权企业微信扫码登陆
    // if (!user['config']?.qrlogin) {
    //   return { code: 401, msg: '该用户不允许使用扫码登陆方式！' };
    // }
    // // 验证通过后，更新用户登陆信息
    // if (user['first_login_at']) {
    //   sqltext = `UPDATE sys_users SET pswtimes = 0, logintimes = logintimes + 1, last_login_ip = $2, last_login_at = $1, last_session_at = $1 WHERE userid = $3`;
    // } else {
    //   sqltext = `UPDATE sys_users SET pswtimes = 0, logintimes = logintimes + 1, first_login_at = $1, last_login_ip = $2, last_login_at = $1, last_session_at = $1 WHERE userid = $3`;
    // }
    // this.pg.query(sqltext, [Date.now(), loginip, userid]);
    // // 创建令牌
    // return await this.create(userid);
  }
}
