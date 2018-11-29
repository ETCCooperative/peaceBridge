import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {BridgeService, FOREIGN_NTW, HOME_NTW, gasPerChallenge, gasPrice } from '../util/bridge.service';
import { ethers, Wallet } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { TransactionReceipt } from 'ethers/providers';
import { throwError } from 'ethers/errors';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css']
})

export class WithdrawComponent implements OnInit, OnDestroy {
    public errorMessage = '';
    public isLoading = false;
    public loaderMessage: string = '';

    public tokenId: string = '';
    public transferTxHash: string = '';
    public custApproveTxHash: string = '';
    public withdrawTxHash: string = '';

    public resultHash = '';

    constructor(public _bs: BridgeService, private _router: Router, private route: ActivatedRoute) {
    }

    async ngOnInit() {
      // this.getTokenTransferReceipt();
      // console.log('TRANSFER TX HASH', await this.getTransferTxHash('0xfdd3243fa2077fd84c212fde758052fc8ce095eeca279ae1165c7e51d182b9ec'));
    }

    public ngOnDestroy(): void {
    }

    public async getTransferTxHash(res: TransactionReceipt) {
      // const res = await this._bs.getTxReceipt(approveTxHash, FOREIGN_NTW);
      console.log('approve receipt', res);

      const transfers = await this._bs.getTransferEventsFromTokenContract(0);

      console.log('transfers', transfers);
      const aTopics = res.logs[0].topics;

      for (let i = 0; i < transfers.length; i++) {
        let topics = transfers[i].topics;

        if (topics[3] === aTopics[3] && topics[2] === aTopics[2] && topics[1] === aTopics[1]) {
          return transfers[i].transactionHash;
        }
      }
      return null;
    }

    public async withdraw() {

      this.isLoading = true;
      this.loaderMessage = 'Withdraw on tonken contract';
      try {

        // getting the token id from approve
        const res = await this._bs.getTxReceipt(this.custApproveTxHash, FOREIGN_NTW);
        this.tokenId = res.logs[0].topics[3];
        console.log('TOKEN ID', this.tokenId);

        // getting the transaction hash
        this. transferTxHash =  await this.getTransferTxHash(res);
        console.log('TRANSER TX HASH', this.transferTxHash);

        if ( this.transferTxHash === null) {
          throw('No transfer tx hash found.');
        }

        this._bs.setCurrentNetwork(FOREIGN_NTW);
        const tokenContract = this._bs.getTokenContract();

        const tx = await tokenContract.withdraw(this.tokenId);
        console.log ('WCALL RESULT', tx);
        this.withdrawTxHash = tx['hash'];
        console.log('withdraw tx hash', this.withdrawTxHash);

        const delay = new Promise(resolve => setTimeout(resolve, 1000 ));
        await delay;
        console.log('cont....');


        const rawTransferFrom = await this._bs.generateRawTxAndMsgHash(this.transferTxHash);
        const rawCustodianApprove = await this._bs.generateRawTxAndMsgHash(this.custApproveTxHash);
        const rawWithdrawal = await this._bs.generateRawTxAndMsgHash(this.withdrawTxHash);
        const withdrawArgs = await this._bs.formBundleLengthsHashes([rawWithdrawal, rawTransferFrom, rawCustodianApprove]);

        const receipt = await this._bs.getTxReceipt(this.transferTxHash, FOREIGN_NTW);
        const toAddress = '0x' + receipt['logs'][0]['topics'][2].substr(26);

        console.log('withdraw args', withdrawArgs);

        this.loaderMessage = 'Withdraw on deposit contract';
        await delay;

        this._bs.setCurrentNetwork(HOME_NTW);
        const depositContract = this._bs.getDepositContract();

        console.log('deposit contract: ', depositContract);

        const amt = gasPerChallenge * gasPrice;
        const result = await depositContract.withdraw(toAddress, this.tokenId, withdrawArgs.bytes32Bundle, withdrawArgs.txLengths, withdrawArgs.txMsgHashes, 1, {value: amt});

        this.resultHash = result['hash'];
        console.log ('RESULT', this.resultHash);
        this.isLoading = false;
      } catch (e) {
        console.log('ERROR::', e);
        this.isLoading = false;
      }
    }
}
