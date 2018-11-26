import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {BridgeService, HOME_NTW, FOREIGN_NTW} from '../util/bridge.service';
import { ethers, Wallet } from 'ethers';
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
    public txHash: string = '';

    private subscription: any;

    constructor(public _bs: BridgeService, private _router: Router, private route: ActivatedRoute) {
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

    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public async transfer() {
        this.loaderMessage = 'Transfer in progress';
        this.isLoading = true;
        this.errorMessage = '';

        // transfer
        try {
          this._bs.setCurrentNetwork(FOREIGN_NTW);
          const foreignWallet: Wallet = this._bs.getCurrentWallet();
          const tokenContract = this._bs.getTokenContract();
          const tx = await tokenContract.transferFrom(foreignWallet.address, this.toAdress, this.tokenId, 0);
          const transferTx = tx.hash;

          console.log('transfer token tx', transferTx);
          this.isLoading = false;
          this.txHash = transferTx;
        } catch (e) {
          console.log('ERROR', e);
          this.errorMessage = 'Transaction error.';
          this.isLoading = false;
        }
    }

}
