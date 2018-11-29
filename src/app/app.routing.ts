/* tslint:disable: max-line-length */
import { Routes } from '@angular/router';

import { DashboardComponent } from './features/dashboard.component';
import { NotFound404Component } from './not-found404.component';
import { DepositComponent } from './deposit/deposit.component';
import { TransferComponent } from './transfer/transfer.component';
import { ApproveComponent } from './approve/approve.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { ClaimComponent } from './claim/claim.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'deposit', component: DepositComponent },
  { path: 'transfer', component: TransferComponent},
  { path: 'transfer/:tokenId', component: TransferComponent},
  { path: 'approve', component: ApproveComponent},
  { path: 'withdraw', component: WithdrawComponent},
  { path: 'claim', component: ClaimComponent},
  { path: 'claim/:tokenId', component: ClaimComponent},
  /* { path: 'lazy', loadChildren: './features/lazy/index#LazyModule' }, */
  { path: '**', component: NotFound404Component }
];
