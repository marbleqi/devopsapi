// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, MoreThan } from 'typeorm';
// 内部依赖
import { Result, RedisService, QueueService } from '../../shared';
import { Auth, RoleEntity, UserEntity } from '..';

/**
 * 共享令牌服务
 * 令牌属于经常被使用，而且修改频繁的对象
 * 后端采用Redis存储的方式（以支持多后端实例同时运行的情况）
 */
@Injectable()
export class TokenService implements OnApplicationBootstrap {
  /**角色ID与权限的Map */
  private roleMap: Map<number, number[]>;
  /**用户ID与角色的Map */
  private userMap: Map<number, number[]>;
  /**用户ID与权限点ID的Map */
  private abilityMap: Map<number, number[]>;
  /**当前最新操作序号，用于差异更新数据 */
  private operateId: number;

  /**
   * 构造函数
   * @param redis 注入的缓存服务
   * @param queueService 注入的队列服务
   * @param entityManager 实体管理器
   */
  constructor(
    private readonly redis: RedisService,
    private readonly queueService: QueueService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    this.roleMap = new Map<number, number[]>();
    this.userMap = new Map<number, number[]>();
    this.abilityMap = new Map<number, number[]>();
    this.operateId = 0;
  }

  /**启动时初始化 */
  async onApplicationBootstrap(): Promise<void> {
    await this.init();
    this.queueService.apiSub.subscribe(async (res) => {
      console.debug('收到消息', res);
      if (res.name !== 'setting') {
        console.debug('收到用户或角色更新通知，执行令牌初始化', res.name);
        await this.init();
        this.queueService.webSub.next(res);
      }
    });
  }

  /**
   * 用户数据初始化方法
   * 在收到用户数据更新，或角色更新后，权限下发时，可再次调用该方法
   */
  async init(): Promise<Result> {
    /**本次更新得到的最新操作序号 */
    let newoperateId = 0;
    /**最新角色清单 */
    const newRoleList: RoleEntity[] = await this.entityManager.find(
      RoleEntity,
      {
        select: ['roleId', 'abilities', 'status', 'operateId'],
        where: { operateId: MoreThan(this.operateId) },
      },
    );
    // 更新角色Map
    if (newRoleList.length) {
      for (const roleItem of newRoleList) {
        if (roleItem.status === 1) {
          this.roleMap.set(roleItem.roleId, roleItem.abilities || []);
        } else {
          this.roleMap.delete(roleItem.roleId);
        }
        if (newoperateId < roleItem.operateId) {
          newoperateId = roleItem.operateId;
        }
      }
    }
    /**最新用户清单 */
    const newUserList: UserEntity[] = await this.entityManager.find(
      UserEntity,
      {
        select: ['userId', 'roles', 'status', 'operateId'],
        where: { operateId: MoreThan(this.operateId) },
      },
    );
    // 更新用户Map
    if (newUserList.length) {
      for (const userItem of newUserList) {
        if (userItem.status === 1) {
          this.userMap.set(userItem.userId, userItem.roles || []);
        } else {
          this.userMap.delete(userItem.userId);
        }
        if (newoperateId < userItem.operateId) {
          newoperateId = userItem.operateId;
        }
      }
    }
    // 更新最新操作序号
    if (this.operateId < newoperateId) {
      this.operateId = newoperateId;
    }
    /**有效角色权限点列表 */
    const rolelist: [number, number[]][] = Array.from(this.roleMap);
    /**有效用户角色列表 */
    const userlist: [number, number[]][] = Array.from(this.userMap);
    /**更新用户与权限关系map */
    this.abilityMap = new Map<number, number[]>(
      userlist.map((useritem) => {
        /**局部变量，存储当前用户项的权限点 */
        let abilities: number[] = [];
        for (const roleitem of rolelist.filter((item) =>
          useritem[1].includes(item[0]),
        )) {
          // 追加用户拥有角色的权限点
          abilities = abilities.concat(roleitem[1]);
        }
        // 返回可生成用户Map的二维数组的元数据
        return [useritem[0], abilities];
      }),
    );
    return { code: 0, msg: '令牌权限下发成功' };
  }

  /**
   * 验证令牌是否拥有权限点（需要检查权限的控制器需要调用该方法，验证用户权限）
   * @param token 令牌
   * @param abilities 待令牌是否拥有的验证权限点，不传入时，表示不验证权限点
   * @returns 验证结果
   */
  async verify(token: string, abilities: number[] = []): Promise<Auth> {
    /**用户ID */
    let userId = 0;
    /**权限无效 */
    let invalid = true;
    // 如果传入的令牌无效
    if (!token || typeof token === 'object') {
      return { userId, invalid };
    }
    /**令牌 */
    const result: any = await this.redis.hgetall(`token:${token}`);
    if (!result.token) {
      return { userId, invalid };
    }
    userId = Number(result.userId) || 0;
    if (!userId) {
      return { userId, invalid };
    }
    // 如果不验证权限点
    if (!abilities.length) {
      return { userId, invalid: false };
    }
    invalid = this.abilityMap
      .get(userId)
      .every((ability: number) => !abilities.includes(ability));
    return { userId, invalid };
  }

  /**
   * 用户ID换用户权限点
   * @param userId 用户ID
   * @returns 用户的权限点
   */
  getability(userId: number): number[] {
    return this.abilityMap.get(userId);
  }

  /**
   * 获取令牌清单
   * @returns 响应消息
   */
  async index(): Promise<Result> {
    /**令牌清单 */
    const tokenList: string[] = await this.redis.keys('token:*');
    /**令牌数组 */
    const tokens: Record<string, string>[] = [];
    for (const item of tokenList) {
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
