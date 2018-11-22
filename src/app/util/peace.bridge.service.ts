import {Injectable} from '@angular/core';
import Web3 from 'web3';
import {Subject} from 'rxjs';
import {ethers} from 'ethers';
// import {EthereumTx} from 'ethereumjs-tx';



import { ReturnStatement } from '@angular/compiler';
import { SigningKey } from 'ethers/utils';
import { contractAbis } from './abis';

const EthereumTx: any = require('ethereumjs-tx');
const Account: any = require('eth-lib/lib/account');
const RLP: any = require('eth-lib/lib/rlp');
const Bytes: any = require('eth-lib/lib/bytes');
const Hash: any = require('eth-lib/lib/hash');

const infuraAPI: String = 'e4d8f9fcacfd46ec872c77d66711e1aa';
const tokenContractAddr: String = '0x366021610bF0D5EbfdC9041a7f8b152aa76E6D98';
const depositContractAddr: String = '0xcBB5AeF36f6cde3e046c64EB2149BFFB59b8EFFf';

const foreignNetwork: String = 'kovan'; // 'rinkeby', 'ropsten', 'kovan', 'homestead'
const foreignCustPublicAddr: String = '0xC33Bdb8051D6d2002c0D80A1Dd23A1c9d9FC26E4';
const foreignCustPrivateKey: SigningKey = new SigningKey('0x13410a539b4fdb8dabde37ff8d687cc23eea64ab11eaf348a2fd775ba71a31cc');
const foreignPublicAddr: String = '0x0A2926f2E2C9d60AEBf5Cfe0911FbdeFCE47Db5E';
const foreignPrivateKey: SigningKey = new SigningKey('0x7C6CC4A83505C64C9475A1921920169FC35A21FD61F838A2A5B5FBAB84E8CBDE');
const foreignPublicAddr2: String = '0x942BbcCde96bEc073e1DCfc50bc661c21a674d63';
const foreignPrivateKey2:  SigningKey = new SigningKey('0x546a0806a2d0240d50797f7f7b0120a6af0d6e8bfa5b4620365f5e8af9eb6fe7');
const foreignBlockTimeDelay: Number = 55000;

const homeNetwork: String = 'ropsten'; // 'rinkeby', 'ropsten', 'kovan', 'homestead'
const homeCustPublicAddr: String = '0xC33Bdb8051D6d2002c0D80A1Dd23A1c9d9FC26E4';
const homeCustPrivateKey: SigningKey = new SigningKey('0x13410a539b4fdb8dabde37ff8d687cc23eea64ab11eaf348a2fd775ba71a31cc');
const homePublicAddr: String = '0x0A2926f2E2C9d60AEBf5Cfe0911FbdeFCE47Db5E';
const homePrivateKey:  SigningKey = new SigningKey('0x7C6CC4A83505C64C9475A1921920169FC35A21FD61F838A2A5B5FBAB84E8CBDE');
const homePublicAddr2: String = '0x942BbcCde96bEc073e1DCfc50bc661c21a674d63';
const homePrivateKey2: String = '0x546a0806a2d0240d50797f7f7b0120a6af0d6e8bfa5b4620365f5e8af9eb6fe7';

const homeBlockTimeDelay: number = 55000;
const gasPerChallenge: number = 206250;
const gasPrice: number = 10000000000;

const queryRange: number = 5000; // in blocks...

// const tokenContractAbi: string = contractAbis.tokenAbi;

declare var require: any;
declare let window: any;

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err); }

      resolve(res);
    })
  );


@Injectable()
export class PeaceBridgeService {

  public newtworkType: String = '';
  public tokenContractInstance: any = null;
  public custTokenContractInstance: any = null;
  public depositContractInstance: any = null;


  public ready = false;
  public accountsObservable = new Subject<string[]>();

  private web3: Web3;
  private accounts: string[];

  private ethersWeb3Provider: any = null;

  private foreignProvider: any = null;
  private foreignWeb3: any = null;

  private homeProvider: any = null;
  private homeWeb3: any = null;

  private homeWallet: any = null;
  private foreignWallet: any = null;
  private custForeignWallet: any = null;
  private foreignWallet2: any = null;

