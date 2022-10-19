import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EntityManager, MoreThan } from 'typeorm';
// 内部依赖
import { Result, OperateService, QueueService } from '../../shared';
import { RoleEntity, RoleLogEntity } from '..';

@Injectable()
export class RoleService implements OnApplicationBootstrap {
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
    const count: number = await this.entityManager.count(RoleEntity);
    if (!count) {
      console.debug('需要执行角色初始化');
      const params = {
        updateUserId: 1,
        updateAt: Date.now(),
        createUserId: 1,
        createAt: Date.now(),
      };
      await this.entityManager.insert(RoleEntity, [
        {
          ...params,
          config: { rolename: '超级管理员', description: '超级管理员' },
          abilities: [9],
        },
        {
          ...params,
          config: { rolename: '审查员', description: '审查员' },
          abilities: [8],
        },
        {
          ...params,
          config: { rolename: '普通用户', description: '普通用户' },
          abilities: [],
        },
      ]);
    }
  }

  /**
   * 获取角色清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 响应消息
   */
  async index(operateId: number): Promise<Result> {
    /**角色清单 */
    const data: RoleEntity[] = await this.entityManager.find(RoleEntity, {
      select: [
        'roleId',
        'config',
        'status',
        'orderId',
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
   * 获取角色详情
   * @param roleId 角色ID
   * @returns 响应消息
   */
  async show(roleId: number): Promise<Result> {
    /**角色ID */
    if (!roleId) {
      return { code: 400, msg: '传入的角色ID无效' };
    }
    /**角色对象 */
    const data: RoleEntity = await this.entityManager.findOneBy(RoleEntity, {
      roleId,
    });
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到角色' };
    }
  }

  /**
   * 获取角色变更日志
   * @param roleId 角色ID
   * @returns 响应消息
   */
  async log(roleId: number): Promise<Result> {
    /**角色ID */
    if (!roleId) {
      return { code: 400, msg: '传入的角色ID无效' };
    }
    /**角色对象 */
    const data: RoleLogEntity[] = await this.entityManager.findBy(
      RoleLogEntity,
      { roleId },
    );
    if (data) {
      return { code: 0, msg: 'ok', data };
    } else {
      return { code: 404, msg: '未找到角色' };
    }
  }

  /**
   * 创建角色
   * @param value 提交消息体
   * @param updateUserId 用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async create(
    value: object,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    const operateId = await this.operateService.insert('role');
    const result = await this.entityManager.insert(RoleEntity, {
      ...value,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (result.identifiers.length) {
      const roleId = Number(result.identifiers[0].roleId);
      this.eventEmitter.emit('role', roleId);
      this.queueService.add('create', { object: 'role' });
      return { code: 0, msg: '角色创建完成', operateId, reqId, roleId };
    } else {
      return { code: 400, msg: '角色创建失败', operateId, reqId };
    }
  }

  /**
   * 更新角色（含禁用和启用角色）
   * @param roleId 角色ID
   * @param value 提交消息体
   * @param updateUserId 用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async update(
    roleId: number,
    value: object,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    if (!roleId) {
      return { code: 400, msg: '传入的角色ID无效' };
    }
    const operateId = await this.operateService.insert('role');
    const result = await this.entityManager.update(
      RoleEntity,
      { roleId },
      { ...value, operateId, reqId, updateUserId, updateAt: Date.now() },
    );
    if (result.affected) {
      this.eventEmitter.emit('role', roleId);
      this.queueService.add('update', { object: 'role' });
      return { code: 0, msg: '更新角色成功', operateId, reqId, roleId };
    } else {
      return { code: 400, msg: '更新角色失败', operateId, reqId };
    }
  }

  /**
   * 角色排序
   * @param value 提交消息体
   * @returns 响应消息
   */
  async sort(value: object[]): Promise<Result> {
    if (!value.length) {
      return { code: 400, msg: '没有待排序的角色记录' };
    }
    for (const item of value) {
      await this.entityManager.update(
        RoleEntity,
        { roleId: item['roleId'] },
        { orderId: item['orderid'] },
      );
    }
    this.queueService.add('sort', { object: 'role' });
    return { code: 0, msg: '角色排序成功' };
  }

  /**
   * 获取已授权权限点ID的角色ID清单
   * @param id 权限点ID
   * @returns 响应消息
   */
  async granted(id: number): Promise<Result> {
    /**角色清单 */
    const roles: RoleEntity[] = await this.entityManager.find(RoleEntity, {
      select: ['roleId', 'abilities'],
    });
    console.debug('grantroles', roles);
    /**已授权角色清单 */
    const data: number[] = roles
      .filter((role) => role.abilities.includes(id))
      .map((role) => role.roleId);
    return { code: 0, msg: 'ok', data };
  }

  /**
   * 对提交的对象清单授权权限点，并对其余的对象取消权限点授权
   * @param id 权限点ID
   * @param roleIds 需要授权的角色ID集合
   * @param updateUserId 执行更新操作的用户ID
   * @param reqId 请求ID
   * @returns 响应消息
   */
  async grant(
    id: number,
    roleIds: number[],
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    /**角色清单 */
    const roles: RoleEntity[] = await this.entityManager.find(RoleEntity, {
      select: ['roleId', 'abilities'],
    });
    console.debug('grantroles', roles);
    for (const role of roles) {
      // 增加角色的权限
      if (!role.abilities.includes(id) && roleIds.includes(role.roleId)) {
        const operateId = await this.operateService.insert('role');
        role.abilities.push(id);
        await this.entityManager.update(
          RoleEntity,
          { roleId: role.roleId },
          {
            abilities: role.abilities,
            operateId,
            reqId,
            updateUserId,
            updateAt: Date.now(),
          },
        );
        this.eventEmitter.emit('role', role.roleId);
      }
      // 删除角色的权限
      if (role.abilities.includes(id) && !roleIds.includes(role.roleId)) {
        const operateId = await this.operateService.insert('role');
        role.abilities = role.abilities.filter((item) => item !== id);
        await this.entityManager.update(
          RoleEntity,
          { roleId: role.roleId },
          {
            abilities: role.abilities,
            operateId,
            reqId,
            updateUserId,
            updateAt: Date.now(),
          },
        );
        this.eventEmitter.emit('role', role.roleId);
      }
    }
    return { code: 0, msg: '权限点授权成功' };
  }

  /**
   * 增加角色修改日志
   * @param roleId 角色ID
   */
  @OnEvent('role')
  async addLog(roleId: number) {
    /**角色对象 */
    const role = await this.entityManager.findOneBy(RoleEntity, {
      roleId,
    });
    const result = await this.entityManager.insert(RoleLogEntity, role);
    console.debug('result', result);
  }
}
