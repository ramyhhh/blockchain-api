import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BlockchainClient } from './blockchain-core/_blockchain.base';
import { blockchain } from './blockchain-core/_blockchain.function';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [{
    provide: BlockchainClient,
    useFactory: async () => {
      const chain = await blockchain('BSC')
      return chain
    }
  }],
})
export class AppModule { }
