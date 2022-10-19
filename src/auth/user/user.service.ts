// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EntityManager, MoreThan } from 'typeorm';
import { genSalt, hash } from 'bcrypt';
// 内部依赖
import { Result, OperateService, QueueService } from '../../shared';
import { UserConfig, UserEntity, UserLogEntity } from '..';

@Injectable()
export class UserService implements OnApplicationBootstrap {
  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   * @param queueService 消息队列
   * @param entityManager 实体管理器
   */
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly operateService: OperateService,
    private readonly queueService: QueueService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async onApplicationBootstrap() {
    const count: number = await this.entityManager.count(UserEntity);
    if (!count) {
      console.debug('需要执行用户初始化');
      const params = {
        updateUserId: 1,
        updateAt: Date.now(),
        createUserId: 1,
        createAt: Date.now(),
      };
      await this.entityManager.insert(UserEntity, [
        {
          ...params,
          loginName: 'root',
          userName: '超级管理员',
          config: {
            avatar:
              '//wework.qpic.cn/bizmail/rhJR6OOdNRiaepJZSAMVHFicjiaZabHHUdOYJTpdNIqo0MOkFMicWwac1w/0',
            pswLogin: true,
            qrLogin: true,
          } as UserConfig,
          roles: [1],
          password:
            '$2b$10$VYml51aRjNYcpYPnqqACRu1iLEZ5xzrHXBzc.01LrjKHYiq8OdfZS',
        },
      ]);
    }
  }

  /**
   * 获取用户清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**用户清单 */
    const data: UserEntity[] = await this.entityManager.find(UserEntity, {
      select: [
        'userId',
        'loginName',
        'config',
        'status',
        'createUserId',
        'createAt',
        'updateUserId',
        'updateAt',
        'operateId',
        'reqId',
      ],
      where: {
        operateId: MoreThan(operateId),
      },
    });
    /**响应报文 */
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 获取用户详情
   * @param userId 用户ID
   * @returns 响应消息
   */
  async show(userId: number): Promise<Result> {
    if (!userId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    /**用户对象 */
    const data: UserEntity = await this.entityManager.findOneBy(UserEntity, {
      userId,
    });
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到角色' };
    }
  }

