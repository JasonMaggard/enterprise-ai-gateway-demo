import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueryController } from './query/query.controller';
import { QueryService } from './query/query.service';

@Module({
  imports: [],
  controllers: [AppController, QueryController],
  providers: [AppService, QueryService],
})
export class AppModule {}
