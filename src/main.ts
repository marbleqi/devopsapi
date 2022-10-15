// 外部依赖
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
// 内部依赖
import { AppModule } from './app.module';

/**项目启动函数 */
async function bootstrap() {
  /**应用 */
  const app = await NestFactory.create(AppModule);
  // 开启全局跨域许可
  app.enableCors({ origin: true });
  // 开启全局自动验证，以及对象转换
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // 开启服务监听
  await app.listen(parseInt(process.env.PORT, 10) || 80);
}
bootstrap();
