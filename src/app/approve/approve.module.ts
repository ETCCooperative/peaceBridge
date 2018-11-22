import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ApproveComponent} from './approve.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule
  ],
  declarations: [ApproveComponent],
  exports: [ApproveComponent]
})

export class ApproveModule {
}
