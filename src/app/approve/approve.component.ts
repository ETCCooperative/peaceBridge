import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {PeaceBridgeService} from '../util/peace.bridge.service';
import { ethers } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.css']
})

export class ApproveComponent implements OnInit, OnDestroy {
    public errorMessage = '';
    public isLoading = false;
    public loaderMessage: string = '';

    public transfers: any = null;
    public apprTxHash: string = '';

    public isApproveFinished: boolean = false;

    constructor(public _pbs: PeaceBridgeService, private _router: Router, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
      this.loaderMessage = 'Getting the latest transactions';
      this.isLoading = true;
      this.getTransfers();
    }

    public ngOnDestroy(): void {

    }

    public async getTransfers() {

      if (!this._pbs.ready) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.getTransfers();
      }

      this.transfers = await this._pbs.getTransferEventsFromTokenContract(0);
      console.log('transfers', this.transfers);
      this.isLoading = false;
    }

    public async approve(txHash: string, tokenId: string) {
        // TODO: input validation

        this.isLoading = true;
        this.loaderMessage = 'Getting nonce from tx';
        this.errorMessage = '';

        try {

          const nonce = await this._pbs.getNonceFromTransferRequest(txHash);
          console.log('None:::', nonce);

          this.loaderMessage = 'Custodian approve call';
          const custApprTxHash = await this._pbs.custodianApproveCall(tokenId, nonce);
          console.log('Appr tx hash', custApprTxHash);

          this.apprTxHash = custApprTxHash;
          this.isApproveFinished = true;
          this.isLoading = false;

          this.transfers = [];

        } catch (e) {
          this.isLoading = false;
          this.errorMessage = 'Transaction error. Isn\'t the transfer approved yet?';
        }


    }

}
