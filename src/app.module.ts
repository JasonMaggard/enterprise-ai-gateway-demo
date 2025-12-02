import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueryController } from './query/query.controller';
import { QueryService } from './query/query.service';
import { RagController } from './rag/rag.controller';
import { RagService } from './rag/rag.service';

@Module({
  imports: [],
  controllers: [AppController, QueryController, RagController],
  providers: [AppService, QueryService, RagService],
})
export class AppModule {}
