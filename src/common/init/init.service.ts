// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  MoreThan,
} from 'typeorm';
// 内部依赖
import {
  Result,
  CommonService as SharedCommon,
  RedisService,
  SettingService,
} from '../../shared';
import {
  Auth,
  MenuEntity,
  RoleEntity,
  UserEntity,
  TokenService,
} from '../../auth';

/**初始化服务 */
@Injectable()
export class InitService {
  /**
   * 构造函数
   * @param common 注入的共享通用服务
   * @param redis 注入的缓存服务
   * @param setting 注入的配置服务
   * @param token 注入的令牌服务
   */
  constructor(
    private readonly common: SharedCommon,
    private readonly redis: RedisService,
    private readonly setting: SettingService,
    private readonly token: TokenService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * 提供前端初始化所需信息
   * @param auth 令牌验证结果
   * @returns 响应消息
   */
  async startup(auth: Auth): Promise<Result> {
    /**应用配置 */
    const setting: object = this.setting.read('sys');
    if (auth.invalid) {
      return { code: 401, msg: '令牌验证不通过', data: { app: setting } };
    }
    /**提取用户数据 */
    const result: UserEntity = await this.entityManager.findOne(UserEntity, {
      select: ['config'],
      where: { userId: auth.userId },
    });
    /**用户信息 */
    const user: object = {
      userid: auth.userId,
      name: result.userName,
      avatar: result.config.avatar,
    };
    /**权限点信息 */
    const ability: number[] = this.token.getability(auth.userId);
    return { code: 0, msg: 'ok', data: { app: setting, user, ability } };
  }

  /**
   * 获取配置
   * @returns 响应消息
   */
  sys(): Result {
    return { code: 0, msg: 'ok', data: this.setting.read('sys') };
  }

  /**
   * 获取角色清单（角色ID，角色名称，操作序号）
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async role(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'roleId',
      'roleName',
      'status',
      'operateId',
    ] as FindOptionsSelect<RoleEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<RoleEntity>;
    /**角色清单 */
    return await this.common.index(RoleEntity, select, where);
  }

  /**
   * 获取用户清单（用户ID，用户姓名，操作序号）
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async user(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'userId',
      'userName',
      'status',
      'operateId',
    ] as FindOptionsSelect<UserEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<UserEntity>;
    /**用户清单 */
    return await this.common.index(UserEntity, select, where);
  }

  /**
   * 获取菜单清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async menu(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'menuId',
      'pMenuId',
      'config',
      'status',
      'abilities',
      'orderId',
      'operateId',
    ] as FindOptionsSelect<MenuEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<MenuEntity>;
    /**用户清单 */
    return await this.common.index(MenuEntity, select, where);
  }

  /**
   * 刷新令牌，旧令牌换新令牌
   * @param oldtoken 原令牌
   * @returns 消息报文
   */
  async refresh(oldtoken: string): Promise<Result> {
    /**系统配置 */
    const setting: object = this.setting.read('sys');
    /**新令牌 */
    let token: string;
    /**新令牌存在标记 */
    let exists: number;
    do {
      token = this.common.random(40);
      exists = await this.redis.exists(`token:${token}`);
    } while (exists);
    /**令牌更换结果 */
    const rename: number = await this.redis.renamenx(
      `token:${oldtoken}`,
      `token:${token}`,
    );
    // 令牌更新失败
    if (!rename) {
      return { code: 403, msg: '令牌更新失败' };
    }
    /**令牌过期时间 */
    const expired = Date.now() + Number(setting['expired']) * 60000;
    // 缓存令牌
    await this.redis.hmset(
      `token:${token}`,
      'token',
      token,
      'expired',
      expired,
      'updateAt',
      Date.now(),
    );
    // 设置缓存有效期
    await this.redis.expire(`token:${token}`, Number(setting['expired']) * 60);
    // 返回新的令牌信息
    return { code: 0, msg: 'ok', data: { token, expired } };
  }
}
