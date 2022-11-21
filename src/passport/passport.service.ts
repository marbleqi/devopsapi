// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { compare } from 'bcrypt';
import { firstValueFrom } from 'rxjs';
// 内部依赖
import { Result, CommonService, RedisService, SettingService } from '../shared';
import { UserEntity } from '../auth';
import { WxworkUserEntity, WxworkService } from '../wxwork';
import { DingtalkUserEntity, DingtalkService } from '../dingtalk';

/**认证服务 */
@Injectable()
export class PassportService {
  /**
   * 构造函数
   * @param clientService 注入的http服务
   * @param entityManager 注入的实体管理器服务
   * @param redis 注入的缓存服务
   * @param common 注入的通用服务
   * @param settingService 注入的共享配置服务
   * @param wxworkService 注入的企业微信服务
   * @param dingtalkService 注入的钉钉服务
   */
  constructor(
    private readonly clientService: HttpService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly redis: RedisService,
    private readonly common: CommonService,
    private readonly settingService: SettingService,
    private readonly wxworkService: WxworkService,
    private readonly dingtalkService: DingtalkService,
  ) {}

  /**
   * 申请令牌
   * @param user 待申请令牌的用户实体
   * @param loginIp 登陆IP
   * @returns 响应消息
   */
  private async create(user: UserEntity, loginIp: string): Promise<Result> {
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
    /**系统配置参数 */
    const setting: object = this.settingService.read('sys');
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
      user.userId,
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
    const app: object = this.settingService.read('sys');
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
      const setting: object = this.settingService.read('wxwork');
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
      const setting: object = this.settingService.read('dingtalk');
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
    const setting: object = this.settingService.read('sys');
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
      where: { loginName },
    });
    // 判断用户是否存在
    if (!user) {
      return { code: 401, msg: '用户不存在' };
    }
    // 判断用户状态
    if (!user.status) {
      return { code: 401, msg: '用户状态为禁用' };
    }
    // 判断是否授权用户密码登陆
    if (!user.config.pswLogin) {
      return { code: 401, msg: '该用户不允许使用密码登陆方式！' };
    }
    // 判断密码错误次数是否超过限制（demo环境不做密码错误次数限制）
    if (process.env.NODE_ENV !== 'demo' && user.pswTimes >= 5) {
      return { code: 401, msg: '密码错误超过5次，请联系管理员重置密码！' };
    }
    /**判断密码是否一致 */
    const check = await compare(loginPsw, user.password);
    // 判断密码密文是否一致
    if (!check) {
      // 密码密文不一致，密码错误计数加1
      this.entityManager.increment(
        UserEntity,
        { userId: user.userId },
        'pswTimes',
        1,
      );
      if (process.env.NODE_ENV === 'demo') {
        return {
          code: 401,
          msg: `密码已连续输错${user.pswTimes + 1}次！`,
        };
      } else {
        return {
          code: 401,
          msg: `密码已连续输错${user.pswTimes + 1}次，超过5次将锁定！`,
        };
      }
    }

    return await this.create(user, loginIp);
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
    loginIp: string,
  ): Promise<Result> {
    console.debug(type, value, loginIp);
    /**系统配置 */
    const setting: object = this.settingService.read('sys');
    let userId: number;
    // 开始临时code换用户ID
    if (type === 'dingtalk') {
      // 钉钉认证
      if (!setting['dingtalk']) {
        return { code: 401, msg: '系统不允许使用钉钉登陆' };
      }
      /**钉钉配置 */
      const dingtalk: object = this.settingService.read('dingtalk');
      console.debug('dingtalk', dingtalk);
      /**接口调用结果 */
      let result: any = await firstValueFrom(
        this.clientService.post(
          'https://api.dingtalk.com/v1.0/oauth2/userAccessToken',
          {
            clientId: dingtalk['appkey'],
            clientSecret: dingtalk['appsecret'],
            code: value.authCode,
            grantType: 'authorization_code',
          },
          { validateStatus: () => true },
        ),
      );
      console.debug('令牌结果', result.data);
      if (result.status != 200) {
        return { code: result.status, msg: result.data.message };
      }
      /**用户凭证 */
      const access_token = result.data.accessToken;
      // 用户凭证换用户unionId
      result = await firstValueFrom(
        this.clientService.get(
          'https://api.dingtalk.com/v1.0/contact/users/me',
          {
            headers: { 'x-acs-dingtalk-access-token': access_token },
            validateStatus: () => true,
          },
        ),
      );
      console.debug('用户信息', result.data);
      if (result.status != 200) {
        return { code: result.status, msg: result.data.message };
      }
      /**用户对象 */
      const dingtalkUser = await this.entityManager.findOneBy(
        DingtalkUserEntity,
        { unionId: result.data.unionId },
      );
      console.debug('dingtalkuser', dingtalkUser);
      if (!dingtalkUser) {
        return { code: 401, msg: '该钉钉未绑定用户' };
      }
      if (!dingtalkUser.status) {
        return { code: 401, msg: '用户状态为禁用' };
      }
      // 判断用户ID
      if (!dingtalkUser.userId) {
        return { code: 401, msg: '关联用户无效' };
      }
      userId = dingtalkUser.userId;
    } else {
      // 企业微信认证
      if (!setting['wxwork']) {
        return { code: 401, msg: '系统不允许使用企业微信登陆' };
      }
      /**应用凭证 */
      const access_token = await this.wxworkService.token('app');
      /**接口调用结果 */
      const result: any = await firstValueFrom(
        this.clientService.get(
          'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo',
          { params: { access_token, code: value.code } },
        ),
      );
      // 接口调用失败
      if (result.data.errcode) {
        // 如果是应用凭证过期，则重新获取应用凭证
        if (result.data.errcode === 40014) {
          await this.wxworkService.token('app', false);
        }
        return { code: result.data.errcode, msg: result.data.errmsg };
      }
      /**企业微信ID */
      const wxworkId = result.data.UserId;
      console.debug('wxworkid', wxworkId);
      /**用户对象 */
      const wxworkUser = await this.entityManager.findOneBy(WxworkUserEntity, {
        wxworkId: result.data.UserId,
      });

      if (!wxworkUser) {
        return { code: 401, msg: '该企业微信未绑定用户' };
      }
      // 判断用户状态
      if (!wxworkUser.status) {
        return { code: 401, msg: '用户状态为禁用' };
      }
      // 判断用户ID
      if (!wxworkUser.userId) {
        return { code: 401, msg: '关联用户无效' };
      }
      userId = wxworkUser.userId;
    }
    /**用户信息 */
    const user = await this.entityManager.findOneBy(UserEntity, { userId });
    // 判断用户是否存在
    if (!user) {
      return { code: 401, msg: '用户不存在' };
    }
    // 判断用户状态
    if (!user.status) {
      return { code: 401, msg: '用户状态为禁用' };
    }
    // 判断是否授权企业微信扫码登陆
    if (!user.config.qrlogin) {
      return { code: 401, msg: '该用户不允许使用扫码登陆方式！' };
    }
    // 创建令牌
    return await this.create(user, loginIp);
  }
}
