// 外部依赖
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { WechatService } from '..';
import { firstValueFrom } from 'rxjs';
import { stringify } from 'querystring';
// 内部依赖
import { Result } from '../../shared';
import { ResponseDto, CompleteDto } from '..';

@Injectable()
export class ComplaintService {
  /**
   * 构造函数
   * @param entityManager 实体管理器
   * @param eventEmitter 事件发射器
   * @param operateService 操作序号服务
   */
  constructor(
    private readonly clientService: HttpService,
    private readonly wechatService: WechatService,
  ) {}

  /**
   * 查询投诉列表
   * @param value
   * @returns
   */
  async index(value: any): Promise<Result> {
    const method: 'GET' | 'POST' = 'GET';
    const params = value;
    const url = `/v3/merchant-service/complaints-v2?${stringify(params)}`;
    const body = '';
    const data = { mchid: value.complainted_mchid, method, url, body };
    let result: any = await this.wechatService.sign(data);
    if (result.code !== 0) {
      return result;
    }
    const Authorization: string = result.data;
    result = await firstValueFrom(
      this.clientService.get(`https://api.mch.weixin.qq.com${url}`, {
        headers: { Authorization },
        validateStatus: () => true,
      }),
    );
    if (result.status === 200) {
      return { code: 0, msg: 'ok', ...result.data };
    } else {
      return { code: result.status, msg: result.data.message };
    }
  }

  /**
   * 投诉详情
   * @param value
   * @returns
   */
  async show(value: any): Promise<Result> {
    const method: 'GET' | 'POST' = 'GET';
    const url = `/v3/merchant-service/complaints-v2/${value.complaint_id}`;
    const body = '';
    const data = { mchid: value.mchid, method, url, body };
    let result: any = await this.wechatService.sign(data);
    if (result.code !== 0) {
      return result;
    }
    const Authorization: string = result.data;
    result = await firstValueFrom(
      this.clientService.get(`https://api.mch.weixin.qq.com${url}`, {
        headers: { Authorization },
        validateStatus: () => true,
      }),
    );
    if (result.status === 200) {
      return { code: 0, msg: 'ok', data: result.data };
    } else {
      return { code: result.status, msg: result.data.message };
    }
  }

  /**
   * 投诉历史
   * @param value
   * @returns
   */
  async history(value: any): Promise<Result> {
    const method: 'GET' | 'POST' = 'GET';
    const url = `/v3/merchant-service/complaints-v2/${value.complaint_id}/negotiation-historys`;
    const body = '';
    const data = { mchid: value.mchid, method, url, body };
    let result: any = await this.wechatService.sign(data);
    if (result.code !== 0) {
      return result;
    }
    const Authorization: string = result.data;
    result = await firstValueFrom(
      this.clientService.get(`https://api.mch.weixin.qq.com${url}`, {
        headers: { Authorization },
        validateStatus: () => true,
      }),
    );
    if (result.status === 200) {
      return { code: 0, msg: 'ok', ...result.data };
    } else {
      return { code: result.status, msg: result.data.message };
    }
  }

  /**
   * 投诉回复
   * @param value
   * @returns
   */
  async response(complaint_id: string, value: ResponseDto): Promise<Result> {
    const method: 'GET' | 'POST' = 'POST';
    const url = `/v3/merchant-service/complaints-v2/${complaint_id}/response`;
    const body = value;
    const data = { mchid: value.complainted_mchid, method, url, body };
    let result: any = await this.wechatService.sign(data);
    if (result.code !== 0) {
      return result;
    }
    const Authorization: string = result.data;
    result = await firstValueFrom(
      this.clientService.post(`https://api.mch.weixin.qq.com${url}`, body, {
        headers: { Authorization },
        validateStatus: () => true,
      }),
    );
    if (result.status === 204) {
      return { code: 0, msg: 'ok' };
    } else {
      return { code: result.status, msg: result.data.message };
    }
  }

  /**
   * 投诉处理完成
   * @param value
   * @returns
   */
  async complete(complaint_id: string, value: CompleteDto): Promise<Result> {
    const method: 'GET' | 'POST' = 'POST';
    const url = `/v3/merchant-service/complaints-v2/${complaint_id}/complete`;
    const body = value;
    const data = { mchid: value.complainted_mchid, method, url, body };
    let result: any = await this.wechatService.sign(data);
    if (result.code !== 0) {
      return result;
    }
    const Authorization: string = result.data;
    result = await firstValueFrom(
      this.clientService.post(`https://api.mch.weixin.qq.com${url}`, body, {
        headers: { Authorization },
        validateStatus: () => true,
      }),
    );
    if (result.status === 204) {
      return { code: 0, msg: 'ok' };
    } else {
      return { code: result.status, msg: result.data.message };
    }
  }
}
