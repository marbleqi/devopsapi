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
  WxworkUserEntity,
  WxworkUserLogEntity,
  CreateWxworkUserDto,
  UpdateWxworkUserDto,
  WxworkService,
} from '..';

/**企业微信用户服务 */
@Injectable()
export class UserService {
  /**
   * 构造函数
   * @param eventEmitter 注入的http服务
   * @param client 注入的通用服务
   * @param operateService 注入的操作序号服务
   * @param commonService 注入的通用服务
   * @param wxworkService 注入的钉钉服务
   * @param authUser 注入的认证模块的用户服务
   * @param entityManager 注入的实体管理器
   */
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly client: HttpService,
    private readonly operateService: OperateService,
    private readonly commonService: CommonService,
    private readonly wxworkService: WxworkService,
    private readonly authUser: AuthUser,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * 根据部门ID获取用户清单
   * @param departid 部门ID
   * @returns 响应消息
   */
  async apiIndex(departid: number): Promise<Result> {
    /**应用凭证 */
    const access_token = await this.wxworkService.token('app');
    /**接口结果 */
    const result: any = await firstValueFrom(
      this.client.get('https://qyapi.weixin.qq.com/cgi-bin/user/simplelist', {
        params: {
          access_token,
          department_id: departid,
          fetch_child: 1,
        },
      }),
    );
    // 判断从企业微信接口获得的数据是否正常
    if (result.data.errcode) {
      return {
        code: result.data.errcode,
        msg: result.data.errmsg,
      };
    }
    return {
      code: 0,
      msg: 'ok',
      data: result.data.userlist.map((item: any) => ({
        userid: item.userid,
        name: item.name,
      })),
    };
  }

  async dbIndex(operateId: number): Promise<Result> {
    /**返回字段 */
    const select = [
      'wxworkId',
      'userId',
      'status',
      'updateUserId',
      'updateAt',
      'operateId',
    ] as FindOptionsSelect<WxworkUserEntity>;
    /**搜索条件 */
    const where = {
      operateId: MoreThan(operateId),
    } as FindOptionsWhere<WxworkUserEntity>;
    return await this.commonService.index(WxworkUserEntity, select, where);
  }

  /**
   * 根据企业微信用户信息创建新用户
   * @param value 提交消息体
   * @param updateUserId 创建用户的用户ID
   * @returns 响应消息
   */
  async create(
    value: CreateWxworkUserDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    /**企业微信用户对象 */
    const exist: WxworkUserEntity = await this.entityManager.findOneBy(
      WxworkUserEntity,
      { wxworkId: value.wxworkId },
    );
    if (exist) {
      return { code: 400, msg: '企业微信用户已存在关联用户' };
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
    // 如果用户创建成功，则创建企业微信用户的关联关系
    const dingtalkAdd = await this.entityManager.insert(WxworkUserEntity, {
      wxworkId: value.wxworkId,
      userId: result.userId,
      operateId,
      reqId,
      updateUserId,
      updateAt: Date.now(),
      createUserId: updateUserId,
      createAt: Date.now(),
    });
    if (dingtalkAdd.identifiers.length) {
      this.eventEmitter.emit('wxwork', value.wxworkId);
      return { code: 0, msg: '企业微信用户关联完成', operateId, reqId };
    } else {
      return { code: 400, msg: '企业微信用户关联失败', operateId, reqId };
    }
  }

  /**
   * 保存关联关系
   * @param value 提交表单
   * @param updateUserId 配置关联关系的用户ID
   * @returns 响应消息
   */
  async save(
    value: UpdateWxworkUserDto,
    updateUserId: number,
    reqId = 0,
  ): Promise<Result> {
    /**企业微信用户对象 */
    const exist: WxworkUserEntity = await this.entityManager.findOneBy(
      WxworkUserEntity,
      { wxworkId: value.wxworkId },
    );
    /**新操作序号 */
    const operateId = await this.operateService.insert('dingtalk');
    if (exist) {
      const result = await this.entityManager.update(
        WxworkUserEntity,
        { wxworkId: value.wxworkId },
        {
          userId: value.userId,
          operateId,
          reqId,
          updateUserId,
          updateAt: Date.now(),
        },
      );
      if (result.affected) {
        this.eventEmitter.emit('wxwork', value.wxworkId);
        return {
          code: 0,
          msg: '更新企业微信关联关系成功',
          operateId,
          reqId,
          wxworkId: value.wxworkId,
        };
      } else {
        return { code: 400, msg: '更新企业微信关联关系失败', operateId, reqId };
      }
    } else {
      const result = await this.entityManager.insert(WxworkUserEntity, {
        wxworkId: value.wxworkId,
        userId: value.userId,
        operateId,
        reqId,
        updateUserId,
        updateAt: Date.now(),
        createUserId: updateUserId,
        createAt: Date.now(),
      });
      if (result.identifiers.length) {
        this.eventEmitter.emit('wxwork', value.wxworkId);
        return {
          code: 0,
          msg: '企业微信用户关联完成',
          operateId,
          reqId,
          unionId: value.wxworkId,
        };
      } else {
        return { code: 400, msg: '企业微信用户关联失败', operateId, reqId };
      }
    }
  }

  /**
   * 增加钉钉用户修改日志
   * @param wxworkId 钉钉用户ID
   */
  @OnEvent('wxwork')
  async addLog(wxworkId: string) {
    /**用户对象 */
    const wxworkUser = await this.entityManager.findOneBy(WxworkUserEntity, {
      wxworkId,
    });
    /**添加日志 */
    this.entityManager.insert(WxworkUserLogEntity, wxworkUser);
  }
}
