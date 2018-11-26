import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BridgeService, HOME_NTW, FOREIGN_NTW } from '../util/bridge.service';
import { ethers, Wallet } from 'ethers';
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

    constructor(public _bs: BridgeService, private _router: Router, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
      this.loaderMessage = 'Getting the latest transactions';
      this.isLoading = true;

      this._bs.setCurrentNetwork(FOREIGN_NTW);
      this.getTransfers();
    }

    public ngOnDestroy(): void {

    }

    public async getTransfers() {
      this.transfers = await this._bs.getTransferEventsFromTokenContract(0);
      console.log('transfers', this.transfers);
      this.isLoading = false;
    }

    public async approve(txHash: string, tokenId: string) {
        // TODO: input validation

        this.isLoading = true;
        this.loaderMessage = 'Getting nonce from tx';
        this.errorMessage = '';

        try {

          const nonce = await this._bs.getNonceFromTransferRequest(txHash);
          console.log('None:::', nonce);

          this.loaderMessage = 'Custodian approve call';

          this._bs.setCurrentNetwork(FOREIGN_NTW);
          const foreignWallet: Wallet = this._bs.getCurrentWallet();
          const tokenContract = this._bs.getTokenContract();

          const result = await tokenContract.custodianApprove(tokenId, nonce);
          const custApprTxHash = result.hash;
          console.log('Transfer approved at tx: ' + custApprTxHash);

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
