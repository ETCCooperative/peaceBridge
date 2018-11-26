import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {BridgeService, FOREIGN_NTW, HOME_NTW, gasPerChallenge, gasPrice } from '../util/bridge.service';
import { ethers, Wallet } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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

    ngOnInit(): void {
      // this.getTokenTransferReceipt();
    }

    public ngOnDestroy(): void {
    }

    public async withdraw() {

      this.isLoading = true;
      this.loaderMessage = 'Withdraw on tonken contract';
      try {
        this._bs.setCurrentNetwork(FOREIGN_NTW);
        const tokenContract = this._bs.getTokenContract();

        const tx = await tokenContract.withdraw(this.tokenId);
        console.log ('WCALL RESULT', tx);
        this.withdrawTxHash = tx['hash'];
        console.log('withdraw tx hash', this.withdrawTxHash);

        const delay = new Promise(resolve => setTimeout(resolve, 3000 ));
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
