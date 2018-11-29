import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { ethers, Wallet } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { BridgeService, FOREIGN_NTW, HOME_NTW } from '../util/bridge.service';
/* import { Subscription } from 'rxjs/Subscription'; */

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})

export class ClaimComponent implements OnInit {
    public errorMessage = '';

    public isLoading = false;
    public  tokenId: string;

    public loaderMessage: string = '';
    public transactionHash: string = '';


    constructor(public _bs: BridgeService, private _router: Router) {}

    ngOnInit(): void {
      // this.getContractInstance();
      this._bs.setCurrentNetwork(HOME_NTW);

    }

    public async claim() {
      this.transactionHash = '';

      this.loaderMessage = 'Claim in progress';
      this.isLoading = true;

      // setup
      this._bs.setCurrentNetwork(HOME_NTW);
      const homeWallet: Wallet = this._bs.getCurrentWallet();
      const depositContract = this._bs.getDepositContract();

      console.log(depositContract);

      const result = await depositContract.claim(this.tokenId);

      console.log ('RES', result);


      this.isLoading = false;
    }
}

