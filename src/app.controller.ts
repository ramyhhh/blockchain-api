import { Controller, Get, Param } from '@nestjs/common';
import { EncryptedKeystoreV3Json, Sign, SignedTransaction } from 'web3-core'; //"esModuleInterop": true
import { Contract } from 'web3-eth-contract';
import BN from 'bn.js';
import { BlockchainClient } from './blockchain-core/_blockchain.base';


const address1 = '0x46352775fc66f526D8d41040DA7308CE94e77149'
const privateKey1 = '0x24e618f3cc5fd6cb776de29a1b91584270666d4a5bcb4c0152b925ed9e2aa207'

const address2 = '0x6c19Ee30A50Fd8f64DdCBB4Bdd313A13a23f4F00'
const privateKey2 = '0x0a3aadb54fd960e1a119e98396d2cc75c099a7e09cbccd16cedca8b35cf02062'


const address3 = '0xc4780387F6162D8CBee4f23f3ae821e56ae4fd2A'
const privateKey3 = '0xff5aa75c65d8b86307d4c9757c0b944b851d59d7b19f003f2a35b2e4307cd000'


@Controller()
export class AppController {

    constructor(public readonly blockchain: BlockchainClient) { }


    @Get('balance/:address')
    getBalanceMainCurrency(@Param('address') address: string) {
        return this.blockchain.getBalance(address)
    }

    @Get('balance/:address/:currency')
    getBalance(@Param('address') address: string, @Param('currency') currency: string) {
        return this.blockchain.getBalance(address, currency)
    }


    @Get('account/create')
    createAccount() {
        return this.blockchain.account()
    }
}