  constructor() {
    console.log('ethers?', ethers);
    console.log('PeaceBridgeService');

    console.log('ACCOUNT', Account);

    // this.foreignProvider = new Web3.providers.HttpProvider('https://kovan.infura.io/v3/e4d8f9fcacfd46ec872c77d66711e1aa');
    // this.homeProvider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/e4d8f9fcacfd46ec872c77d66711e1aa');

    // this.foreignWeb3 = new Web3(this.foreignProvider);
    // this.homeWeb3 = new Web3(this.homeProvider);

    // const foreignCustPrivateKey: SigningKey = new SigningKey('0x13410a539b4fdb8dabde37ff8d687cc23eea64ab11eaf348a2fd775ba71a31cc');

    window.addEventListener('load', async (event) => {
      this.bootstrapWeb3();
    });
  }

  public async bootstrapWeb3() {
    if (window.ethereum) {
      console.log('weth', window.ethereum);
      const ethereum = window.ethereum;
      window.web3 = new Web3(ethereum);
      try {
          // Request account access if needed
          await ethereum.enable();
          console.log('enabled');
          // Acccounts now exposed
        } catch (error) {
          // User denied account access...
        }
    }

      console.log('init web3');

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {

      this.web3 = new Web3(window.web3.currentProvider);
      // this.ethersWeb3Provider = new ethers.providers.Web3Provider(window.web3.currentProvider, 'kovan');
      this.foreignProvider =  new ethers.providers.InfuraProvider('kovan', 'e4d8f9fcacfd46ec872c77d66711e1aa');
      this.homeProvider =  new ethers.providers.InfuraProvider('ropsten', 'e4d8f9fcacfd46ec872c77d66711e1aa');

      this.foreignWallet = new ethers.Wallet(homePrivateKey, this.foreignProvider);
      this.homeWallet = new ethers.Wallet(homePrivateKey, this.homeProvider);
      this.custForeignWallet = new ethers.Wallet(foreignCustPrivateKey, this.foreignProvider);

      console.log('W3', this.web3);
      console.log('ethersW3', this.ethersWeb3Provider);
      console.log('homeProvider', this.homeProvider);
      console.log('FOREIGN WALLET', this.foreignWallet);
      console.log('HOME WALLET', this.homeWallet);
      console.log('CUST FOREIGN WALLET', this.custForeignWallet);

      this.initialiseTokenContractInstance();
      this.initialiseDepositContractInstance();
      this.ready = true;

      // test...
      // console.log( await this.generateRawTxAndMsgHash('0x5b4d15a45ff70292c135cbc3fe8c627de04bf8f1394a7955c1770dc0c9bc8555'));

    } else {
      console.log('No web3? You should consider trying MetaMask!');
      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    }

     setInterval(() => this.refreshAccounts(), 3000);

    this.web3.eth.net.getNetworkType().then(ntwType => {
        this.newtworkType = ntwType;
        console.log('NTW type', this.newtworkType);
    });
}

  public async initialiseTokenContractInstance() {
  /*   if (this.isOnForeignNetwork()) {
      this.tokenContractInstance = new this.web3.eth.Contract(JSON.parse(contractAbis.tokenAbi), tokenContractAddr);
    } else {
      this.tokenContractInstance = null;
      console.log('token init failed');
    } */
    const tokenContractInstance = await this.instantiateContract(JSON.parse(contractAbis.tokenAbi), tokenContractAddr, this.foreignWallet);
    this.tokenContractInstance = tokenContractInstance;
    console.log('TOKEN CONTRACT:', tokenContractInstance);

    const custTokenContractInstance = await this.instantiateContract(JSON.parse(contractAbis.tokenAbi), tokenContractAddr, this.custForeignWallet);
    this.custTokenContractInstance = custTokenContractInstance;
    console.log('CUSTODIAN TOKEN CONTRACT:', custTokenContractInstance);

    // this.getBalanceOf('0x0A2926f2E2C9d60AEBf5Cfe0911FbdeFCE47Db5E');

    // console.log('Transfer Events', await this.getTransferEventsFromTokenContract());
 }

  public async initialiseDepositContractInstance() {
    const depositContractInstance = await this.instantiateContract(JSON.parse(contractAbis.depositAbi), depositContractAddr, this.homeWallet);
    this.depositContractInstance = depositContractInstance;
    console.log('DEPOSIT CONTRACT:', depositContractInstance);
  }

