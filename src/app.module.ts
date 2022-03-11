import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameGateway } from './game/game.gateway';
import { FrontendMiddleware } from './middleware/frontend.middleware';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'build'),
    }),
  ],
  controllers: [],
  providers: [GameGateway],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(FrontendMiddleware).forRoutes({
      path: '/**',
      method: RequestMethod.ALL,
    });
  }
}
