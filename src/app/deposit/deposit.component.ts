import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import {PeaceBridgeService} from '../util/peace.bridge.service';
import { ethers } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
/* import { Subscription } from 'rxjs/Subscription'; */

const foreignPublicAddr2: String = '0x942BbcCde96bEc073e1DCfc50bc661c21a674d63';


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


    constructor(public _pbs: PeaceBridgeService, private _router: Router) {}

    ngOnInit(): void {
      // this.getContractInstance();
    }

    public async deposit() {
      if (this._pbs.tokenContractInstance !== null) {

        this.mintedTokenId = '';
        this.transactionHash = '';

        this.loaderMessage = 'Minting in progress';
        this.isLoading = true;
        const _this = this;
        const result = await this._pbs.tokenContractInstance.mint(this.amountToDeposit, '0x0A2926f2E2C9d60AEBf5Cfe0911FbdeFCE47Db5E');
        console.log('tx result', result);

        this.loaderMessage = 'Wainting for tx receipt';
        const tokenId = await this.getTokenId(result.hash);
        console.log('token id', tokenId);

        this.loaderMessage = 'Depositing in progress';
        const depositResult = await this._pbs.depositContractInstance.deposit(tokenId, '0x0A2926f2E2C9d60AEBf5Cfe0911FbdeFCE47Db5E', {value: ethers.utils.hexlify(Number(this.amountToDeposit))});

        console.log('deposit result', depositResult);
        console.log('deposit hash', depositResult.hash);

        this.mintedTokenId = tokenId;
        this.transactionHash = depositResult.hash;

        this.isMintingFinished = true;

        this.isLoading = false;

      } else {
        console.log ('ERROR. No token contract.');
      }
    }

    private async getTokenId(hash: any) {
      const receipt = await this._pbs.getTokenId(hash);
      if (receipt === null) {
        const delay = new Promise(resolve => setTimeout(resolve, 300));
        await delay;
        return await this.getTokenId(hash);
      }
      const tokenId = receipt['logs'][0]['topics'][3];
      return tokenId;
    }
}

