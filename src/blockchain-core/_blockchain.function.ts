import { Web3BlockchainClient } from "./web3-blockchain";
import { BlockchainClient, BlockchainInfo, CommonBlockchains, COMMON_CHAINS } from "./_blockchain.base";

export async function blockchain(blockchain: CommonBlockchains | BlockchainInfo, chainInfo?: Partial<BlockchainInfo>): Promise<BlockchainClient> {

    const blockchainName = typeof blockchain === 'string' ? blockchain : blockchain.blockchainName;
    let blockChainInfo = typeof blockchain === 'string' ? COMMON_CHAINS[blockchain] : blockchain;
    blockChainInfo = { ...blockChainInfo, ...chainInfo }
    
    let result: BlockchainClient;

    switch (blockchainName) {

        //WEB3
        case 'ETH':
        case 'BSC':
        case 'BSC-TESTNET': result = new Web3BlockchainClient(blockChainInfo); break;

        default: throw "UNSUPORTED_BLOCKCHAIN";
    }

    await result.init();
    return result;
}