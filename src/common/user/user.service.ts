// 外部依赖
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { genSalt, hash, compare } from 'bcrypt';
// 内部依赖
import { Result } from '../../shared';
import { UserEntity } from '../../auth';

@Injectable()
export class UserService {
  /**
   * 构造函数
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   * @param queueService 消息队列
   * @param entityManager 实体管理器
   */
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * 获取个人信息
   * @param userId 用户ID
   * @returns 响应消息
   */
  async show(userId: number): Promise<Result> {
    /**用户信息 */
    const data: UserEntity = await this.entityManager.findOne(UserEntity, {
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
      where: { userId },
    });
    if (data) {
      return { code: 0, msg: 'ok', data };
    }
    return { code: 404, msg: '没有获取用户信息' };
  }

  async secure(userId: number, value: object): Promise<Result> {
    /**用户信息 */
    const user: UserEntity = await this.entityManager.findOne(UserEntity, {
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
      where: { userId },
    });
    if (!user) {
      return { code: 404, msg: '没有获取用户信息' };
    }
    if (user.pswTimes >= 5) {
      return { code: 401, msg: '密码错误超过5次，请联系管理员重置密码！' };
    }
    const check = await compare(value['oldpsw'], user.password);
    if (!check) {
      return {
        code: 401,
        msg: `密码已连续输错${user.pswTimes + 1} 次，超过5次将锁定！`,
      };
    }
    /**密码盐 */
    const salt = await genSalt();
    /**密码密文 */
    const password = await hash(value['newpsw'], salt);
    await this.entityManager.update(UserEntity, { userId }, { password });
    return { code: 0, msg: '密码已更新' };
  }
}
