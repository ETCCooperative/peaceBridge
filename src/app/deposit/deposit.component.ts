import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { ethers, Wallet } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { BridgeService, FOREIGN_NTW, HOME_NTW } from '../util/bridge.service';
/* import { Subscription } from 'rxjs/Subscription'; */

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})

export class DepositComponent implements OnInit {
    public errorMessage = '';
    public products: any[];

    public isLoading = false;
    public  amountToDeposit: Number;

    public loaderMessage: string = '';

    public isMintingFinished: boolean = false;
    public mintedTokenId: string = '';
    public transactionHash: string = '';


    constructor(public _bs: BridgeService, private _router: Router) {}

    ngOnInit(): void {
      // this.getContractInstance();
    }

    public async deposit() {
      this.mintedTokenId = '';
      this.transactionHash = '';

      this.loaderMessage = 'Minting in progress';
      this.isLoading = true;

      // setup
      this._bs.setCurrentNetwork(FOREIGN_NTW);
      const foreignWallet: Wallet = this._bs.getCurrentWallet();
      const tokenContract = this._bs.getTokenContract();

      const result = await tokenContract.mint(this.amountToDeposit, foreignWallet.address);
      console.log('tx result', result);

      this.loaderMessage = 'Wainting for tx receipt';
      const tokenId = await this.getTokenId(result.hash);
      console.log('token id', tokenId);


      this._bs.setCurrentNetwork(HOME_NTW);
      const homeWallet: Wallet = this._bs.getCurrentWallet();
      const depositContract = this._bs.getDepositContract();

      this.loaderMessage = 'Depositing in progress';
      const depositResult = await depositContract.deposit(tokenId, homeWallet.address, {value: ethers.utils.hexlify(Number(this.amountToDeposit))});
      console.log('deposit result', depositResult);
      console.log('deposit hash', depositResult.hash);

      this.mintedTokenId = tokenId;
      this.transactionHash = depositResult.hash;
      this.isMintingFinished = true;

      this._bs.setCurrentNetwork(FOREIGN_NTW);
      this.isLoading = false;
    }

    private async getTokenId(hash: any) {
      const receipt = await this._bs.getTxReceipt(hash, FOREIGN_NTW);
      if (receipt === null) {
        const delay = new Promise(resolve => setTimeout(resolve, 300));
        await delay;
        return await this.getTokenId(hash);
      }
      const tokenId = receipt['logs'][0]['topics'][3];
      return tokenId;
    }
}

