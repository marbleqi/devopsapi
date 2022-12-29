// 外部依赖
import {
  Entity,
  ViewEntity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  ViewColumn,
  Index,
  AfterLoad,
} from 'typeorm';

/**KONG日志表 */
@Entity('kong_logs')
@Index(['routeId', 'started_at'])
export class KongLogEntity {
  /**日志ID */
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'log_id', comment: '日志ID' })
  logId: number;

  /**日志信息 */
  @Column({ type: 'jsonb', name: 'log', comment: '日志信息' })
  log: any;

  /**路由 */
  @Column({ type: 'text', name: 'route_id', comment: '路由' })
  routeId: any;

  /**客户端IP */
  @Column({ type: 'text', name: 'client_ip', comment: '客户端IP' })
  client_ip: string;

  /**请求 */
  @Column({ type: 'jsonb', name: 'request', comment: '请求' })
  request: any;

  /**响应 */
  @Column({ type: 'jsonb', name: 'response', comment: '响应' })
  response: any;

  /**创建时间 */
  @Column({ type: 'bigint', name: 'started_at', comment: '创建时间' })
  started_at: number;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.logId = Number(this.logId);
    this.started_at = Number(this.started_at);
  }
}

/**KONG日志统计表 */
@Entity('kong_logs_count')
@Index(['routeId', 'year', 'month', 'day', 'hour', 'minute'])
export class KongLogCountEntity {
  /**路由 */
  @PrimaryColumn({ type: 'text', name: 'route_id', comment: '路由' })
  routeId: string;

  /**秒 */
  @PrimaryColumn({ type: 'text', name: 'second', comment: '秒' })
  second: string;

  /**年 */
  @Column({ type: 'text', name: 'year', comment: '年' })
  year: string;

  /**月 */
  @Column({ type: 'text', name: 'month', comment: '月' })
  month: string;

  /**日 */
  @Column({ type: 'text', name: 'day', comment: '日' })
  day: string;

  /**时 */
  @Column({ type: 'text', name: 'hour', comment: '时' })
  hour: string;

  /**分 */
  @Column({ type: 'text', name: 'minute', comment: '分' })
  minute: string;

  /**请求数 */
  @Column({ type: 'int', name: 'count', comment: '请求数' })
  count: number;
}

/**KONG日志统计年视图 */
@ViewEntity({
  name: 'kong_logs_year',
  expression: `SELECT route_id, year, SUM(count) count FROM kong_logs_count GROUP BY route_id, year`,
})
export class KongLogYearEntity {
  /**路由 */
  @ViewColumn({ name: 'route_id' })
  routeId: string;

  /**年 */
  @ViewColumn({ name: 'year' })
  year: string;

  /**请求数 */
  @ViewColumn({ name: 'count' })
  count: number;
}

/**KONG日志统计月视图 */
@ViewEntity({
  name: 'kong_logs_month',
  expression: `SELECT route_id, month, SUM(count) count FROM kong_logs_count GROUP BY route_id, month`,
})
export class KongLogMonthEntity {
  /**路由 */
  @ViewColumn({ name: 'route_id' })
  routeId: string;

  /**年 */
  @ViewColumn({ name: 'month' })
  month: string;

  /**请求数 */
  @ViewColumn({ name: 'count' })
  count: number;
}

/**KONG日志统计日视图 */
@ViewEntity({
  name: 'kong_logs_day',
  expression: `SELECT route_id, day, SUM(count) count FROM kong_logs_count GROUP BY route_id, day`,
})
export class KongLogDayEntity {
  /**路由 */
  @ViewColumn({ name: 'route_id' })
  routeId: string;

  /**日 */
  @ViewColumn({ name: 'day' })
  day: string;

  /**请求数 */
  @ViewColumn({ name: 'count' })
  count: number;
}

/**KONG日志统计时视图 */
@ViewEntity({
  name: 'kong_logs_hour',
  expression: `SELECT route_id, hour, SUM(count) count FROM kong_logs_count GROUP BY route_id, hour`,
})
export class KongLogHourEntity {
  /**路由 */
  @ViewColumn({ name: 'route_id' })
  routeId: string;

  /**日 */
  @ViewColumn({ name: 'hour' })
  hour: string;

  /**请求数 */
  @ViewColumn({ name: 'count' })
  count: number;
}

/**KONG日志统计分视图 */
@ViewEntity({
  name: 'kong_logs_minute',
  expression: `SELECT route_id, minute, SUM(count) count FROM kong_logs_count GROUP BY route_id, minute`,
})
export class KongLogMinuteEntity {
  /**路由 */
  @ViewColumn({ name: 'route_id' })
  routeId: string;

  /**分 */
  @ViewColumn({ name: 'minute' })
  minute: string;

  /**请求数 */
  @ViewColumn({ name: 'count' })
  count: number;
}