  /**
   * 获取用户变更日志
   * @param userId 用户ID
   * @returns 响应消息
   */
  async log(userId: number): Promise<Result> {
    if (!userId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    /**用户对象 */
    const data: UserLogEntity[] = await this.entityManager.findBy(
      UserLogEntity,
      { userId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到角色' };
    }
  }

  /**
   * 创建用户
   * @param value 提交消息体
   * @param updateUserId 创建用户的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: object,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('user');
    const result = await this.entityManager.insert(UserEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      const userId = Number(result.identifiers[0].userId);
      this.eventEmitter.emit('user', userId);
      this.queueService.add('create', { object: 'user' });
      return { code: 0, msg: '用户创建完成', operateId, reqId, userId };
    } else {
      return { code: 400, msg: '用户创建失败', operateId, reqId };
    }
  }

  /**
   * 更新用户（含禁用）
   * @param userId 被更新的用户ID
   * @param value 提交消息体
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    userId: number,
    value: object,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!userId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    if (await this.invalid(userId)) {
      return { code: 400, msg: '待解锁的用户不存在' };
    }
    const operateId = await this.operateService.insert('user');
    const result = await this.entityManager.update(
      UserEntity,
      { userId },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('user', userId);
      this.queueService.add('update', { object: 'user' });
      return { code: 0, msg: '更新角色成功', operateId, reqId, userId };
    } else {
      return { code: 400, msg: '更新角色失败', operateId, reqId };
    }
  }

  /**
   * 解锁用户
   * @param userId 被更新的用户ID
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async unlock(
    userId: number,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!userId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    if (await this.invalid(userId)) {
      return { code: 404, msg: '待解锁的用户不存在' };
    }
    const operateId = await this.operateService.insert('user');
    const result = await this.entityManager.update(
      UserEntity,
      { userId },
      { pswTimes: 0, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('user', userId);
      this.queueService.add('unlock', { object: 'user' });
      return { code: 0, msg: '解锁用户成功', operateId, reqId, userId };
    } else {
      return { code: 400, msg: '解锁用户失败', operateId, reqId };
    }
  }

  /**
   * 重置用户密码
   * @param userId 用户ID
   * @param updateUserId 创建用户的用户ID
   * @param loginPsw 新密码明文
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async resetpsw(
    userId: number,
    loginPsw: string,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!userId) {
      return { code: 400, msg: '传入的用户ID无效' };
    }
    if (await this.invalid(userId)) {
      return { code: 404, msg: '待重置密码的用户不存在' };
    }
    const operateId = await this.operateService.insert('user');
    const salt = await genSalt();
    const password = await hash(loginPsw, salt);
    const result = await this.entityManager.update(
      UserEntity,
      { userId },
      { password, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('user', userId);
      this.queueService.add('resetpsw', { object: 'user' });
      return { code: 0, msg: '用户密码重置成功', operateId, reqId, userId };
    } else {
      return { code: 400, msg: '用户密码重置失败', operateId, reqId };
    }
  }

  /**
   * 判断用户是否无效
   * @param userId 用户ID
   * @returns 无效返回true，有效返回false
   */
  private async invalid(userId: number): Promise<boolean> {
    /**用户对象 */
    const data: UserEntity = await this.entityManager.findOne(UserEntity, {
      select: ['userId'],
      where: {
        userId,
      },
    });
    return !data;
  }

  /**
   * 获取已授权角色ID的用户列表
   * @param roleId 角色ID
   * @returns 响应消息
   */
  async granted(roleId: number): Promise<Result> {
    /**用户清单 */
    const users: UserEntity[] = await this.entityManager.find(UserEntity, {
      select: ['userId', 'roles'],
    });
    console.debug('grantedusers', users);
    /**已授权用户清单 */
    const data: number[] = users
      .filter((user) => user.roles.includes(roleId))
      .map((user) => user.userId);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 对提交的用户清单授权角色，并对其余的用户取消角色授权
   * @param roleId 角色ID
   * @param userIds 需要授权的用户ID集合
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async grant(
    roleId: number,
    userIds: number[],
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    /**角色清单 */
    const users: UserEntity[] = await this.entityManager.find(UserEntity, {
      select: ['userId', 'roles'],
    });
    console.debug('grantusers', users);
    for (const user of users) {
      // 增加用户的角色
      if (!user.roles.includes(roleId) && userIds.includes(user.userId)) {
        const operateId = await this.operateService.insert('user');
        user.roles.push(roleId);
        await this.entityManager.update(
          UserEntity,
          { userId: user.userId },
          {
            roles: user.roles,
            operateId,
            reqId,
            updateUserId,
            updateAt: Date.now(),
          },
        );
        this.eventEmitter.emit('user', user.userId);
      }
      // 删除用户的角色
      if (user.roles.includes(roleId) && !userIds.includes(user.userId)) {
        const operateId = await this.operateService.insert('user');
        user.roles = user.roles.filter((item) => item !== roleId);
        await this.entityManager.update(
          UserEntity,
          { userId: user.userId },
          {
            roles: user.roles,
            operateId,
            reqId,
            updateUserId,
            updateAt: Date.now(),
          },
        );
        this.eventEmitter.emit('user', user.userId);
      }
    }
    return { code: 0, msg: '权限点授权成功' };
  }

  /**
   * 增加用户修改日志
   * @param userId 用户ID
   */
  @OnEvent('user')
  async addLog(userId: number) {
    /**用户对象 */
    const user = await this.entityManager.findOneBy(UserEntity, {
      userId,
    });
    const result = await this.entityManager.insert(UserLogEntity, user);
    console.debug('result', result);
  }
}
