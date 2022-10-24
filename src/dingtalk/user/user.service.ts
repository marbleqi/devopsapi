// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  EntityManager,
  FindOptionsSelect,
  FindOptionsWhere,
  MoreThan,
} from 'typeorm';
import { firstValueFrom } from 'rxjs';
// 内部依赖
import { Result, OperateService, CommonService } from '../../shared';
import { UserEntity, UserService as AuthUser } from '../../auth';
import {
  DingtalkUserEntity,
  DingtalkUserLogEntity,
  CreateDingtalkUserDto,
  UpdateDingtalkUserDto,
  DingtalkService,
} from '..';

/**钉钉用户服务 */
@Injectable()
export class UserService {
  /**
   * 构造函数
   * @param eventEmitter 注入的http服务
   * @param client 注入的通用服务
   * @param operateService 注入的操作序号服务
   * @param commonService 注入的通用服务
   * @param dingtalkService 注入的钉钉服务
   * @param authUser 注入的认证模块的用户服务
   * @param entityManager 注入的实体管理器
   */
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly client: HttpService,
    private readonly operateService: OperateService,
    private readonly commonService: CommonService,
    private readonly dingtalkService: DingtalkService,
    private readonly authUser: AuthUser,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * 获取子部门列表
   * @param dept_id 父级部门ID
   * @returns 响应消息
   */
  async depart(dept_id: number): Promise<Result> {
    if (!dept_id) {
      dept_id = 1;
    }
    /**应用凭证 */
    const access_token = await this.dingtalkService.token();
    /**接口结果 */
    const result: any = await firstValueFrom(
      this.client.post(
        'https://oapi.dingtalk.com/topapi/v2/department/listsub',
        { dept_id },
        { params: { access_token } },
      ),
    );
    if (result.data.errcode) {
      return {
        code: result.data.errcode,
        msg: result.data.errmsg,
      };
    }
    return {
      code: 0,
      msg: 'ok',
      data: result.data.result.map((item: any) => ({
        key: item.dept_id,
        title: item.name,
      })),
    };
  }

  /**
   * 根据部门ID获取用户清单
   * @param dept_id 部门ID
   * @returns 响应消息
   */
  async apiIndex(dept_id: number) {
    /**应用凭证 */
    const access_token = await this.dingtalkService.token();
    /**接口结果 */
    const result: any = await firstValueFrom(
      this.client.post(
        'https://oapi.dingtalk.com/topapi/v2/user/list',
        { dept_id, cursor: 0, size: 100 },
        { params: { access_token } },
      ),
    );
    if (result.data.errcode) {
      return {
        code: result.data.errcode,
        msg: result.data.errmsg,
      };
    }
    return {
      code: 0,
      msg: 'ok',
      data: result.data.result.list.map((item: any) => ({
        unionId: item.unionid,
        userId: item.userid,
        email: item.email,
        name: item.name,
        avatar: item.avatar ? item.avatar : '',
        mobile: item.mobile,
      })),
    };
  }

  async dbIndex(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'unionId',
      'userId',
      'status',
      'updateUserId',
      'updateAt',
      'operateId',
    ] as FindOptionsSelect<DingtalkUserEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<DingtalkUserEntity>;
    return await this.commonService.index(DingtalkUserEntity, select, where);
  }

  /**
   * 根据钉钉用户信息创建新用户
   * @param value 提交消息体
   * @param updateUserId 创建用户的用户ID
   * @returns 响应消息
   */
  async create(
    value: CreateDingtalkUserDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    /**钉钉用户对象 */
    const exist: DingtalkUserEntity = await this.entityManager.findOneBy(
      DingtalkUserEntity,
      { unionId: value.unionId },
    );
    if (exist) {
      return { code: 400, msg: '钉钉用户已存在关联用户' };
    }
    /**用户对象 */
    const user = await this.entityManager.findOneBy(UserEntity, {
      loginName: value.loginName,
    });
    if (user) {
      return { code: 400, msg: '用户名已使用' };
    }
    /**请求结果 */
    const result: Result = await this.authUser.create(
      {
        loginName: value.loginName,
        userName: value.userName,
        config: {},
        status: value.status,
        roles: value.roles,
      },
      updateUserId,
      reqId,
    );
    if (result.code) {
      return result;
    }
    /**新操作序号 */
    const operateId = await this.operateService.insert('dingtalk');
    // 如果用户创建成功，则创建钉钉用户的关联关系
    const dingtalk = await this.entityManager.insert(DingtalkUserEntity, {
      unionId: value.unionId,
      userId: result.userId,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (dingtalk.identifiers.length) {
      this.eventEmitter.emit('dingtalk', value.unionId);
      return { code: 0, msg: '钉钉用户关联完成', operateId, reqId };
    } else {
      return { code: 400, msg: '钉钉用户关联失败', operateId, reqId };
    }
  }

  /**
   * 将钉钉用户关联已有用户
   * @param value 提交表单
   * @param updateUserId 配置关联关系的用户ID
   * @returns 响应消息
   */
  async save(
    value: UpdateDingtalkUserDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    /**钉钉用户对象 */
    const exist: DingtalkUserEntity = await this.entityManager.findOneBy(
      DingtalkUserEntity,
      { unionId: value.unionId },
    );
    /**新操作序号 */
    const operateId = await this.operateService.insert('dingtalk');
    if (exist) {
      const result = await this.entityManager.update(
        DingtalkUserEntity,
        { unionId: value.unionId },
        {
          userId: value.userId,
          operateId,
          reqId,
          updateUserId,
          updateAt: Date.now(),
        },
      );
      if (result.affected) {
        this.eventEmitter.emit('dingtalk', value.unionId);
        return {
          code: 0,
          msg: '更新钉钉关联关系成功',
          operateId,
          reqId,
          unionId: value.unionId,
        };
      } else {
        return { code: 400, msg: '更新钉钉关联关系失败', operateId, reqId };
      }
    } else {
      const result = await this.entityManager.insert(DingtalkUserEntity, {
        unionId: value.unionId,
        userId: value.userId,
        operateId,
        reqId,
        updateUserId,
        updateAt: Date.now(),
        createUserId: updateUserId,
        createAt: Date.now(),
      });
      if (result.identifiers.length) {
        this.eventEmitter.emit('dingtalk', value.unionId);
        return {
          code: 0,
          msg: '钉钉用户关联完成',
          operateId,
          reqId,
          unionId: value.unionId,
        };
      } else {
        return { code: 400, msg: '钉钉用户关联失败', operateId, reqId };
      }
    }
  }

  /**
   * 增加钉钉用户修改日志
   * @param unionId 钉钉用户ID
   */
  @OnEvent('dingtalk')
  async addLog(unionId: string) {
    /**用户对象 */
    const dingtalkUser = await this.entityManager.findOneBy(
      DingtalkUserEntity,
      { unionId },
    );
    /**添加日志 */
    this.entityManager.insert(DingtalkUserLogEntity, dingtalkUser);
  }
}