  public async instantiateContract(_abi, _addr, _wallet ) {
    const contractInstance = await new ethers.Contract(_addr, _abi, _wallet);
    return new Promise(resolve => { resolve(contractInstance); });
  }

  public isOnHomeNetwork(): boolean {
    return this.newtworkType === homeNetwork;
  }

  public isOnForeignNetwork(): boolean {
    return this.newtworkType === foreignNetwork;
  }

  public getAcc(): string {
    if (this.accounts && this.accounts.length > 0) {
      return this.accounts[0];
    }
    return 'Connecting';
  }

  public async getTokenId(txHash: string) {
   return await this.foreignProvider.getTransactionReceipt(txHash);
   // return await promisify(cb => this.web3.eth.getTransactionReceipt(txHash, cb));
  }


  // testing...
  public async getBalanceOf(address: string) {
    console.log('balance', await this.tokenContractInstance.balanceOf(address));

    let filter = {
         address: tokenContractAddr,
         fromBlock: 1,
         toBlock: 'latest',
         topics: [this.tokenContractInstance.interface.events.TransferRequest.topic]
    };
    this.foreignProvider.getLogs(filter).then((result) => {
        console.log('Token transfer requests', result);
    });

    let filter2 = {
      address: tokenContractAddr,
      fromBlock: 1,
      toBlock: 'latest',
      topics: [this.tokenContractInstance.interface.events.Transfer.topic]
    };

    this.foreignProvider.getLogs(filter2).then((result) => {
          console.log('Approved Transfers', result);
      });
    }

  public async getTransferEventsFromTokenContract(startBlock?: number) {
    if (!startBlock) {
      const lastBlock = await this.foreignProvider.getBlockNumber();
      startBlock = lastBlock - queryRange;
      if (startBlock < 0) startBlock = 0;
    }
    let filter = {
      address: tokenContractAddr,
      fromBlock: 1,
      toBlock: 'latest',
      topics: [this.tokenContractInstance.interface.events.TransferRequest.topic]
    };
    return this.foreignProvider.getLogs(filter);
  }

  public async getNonceFromTransferRequest (txHash) {
    const transactionReceipt = await this.foreignProvider.getTransactionReceipt(txHash);
    console.log('***** TX RECEIPT', transactionReceipt);
    const nonce = await transactionReceipt['logs'][0]['data'][65];
    return nonce;
  }

  public async transferToken(from, to, tokenId, declaredNonce) {
    console.log('TRABSFER CALL', from, to, tokenId, declaredNonce);
    const tx = await this.tokenContractInstance.transferFrom(from, to, tokenId, declaredNonce);
    const txHash = tx.hash;
    console.log('tokenId '  + tokenId + ' transferred from address ' + from + ' to address ' + to + ' in transaction ' + txHash);
    return txHash;
  }


  public async  custodianApproveCall(tokenId, declaredNonce) {
    const result = await this.custTokenContractInstance.custodianApprove(tokenId, declaredNonce);

    console.log('Approve res: ' + result);

    const txHash = result.hash;
    console.log('Transfer approved at tx: ' + txHash);
    return txHash;
  }

  public async withdrawCall(tokenId: string) {
    const tx = await this.tokenContractInstance.withdraw(tokenId);
    console.log ('WCALL RESULT', tx);
    return tx['hash'];
  }

  public async depositWithdrawCall( to, tokenId, rawTxBundle, txLengths, txMsgHashes, declaredNonce) {
    const amt = gasPerChallenge * gasPrice;

    console.log('****** WITHDRAW CALL ******');
    console.log('amount', amt);
    console.log('to', to);
    console.log('toked id', tokenId);
    console.log('raw tx bundle', rawTxBundle);
    console.log('tx lengths', txLengths);
    console.log('msg hashes', txMsgHashes);
    console.log('declared nonce', declaredNonce);

    const result = await this.depositContractInstance.withdraw(to, tokenId, rawTxBundle, txLengths, txMsgHashes, declaredNonce, {value: amt});
    return result['hash'];
  }


