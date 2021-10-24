import { BlockchainScannerQuery } from 'src/blockchain-scanner/blockchain-scanner';
import { Unit } from 'web3-utils';


export type CurrencyInfo = { address: string, std: string }
export type CommonBlockchains = 'BSC-TESTNET' | 'BSC' | 'ETH';

export type BlockchainInfo = {
    blockchainName: CommonBlockchains | string
    providerUrl: string
    mainCurrency: string
    tokenDecimal: number
    knownCurrencies: { [currency: string]: CurrencyInfo; } //currency => address
    requiredConfirmations: number

    scannerApiKey?: string
};


export const COMMON_CHAINS: { [chain: string]: BlockchainInfo } = {
    ['BSC-TESTNET']: {
        blockchainName: 'BSC-TESTNET',
        tokenDecimal: 18,
        providerUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
        mainCurrency: 'BNB',
        requiredConfirmations: 10,
        knownCurrencies: {
            BUSD: { std: 'ERC20', address: '0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee' }
        }
    },
    BSC: {
        blockchainName: 'BSC',
        tokenDecimal: 18,
        providerUrl: "https://bsc-dataseed1.binance.org:443",
        mainCurrency: 'BNB',
        requiredConfirmations: 24,
        knownCurrencies: {
            BUSD: { std: 'ERC20', address: '0x55d398326f99059ff775485246999027b3197955' },
            USDC: { std: 'ERC20', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d' }
        }
    }
}

export type PaymentTransaction = {
    blockNumber: number
    blockHash: string

    timeStamp: number //ms
    hash: string

    from: string
    to: string
    currency: string

    value: string
    tokenDecimal: number

    gas: number
    gasPrice: number
    gasUsed: number

    confirmations: number
    type: 'in' | 'out'
}


export class BlockchainClient {
    protected readonly chainInfo: BlockchainInfo;
    init(): Promise<void> { throw new Error("NOT_IMPLEMENTED"); }
    account(privateKey?: string): Promise<any> { throw new Error("NOT_IMPLEMENTED"); }
    getBalance(address: string, currency = this.chainInfo.mainCurrency, unit: Unit = 'ether'): Promise<string> { throw new Error("NOT_IMPLEMENTED"); }
    getTransactions(address: string, query?: BlockchainScannerQuery): Promise<PaymentTransaction[]> { throw new Error("NOT_IMPLEMENTED"); }
}