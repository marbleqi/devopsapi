// 外部依赖
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { EntityManager } from 'typeorm';
import { createHash, createHmac, randomUUID } from 'crypto';
import { formatRFC7231 } from 'date-fns';
import RPCClient from '@alicloud/pop-core/lib/rpc';
import { firstValueFrom } from 'rxjs';
// 内部依赖
import { Result } from '../shared';
import {
  Ability,
  MenuConfig,
  MenuEntity,
  AbilityService,
  MenuService,
} from '../auth';
import { AccesskeyService } from '.';

@Injectable()
export class AliyunService implements OnApplicationBootstrap {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly clientService: HttpService,
    private readonly abilityService: AbilityService,
    private readonly menuService: MenuService,
    private readonly accesskeyService: AccesskeyService,
  ) {
    const main = { pid: 1000, moduleName: '阿里云', type: '对象' };
    // 阿里云
    this.abilityService.add([
      {
        id: main.pid,
        pid: 0,
        name: main.moduleName,
        description: '阿里云',
        type: '模块',
        moduleName: main.moduleName,
      },
    ] as Ability[]);
    [
      { id: 1010, name: '密钥', description: '密钥管理' },
      { id: 1020, name: '授权', description: '授权管理' },
      { id: 1030, name: '域名', description: '域名管理' },
      { id: 1040, name: 'DNS', description: 'DNS管理' },
      { id: 1050, name: 'SSL证书', description: 'SSL证书管理' },
      { id: 1060, name: '镜像', description: '镜像仓库管理' },
      { id: 1070, name: '监控', description: '监控管理' },
      { id: 1080, name: 'ECS', description: '云服务管理' },
      { id: 1090, name: '财务', description: '财务管理' },
    ].map((item) =>
      this.abilityService.add([
        { ...main, ...item, objectName: item.name },
      ] as Ability[]),
    );
  }
  /**初始化 */
  async onApplicationBootstrap() {
    const aliyunAuth = await this.menuService.get('aliyun');
    let pMenuId: number;
    const params = {
      updateUserId: 1,
      updateAt: Date.now(),
      createUserId: 1,
      createAt: Date.now(),
    };
    if (aliyunAuth) {
      pMenuId = aliyunAuth.menuId;
    } else {
      const result = await this.entityManager.insert(MenuEntity, {
        ...params,
        pMenuId: 0,
        link: 'aliyun',
        config: {
          text: '阿里云管理',
          description: '阿里云管理',
          reuse: true,
          isLeaf: false,
          icon: 'form',
        } as MenuConfig,
        abilities: [1000],
      });
      pMenuId = Number(result.identifiers[0].menuId);
    }
    // console.debug('阿里云主菜单ID', pMenuId);
    const menuList = [
      {
        ...params,
        pMenuId,
        link: '/aliyun/accesskey',
        config: {
          text: '密钥',
          description: '密钥管理',
          reuse: true,
          isLeaf: true,
          icon: 'form',
        } as MenuConfig,
        abilities: [1100],
      },
    ];
    for (const menuItem of menuList) {
      await this.menuService.set(menuItem);
    }
  }

  /**
   *
   * @param keyID 阿里云密钥ID
   * @param action 接口名称
   * @param params 接口参数
   * @param endpoint 接口地址
   * @param version 接口版本
   * @returns 接口响应
   */
  async api(
    keyID: number,
    action: string,
    params: any,
    endpoint: string,
    version: string,
  ) {
    const result: Result = await this.accesskeyService.show(keyID);
    if (result.code) {
      return result;
    }
    const client = new RPCClient({
      accessKeyId: result.data.accessKeyId,
      accessKeySecret: result.data.accessKeySecret,
      endpoint,
      apiVersion: version,
    });
    return await client.request(action, params, { method: 'POST' });
  }

  /**
   * ECS类接口
   * @param keyID 阿里云密钥ID
   * @param action 接口名称
   * @param params 接口参数
   * @returns 接口响应
   */
  async ecs(keyID: number, action: string, params: any) {
    return await this.api(
      keyID,
      action,
      params,
      'https://ecs.aliyuncs.com',
      '2014-05-26',
    );
  }

  /**
   * ECS类接口
   * @param keyID 阿里云密钥ID
   * @param action 接口名称
   * @param params 接口参数
   * @returns 接口响应
   */
  async cas(keyID: number, action: string, params: any) {
    return await this.api(
      keyID,
      action,
      params,
      'https://cas.aliyuncs.com',
      '2018-07-13',
    );
  }

  /**
   * ECS类接口
   * @param keyID 阿里云密钥ID
   * @param action 接口名称
   * @param params 接口参数
   * @returns 接口响应
   */
  async cms(keyID: number, action: string, params: any) {
    return await this.api(
      keyID,
      action,
      params,
      'https://metrics.aliyuncs.com',
      '2019-01-01',
    );
  }

  /**
   * ECS类接口
   * @param keyID 阿里云密钥ID
   * @param action 接口名称
   * @param params 接口参数
   * @returns 接口响应
   */
  async rds(keyID: number, action: string, params: any) {
    return await this.api(
      keyID,
      action,
      params,
      'https://rds.aliyuncs.com',
      '2014-08-15',
    );
  }

  /**
   * ECS类接口
   * @param keyID 阿里云密钥ID
   * @param action 接口名称
   * @param params 接口参数
   * @returns 接口响应
   */
  async slb(keyID: number, action: string, params: any) {
    return await this.api(
      keyID,
      action,
      params,
      'https://slb.aliyuncs.com',
      '2014-05-15',
    );
  }

  /**
   * ECS类接口
   * @param keyID 阿里云密钥ID
   * @param action 接口名称
   * @param params 接口参数
   * @returns 接口响应
   */
  async dns(keyID: number, action: string, params: any) {
    return await this.api(
      keyID,
      action,
      params,
      'https://alidns.aliyuncs.com',
      '2015-01-09',
    );
  }

  /**
   * ECS类接口
   * @param keyID 阿里云密钥ID
   * @param action 接口名称
   * @param params 接口参数
   * @returns 接口响应
   */
  async domain(keyID: number, action: string, params: any) {
    return await this.api(
      keyID,
      action,
      params,
      'https://domain.aliyuncs.com',
      '2018-01-29',
    );
  }

  /**
   * ECS类接口
   * @param keyID 阿里云密钥ID
   * @param action 接口名称
   * @param params 接口参数
   * @returns 接口响应
   */
  async cr(keyID: number, regionId: string, value: any) {
    const accesskey: Result = await this.accesskeyService.show(keyID);
    if (accesskey.code) {
      return accesskey;
    }

    const acsheaders = {
      'x-acs-version': '2016-06-07',
      'x-acs-region-id': regionId,
      'x-acs-signature-nonce': randomUUID(),
      'x-acs-signature-version': '1.0',
      'x-acs-signature-method': 'HMAC-SHA1',
    };
    const acsarr: string[] = [];
    for (const key in acsheaders) {
      if (key != 'sign') acsarr.push(key + ':' + acsheaders[key]);
    }
    acsarr.sort();
    const CanonicalizedHeaders = acsarr.join('\n');
    const verb = value.method;
    const accept = 'application/json';
    let md5: string;
    if (value.body) {
      md5 = createHash('md5').update(value.body).digest('base64');
    } else {
      md5 = createHash('md5').update('').digest('base64');
    }
    const type = 'application/json;charset=utf-8';
    const date = formatRFC7231(new Date());
    const CanonicalizedResource = value.url;
    let source = verb + '\n';
    source += accept + '\n';
    source += md5 + '\n';
    source += type + '\n';
    source += date + '\n';
    source += CanonicalizedHeaders + '\n';
    source += CanonicalizedResource;
    const signresult = createHmac('sha1', accesskey.data.accessKeySecret)
      .update(source)
      .digest('base64');
    const headers = {
      ...acsheaders,
      Authorization: `acs ${accesskey.data.accessKeyId}:${signresult}`,
      'Content-Type': type,
      'Content-MD5': md5,
      Date: date,
      Host: `cr.${regionId}.aliyuncs.com`,
      Accept: accept,
    };
    return await firstValueFrom(
      this.clientService.request({
        url: `https://cr.${regionId}.aliyuncs.com${value.url}`,
        method: value.method,
        data: value.body,
        headers,
        validateStatus: () => true,
      }),
    );
  }
}
