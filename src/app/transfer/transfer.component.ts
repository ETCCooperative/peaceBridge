import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {PeaceBridgeService} from '../util/peace.bridge.service';
import { ethers } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})

export class TransferComponent implements OnInit, OnDestroy {
    public errorMessage = '';
    public isLoading = false;
    public loaderMessage: string = '';

    public transfers: any = null;

    public tokenId: string = '';
    public toAdress: string = '';
    public txHash: string = '0xce81aeba9879559edf8e2f372b4703c471f2d111d8a290c830d2eb8d87be6f87';

    private subscription: any;



    constructor(public _pbs: PeaceBridgeService, private _router: Router, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
      this.txHash = '';
      this.subscription = this.route.params.subscribe(params => {
        if (params['tokenId'] !== undefined) {

          let tid = (params['tokenId'].startsWith('0x')) ? params['tokenId'].substr(2) : params['tokenId'];
          if (tid.length === 64) {
            this.tokenId = '0x' + tid;

          } else {
            console.error('Wrong token id param');
          }
        }
        console.log('token id', this.tokenId);
      });

      // this.getTransfers();
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

  /*   public async getTransfers() {

      if (!this._pbs.ready) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.getTransfers();
      }

      this.transfers = await this._pbs.getTransferEventsFromTokenContract(0);
      console.log('transfers', this.transfers);
    }
 */
    public async transfer() {
        this.loaderMessage = 'Transfer in progress';
        this.isLoading = true;
        this.errorMessage = '';

        // transfer
        try {
          const transferTx = await this._pbs.transferToken('0x0A2926f2E2C9d60AEBf5Cfe0911FbdeFCE47Db5E', this.toAdress, this.tokenId, 0);
          console.log('transfer token tx', transferTx);
         this.isLoading = false;
         this.txHash = transferTx;

        } catch (e) {
          console.log('ERROR', e);
          this.errorMessage = 'Transaction error.';
          this.isLoading = false;
        }

/*
      // TODO: Move to an another componenet
        // approve
        this.loaderMessage = 'Getting nonce from tx';
        const nonce = await this._pbs.getNonceFromTransferRequest(transferTx);
        console.log('None:::', nonce);

        this.loaderMessage = 'Custodian approve call';
        const custApprTxHash = await this._pbs.custodianApproveCall(this.tokenId, nonce);
        console.log('Appr tx hash', custApprTxHash);
*/
    }

}
