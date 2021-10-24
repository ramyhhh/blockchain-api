import Web3 from 'web3';
import { Transaction, Account, TransactionConfig } from 'web3-core';
import { AbiItem, Unit } from 'web3-utils';
import { BlockchainClient, BlockchainInfo, CurrencyInfo, PaymentTransaction } from './_blockchain.base';
import { BlockchainScanner, BlockchainScannerQuery } from 'src/blockchain-scanner/blockchain-scanner';
import { EthScanner } from 'src/blockchain-scanner/eth.scanner';


export class Web3BlockchainClient extends BlockchainClient {

    static ERC20_ABI = [
        { "constant": true, "inputs": [{ "name": "_addr", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
        { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
        { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }
    ] as AbiItem[];


    web3: Web3;
    _scanner: BlockchainScanner;

    constructor(public readonly chainInfo: BlockchainInfo) { super(); }

    async init() {
        this.web3 = new Web3(this.chainInfo.providerUrl);
        const blockNumber = await this.web3.eth.getBlockNumber();
        if (!blockNumber) throw "COULD_NOT_CONNECT_TO_PROVIDER";


        switch (this.chainInfo.blockchainName) {
            case 'BSC': this._scanner = new EthScanner(this.chainInfo); break;
            case 'ETH': this._scanner = new EthScanner(this.chainInfo); break;
            default:
                break;
        }
    }

    async account(privateKey?: string): Promise<Account> {
        const web3 = this.web3;

        const account = privateKey ?
            web3.eth.accounts.privateKeyToAccount(privateKey) :
            web3.eth.accounts.create();

        return account;
    }

    private async _getConfirmations(txHash: string): Promise<number> {
        const receipt = await this.web3.eth.getTransactionReceipt(txHash);
        const currentBlock = await this.web3.eth.getBlockNumber();
        return receipt?.blockNumber == null ? 0 : currentBlock - receipt.blockNumber;
    }

    async isTransactionConfirmed(txHash: string): Promise<boolean> {
        const confirmations = await this._getConfirmations(txHash);
        return confirmations > this.chainInfo.requiredConfirmations;
    }

    async getTransaction(txHash: string): Promise<Transaction> {
        return this.web3.eth.getTransaction(txHash);
    }

    async getBalance(address: string, currency = this.chainInfo.mainCurrency, unit: Unit = 'ether'): Promise<string> {
        const web3 = this.web3;
        let wei: string;
        let currencyInfo: CurrencyInfo;

        if (currency == this.chainInfo.mainCurrency) {
            wei = await web3.eth.getBalance(address);
        } else if (currencyInfo = this.chainInfo.knownCurrencies[currency]) {
            switch (currencyInfo.std) {
                case 'ERC20': wei = await this._balanceERC20(address, currencyInfo.address); break;
                default: throw "UNSUPPORTED_STANDARD";
            }
        }
        else throw "UNKOWN_CURRENCY";

        return web3.utils.fromWei(wei, unit);
    }

    private async _balanceERC20(address: string, currencyAddress: string): Promise<string> {
        const web3 = this.web3;

        const contract = new web3.eth.Contract(Web3BlockchainClient.ERC20_ABI, currencyAddress, { from: address });
        const wei = await contract.methods.balanceOf(address).call();
        return wei;
    }


    sendTransaction(privateKey: string, to: string, value: number, currency: string = this.chainInfo.mainCurrency, unit: Unit = 'ether') {
        let currencyInfo: CurrencyInfo;

        if (currency == this.chainInfo.mainCurrency) {
            return this._sendTransaction(privateKey, to, value, unit);
        } else if (currencyInfo = this.chainInfo.knownCurrencies[currency]) {
            switch (currencyInfo.std) {
                case 'ERC20': return this._sendERC20Transaction(privateKey, currencyInfo.address, to, value, unit);
                default: throw "UNSUPPORTED_STANDARD";
            }
        }
        else throw "UNKOWN_CURRENCY";
    }

    private async _wrapTransaction(from: string, to: string, wei: string, data?: string): Promise<TransactionConfig> {
        const web3 = this.web3;


        const nonce = await web3.eth.getTransactionCount(from);

        return {
            nonce,
            from,
            to,
            value: wei,
            data,

            gas: 100000,
            // gasPrice: await web3.eth.getGasPrice(),
        };
    }

    private async _sendTransaction(privateKey: string, to: string, value: number, unit: Unit = 'ether') {
        const web3 = this.web3;
        const fromAccount = await this.account(privateKey);
        const from = fromAccount.address;


        const wei = web3.utils.toWei(value + '', unit);
        const amount = web3.utils.toHex(wei);

        const tx = await this._wrapTransaction(from, to, amount);
        const signed = await this.web3.eth.accounts.signTransaction(tx, privateKey);


        const recipte = await this.web3.eth.sendSignedTransaction(signed.rawTransaction);
        return recipte;
    }

    private async _sendERC20Transaction(privateKey: string, currencyAddress: string, to: string, value: number, unit: Unit = 'ether') {
        const web3 = this.web3;
        const account = await this.account(privateKey);
        const from = account.address;

        const wei = web3.utils.toWei(value + '', unit);
        const amount = web3.utils.toHex(wei);

        const contract = new web3.eth.Contract(Web3BlockchainClient.ERC20_ABI, currencyAddress, { from });
        const contractFunctionInput = contract.methods.transfer(to, amount).encodeABI();

        const tx = await this._wrapTransaction(from, currencyAddress, '0x0', contractFunctionInput);
        const signed = await web3.eth.accounts.signTransaction(tx, privateKey);

        const recipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        return recipt;
    }

    getTransactions(address: string, query?: BlockchainScannerQuery): Promise<PaymentTransaction[]> {
        if (!this._scanner) throw new Error("The BlockchainInfo provided has no block scanner associated ...");
        return this._scanner.getTransactions(address, query);
    }




}
