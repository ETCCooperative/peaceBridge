import {Injectable} from '@angular/core';
import Web3 from 'web3';
import {Subject} from 'rxjs';
import {ethers, Wallet, Contract} from 'ethers';
import { ReturnStatement } from '@angular/compiler';
import { SigningKey } from 'ethers/utils';
import { contractAbis } from './abis';
import { Provider, Web3Provider } from 'ethers/providers';

const EthereumTx: any = require('ethereumjs-tx');
const Account: any = require('eth-lib/lib/account');
const RLP: any = require('eth-lib/lib/rlp');
const Bytes: any = require('eth-lib/lib/bytes');
const Hash: any = require('eth-lib/lib/hash');

const queryRange: number = 5000; // in blocks...

const foreignNetwork: string = 'kovan';
const homeNetwork: string = 'ropsten';

const tokenContractAddr: string = '0x366021610bF0D5EbfdC9041a7f8b152aa76E6D98';
const depositContractAddr: string = '0xcBB5AeF36f6cde3e046c64EB2149BFFB59b8EFFf';


declare var require: any;
declare let window: any;

export const FOREIGN_NTW: number = 0;
export const HOME_NTW: number = 1;
export const gasPerChallenge: number = 206250;
export const gasPrice: number = 10000000000;

interface User {
  name: string;
  pkey: string;
}

interface Network {
  name: string;
  type: number;
  typeHuman: string;
}


const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err); }

      resolve(res);
    })
  );


@Injectable()
export class BridgeService {

  private tokenContract: Contract = null;
  private depositContract: Contract = null;

  // providers
  private web3: Web3 = null;
  private foreignProvider: Provider = null;
  private homeProvider: Provider = null;

  private currentWallet: Wallet = null;

  private users: User[] = [
      {
        name: 'Unknown',
        pkey: ''
      },
      {
        name: 'Alice',
        pkey: '0x2b847e2e99d7600ab0fbae23643a6a81d009aaf0573e887b41079b614f61e450'
      },
      {
        name: 'Bob',
        pkey: '0x546a0806a2d0240d50797f7f7b0120a6af0d6e8bfa5b4620365f5e8af9eb6fe7'
      },
      {
        name: 'C.Charlie',
        pkey: '0x13410a539b4fdb8dabde37ff8d687cc23eea64ab11eaf348a2fd775ba71a31cc'
      }
  ];

  private networks: Network[] = [
    {name: 'kovan', type: FOREIGN_NTW, typeHuman: 'foreign network'},
    {name: 'ropsten', type: HOME_NTW, typeHuman: 'home network'}
  ];


  private currentUserIdx: number = 1;
  private currentNetworkIdx: number = 0;

  constructor() {
    this.intBridge();
  }

  public async intBridge() {
    // init providers
    this.web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/v3/e4d8f9fcacfd46ec872c77d66711e1aa'));
    this.foreignProvider =  new ethers.providers.InfuraProvider(foreignNetwork, 'e4d8f9fcacfd46ec872c77d66711e1aa');
    this.homeProvider =  new ethers.providers.InfuraProvider(homeNetwork, 'e4d8f9fcacfd46ec872c77d66711e1aa');

    // init contracts
    this.tokenContract = new ethers.Contract(tokenContractAddr,
                                             JSON.parse(contractAbis.tokenAbi),
                                             this.foreignProvider);
    this.depositContract = new ethers.Contract(depositContractAddr,
                                               JSON.parse(contractAbis.depositAbi),
                                               this.homeProvider);

    console.log('token contract: ', this.tokenContract);
    console.log('deposit contract: ', this.depositContract);

    this.setCurrentSigner(this.users[this.currentUserIdx].pkey, this.networks[this.currentNetworkIdx].type);
    console.log('token contract with signer: ', this.tokenContract);
  }


  public setCurrentSigner(pk: string, network: number) {
    if (pk === '') return;
    const skey: SigningKey = new SigningKey(pk);
    this.currentWallet = new ethers.Wallet(skey, (network === FOREIGN_NTW) ? this.foreignProvider : this.homeProvider);
  }

  public getCurrentWallet(): any {
    if (this.currentWallet) {
      return {address: this.currentWallet.address, network: this.networks[this.currentNetworkIdx].name};
    }
    return null;
  }


  public setCurrentUser(idx: number) {
    this.currentUserIdx = idx;
    this.setCurrentSigner(this.users[this.currentUserIdx].pkey, this.networks[this.currentNetworkIdx].type);
  }

  public setCurrentNetwork(idx: number) {
    this.currentNetworkIdx = idx;
    this.setCurrentSigner(this.users[this.currentUserIdx].pkey, this.networks[this.currentNetworkIdx].type);

  }

  public getUsers () {
    return this.users;
  }

  public getCurrentUser () {
    return this.users[this.currentUserIdx];
  }

  public getCurrentNetwork () {
    return this.networks[this.currentNetworkIdx];
  }

  public getTokenContract() {
    return this.tokenContract.connect(this.currentWallet);
  }

  public getDepositContract() {
    return this.depositContract.connect(this.currentWallet);
  }

  public async getTxReceipt(txHash: string, networkType: number) {
    if (networkType === HOME_NTW) {
      return await this.homeProvider.getTransactionReceipt(txHash);
    } else {
      return await this.foreignProvider.getTransactionReceipt(txHash);
    }
  }

  public async getTransferEventsFromTokenContract(startBlock?: number) {
    console.log('FING');
    if (!startBlock) {
      const lastBlock = await this.foreignProvider.getBlockNumber();
      startBlock = lastBlock - queryRange;
      if (startBlock < 0) startBlock = 0;
    }
    let filter = {
      address: tokenContractAddr,
      fromBlock: 1,
      toBlock: 'latest',
      topics: [this.tokenContract.interface.events.TransferRequest.topic]
    };
    return this.foreignProvider.getLogs(filter);
  }

  public async getNonceFromTransferRequest (txHash) {
    const transactionReceipt = await this.getTxReceipt(txHash, FOREIGN_NTW);
    return transactionReceipt['logs'][0]['data'][65];
  }

  public async generateRawTxAndMsgHash (_txHash) {

    console.log('fing');
    const tx = await this.web3.eth.getTransaction(_txHash);
    console.log('lavina');

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


    console.log('TX HASH', _txHash);
    console.log('TX PARAMS', txParams);

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


}
