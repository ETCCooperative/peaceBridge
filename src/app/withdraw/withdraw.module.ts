import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {WithdrawComponent} from './withdraw.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule
  ],
  declarations: [WithdrawComponent],
  exports: [WithdrawComponent]
})

export class WithdrawModule {
}