  public async generateRawTxAndMsgHash (_txHash/* , _web3Provider */) {

    const tx = await this.web3.eth.getTransaction(_txHash);
    // wait for tx
    if (tx === null) {
      const delay = new Promise(resolve => setTimeout(resolve, 300));
      await delay;
      return await this.generateRawTxAndMsgHash(_txHash);
    }



    const txParams: any = {};
    txParams.nonce = await this.web3.utils.toHex(tx['nonce']);
    txParams.gasPrice = await this.web3.utils.toHex(tx['gasPrice']);
    txParams.gasLimit = await this.web3.utils.toHex(tx['gas']);
    txParams.to = await tx['to'];
    txParams.value = await this.web3.utils.toHex(tx['value']);
    // txParams.value = this.web3.utils.toHex(0x0)
    txParams.data = await tx['input'];
    txParams.v = await tx['v']; // .toString('hex');
    txParams.r = await tx['r']; // .toString('hex');
    txParams.s = await tx['s']; // .toString('hex');


    // console.log('TX PARAMS', txParams);

    const txRaw =  new EthereumTx(txParams);
    const rawTx = txRaw.serialize();


    const values = RLP.decode('0x' + rawTx.toString('hex'));

    let v = values[6];

    if (v.substr(v.length - 1) === '7') {
      v = '0x1b';
    }
    if (v.substr(v.length - 1) === '8') {
      v = '0x1c';
    }
    const r = values[7];
    const s = values[8];

    const txParams2: any = {};
    txParams2.nonce = values[0];
    txParams2.gasPrice = values[1];
    txParams2.gasLimit = values[2];
    txParams2.to = values[3];
    txParams2.value = values[4];
    // txParams.value = this.web3.utils.toHex(0x0)
    txParams2.data = values[5];
    txParams2.v = v;
    txParams2.r = values[7];
    txParams2.s = values[8];

    const txRaw2 = new EthereumTx(txParams2);
    const rawTx2 = txRaw2.serialize();

    // Form msgHash
    const signature = Account.encodeSignature(values.slice(6, 9));
    const recovery = Bytes.toNumber(values[6]);
    const extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), '0x', '0x'];
    const signingData = values.slice(0, 6).concat(extraData);
    const signingDataHex = RLP.encode(signingData);

    const msgHash = Hash.keccak256(signingDataHex);

    console.log('v: ', v);
    console.log('r: ', r);
    console.log('s: ', s);
    console.log(this.web3.eth.accounts.recover(msgHash, v, r, s, true));

    return {rawTx: rawTx2, msgHash: msgHash};

  }

  public formBundleLengthsHashes(rawTxArr) {
    let bundleArr = [];
    let txLengths = [];
    let txMsgHashes = [];
    rawTxArr.forEach((value, i) => {
      bundleArr[i] = value.rawTx.toString('hex');
      txLengths[i] = value.rawTx.toString('hex').length + 2;
      txMsgHashes[i] = value.msgHash;

      console.log('RAW TX', value.rawTx.toString('hex'));
      console.log('RAW TX LEN', txLengths[i]);
    });
    const bytes32Bundle = this.txsToBytes32BundleArr(bundleArr);
    return {bytes32Bundle: bytes32Bundle, txLengths: txLengths, txMsgHashes: txMsgHashes};
  }

  private txsToBytes32BundleArr(rawTxStringArr) {
    let bytes32Bundle = [];
    rawTxStringArr.forEach(value => {
      let tempBundle = this.toBytes32BundleArr(value);
      tempBundle.forEach(val => bytes32Bundle.push(val));
    });
    return bytes32Bundle;
  }

  private toBytes32BundleArr (rawBundle) {
    let bytes32Bundle = [];
    for (let i = 0; i < rawBundle.length; i ++) {
      bytes32Bundle[Math.floor(i / 64)] = (bytes32Bundle[Math.floor(i / 64)]) ? bytes32Bundle[Math.floor(i / 64)] + rawBundle[i] : rawBundle[i] ;
    }
    bytes32Bundle.forEach((value, index) => {
      bytes32Bundle[index] = '0x' + bytes32Bundle[index];
      // padding if shorter than 32
      while (bytes32Bundle[index].length < 66) { bytes32Bundle[index] += '0'; }
      if (bytes32Bundle[index].length !== 66) { throw new Error('invalid web3 implicit bytes32'); }
    });
    return bytes32Bundle;
  }


  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err != null) {
        console.warn('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');
        this.accountsObservable.next(accs);
        this.accounts = accs;
      }
      this.ready = true;
    });
  }





}
