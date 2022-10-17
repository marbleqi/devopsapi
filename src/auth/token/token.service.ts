// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
// 内部依赖
import { Result, RedisService, QueueService } from '../../shared';
import { Auth } from '..';

/**
 * 共享令牌服务
 * 令牌属于经常被使用，而且修改频繁的对象
 * 后端采用Redis存储的方式（以支持多后端实例同时运行的情况）
 */
@Injectable()
export class TokenService implements OnApplicationBootstrap {
  /**角色ID与权限的Map */
  private rolemap: Map<number, number[]>;
  /**用户ID与角色的Map */
  private usermap: Map<number, number[]>;
  /**用户ID与权限点ID的Map */
  private abilitymap: Map<number, number[]>;
  /**当前最新操作序号，用于差异更新数据 */
  private operateId: number;

  /**
   * 构造函数
   * @param redis 注入的缓存服务
   * @param pg 注入的数据库服务
   * @param queue 注入的队列服务
   */
  constructor(
    private readonly redis: RedisService,
    private readonly queue: QueueService,
  ) {
    this.rolemap = new Map<number, number[]>();
    this.usermap = new Map<number, number[]>();
    this.abilitymap = new Map<number, number[]>();
    this.operateId = 0;
  }

  /**启动时初始化 */
  async onApplicationBootstrap(): Promise<void> {
    await this.init();
    this.queue.apisub.subscribe(async (res) => {
      console.debug('收到消息', res);
      if (res === 'token') {
        console.debug('执行令牌初始化');
        await this.init();
        this.queue.websub.next({ name: 'token' });
      }
    });
  }

  /**
   * 用户数据初始化方法
   * 在收到用户数据更新，或角色更新后，权限下发时，可再次调用该方法
   */
  async init(): Promise<Result> {
    // /**本次更新得到的最新操作序号 */
    // let newoperateId = 0;
    // /**数据库脚本 */
    // let sqltext = `SELECT roleid, abilities, status, operateid FROM sys_roles WHERE operateid > $1`;
    // /**最新角色 */
    // const newrolelist: object[] = await this.pg.index(sqltext, [
    //   this.operateid,
    // ]);
    // // 更新角色Map
    // if (newrolelist.length) {
    //   for (const roleitem of newrolelist) {
    //     if (roleitem['status'] === 1) {
    //       this.rolemap.set(roleitem['roleid'], roleitem['abilities'] || []);
    //     } else {
    //       this.rolemap.delete(roleitem['roleid']);
    //     }
    //     if (newoperateid < roleitem['operateid']) {
    //       newoperateid = roleitem['operateid'];
    //     }
    //   }
    // }
    // sqltext = `SELECT userid, roles, status, operateid FROM sys_users WHERE operateid > $1`;
    // /**最新用户 */
    // const newuserlist: object[] = await this.pg.index(sqltext, [
    //   this.operateid,
    // ]);
    // // 更新用户Map
    // if (newuserlist.length) {
    //   for (const useritem of newuserlist) {
    //     if (useritem['status'] === 1) {
    //       this.usermap.set(useritem['userid'], useritem['roles'] || []);
    //     } else {
    //       this.usermap.delete(useritem['userid']);
    //     }
    //     if (newoperateid < useritem['operateid']) {
    //       newoperateid = useritem['operateid'];
    //     }
    //   }
    // }
    // // 更新最新操作序号
    // if (this.operateid < newoperateid) {
    //   this.operateid = newoperateid;
    // }
    // /**有效角色权限点列表 */
    // const rolelist: [number, number[]][] = Array.from(this.rolemap);
    // /**有效用户角色列表 */
    // const userlist: [number, number[]][] = Array.from(this.usermap);
    // /**更新用户与权限关系map */
    // this.abilitymap = new Map<number, number[]>(
    //   userlist.map((useritem) => {
    //     /**局部变量，存储当前用户项的权限点 */
    //     let abilities: number[] = [];
    //     for (const roleitem of rolelist.filter((item) =>
    //       useritem[1].includes(item[0]),
    //     )) {
    //       // 追加用户拥有角色的权限点
    //       abilities = abilities.concat(roleitem[1]);
    //     }
    //     // 返回可生成用户Map的二维数组的元数据
    //     return [useritem[0], abilities];
    //   }),
    // );
    return { code: 0, msg: '令牌权限下发成功' };
  }

  /**
   * 验证令牌是否拥有权限点（需要检查权限的控制器需要调用该方法，验证用户权限）
   * @param token 令牌
   * @param abilities 待令牌是否拥有的验证权限点，不传入时，表示不验证权限点
   * @returns 验证结果
   */
  async verify(
    token: string | string[],
    abilities: number[] = [],
  ): Promise<Auth> {
    /**用户ID */
    let userid = 0;
    /**权限无效 */
    let invalid = true;
    // 如果传入的令牌无效
    if (!token || typeof token === 'object') {
      return { userid, invalid };
    }
    /**令牌 */
    const result: any = await this.redis.hgetall(`token:${token}`);
    if (!result.token) {
      return { userid, invalid };
    }
    userid = Number(result.userid) || 0;
    if (!userid) {
      return { userid, invalid };
    }
    // 如果不验证权限点
    if (!abilities.length) {
      return { userid, invalid: false };
    }
    invalid = this.abilitymap
      .get(userid)
      .every((ability: number) => !abilities.includes(ability));
    return { userid, invalid };
  }

  /**
   * 用户ID换用户权限点
   * @param userid 用户ID
   * @returns 用户的权限点
   */
  getability(userid: number): number[] {
    return this.abilitymap.get(userid);
  }

  /**
   * 获取令牌清单
   * @returns 响应消息
   */
  async index(): Promise<Result> {
    /**令牌清单 */
    const tokenlist: string[] = await this.redis.keys('token:*');
    /**令牌数组 */
    const tokens: Record<string, string>[] = [];
    for (const item of tokenlist) {
      /**令牌 */
      const token = await this.redis.hgetall(item);
      tokens.push(token);
    }
    return { code: 0, msg: 'ok', data: tokens };
  }

  /**
   * 令牌作废
   * @param token 待作废的令牌
   * @returns 响应消息
   */
  async destroy(token: string): Promise<Result> {
    await this.redis.del(`token:${token}`);
    return { code: 0, msg: '令牌作废成功' };
  }
}
