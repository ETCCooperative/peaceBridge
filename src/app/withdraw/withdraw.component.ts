import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {PeaceBridgeService} from '../util/peace.bridge.service';
import { ethers } from 'ethers';
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

    constructor(public _pbs: PeaceBridgeService, private _router: Router, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
      // this.getTokenTransferReceipt();
    }

    public ngOnDestroy(): void {
    }

    public async withdraw() {
      this.withdrawTxHash = await this._pbs.withdrawCall(this.tokenId);
      console.log('withdraw tx hash', this.withdrawTxHash);

      const delay = new Promise(resolve => setTimeout(resolve, 11000 ));
      await delay;

      console.log('cont....');

     // this.withdrawTxHash = '0x82f74ca2eb07b8f69ed3fd30e1034b9ee28ee03db0cca1ab1c238dd2e8b7f1ff';

      const rawTransferFrom = await this._pbs.generateRawTxAndMsgHash(this.transferTxHash);
      const rawCustodianApprove = await this._pbs.generateRawTxAndMsgHash(this.custApproveTxHash);
      const rawWithdrawal = await this._pbs.generateRawTxAndMsgHash(this.withdrawTxHash);
      const withdrawArgs = await this._pbs.formBundleLengthsHashes([rawWithdrawal, rawTransferFrom, rawCustodianApprove]);

      const receipt = await this._pbs.getTokenId(this.transferTxHash);
      const toAddress = '0x' + receipt['logs'][0]['topics'][2].substr(26);

      console.log('withdraw args', withdrawArgs);

      const result = await this._pbs.depositWithdrawCall(toAddress,
                                                         this.tokenId,
                                                         withdrawArgs.bytes32Bundle,
                                                         withdrawArgs.txLengths,
                                                         withdrawArgs.txMsgHashes,
                                                         1);

      console.log ('RESULT', result);
    }

 /*    public async getTokenTransferReceipt() {

      if (!this._pbs.ready) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.getTokenTransferReceipt();
      }

      const txHash = '0x83029ca8203076c58aa4fb82b6f29268102be2930b5e8cd383a7a557ce8c55f3';
      const atxHash = '0xab21212886a7dce97adcf9f01c1b58d4b914f90cc74c3f9f3dcf7af8ab48192d';

      const receipt = await this._pbs.getTokenId(atxHash);

      console.log('RECEIPT', receipt);

    } */

}
