/**
 * This module is the entry for your App.
 *
 * Make sure to use the 3 constant APP_ imports so you don't have to keep
 * track of your root app dependencies here. Only import directly in this file if
 * there is something that is specific to the environment.
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, PreloadAllModules } from '@angular/router';

import { APP_DECLARATIONS } from './app.declarations';
import { APP_ENTRY_COMPONENTS } from './app.entry-components';
import { APP_IMPORTS } from './app.imports';
import { APP_PROVIDERS } from './app.providers';

import { routes } from './app.routing';

import { AppComponent } from './app.component';
import { UtilModule } from './util/util.module';
import { NavbarModule } from './navbar/navbar.module';
import { DepositModule } from './deposit/deposit.module';
import { TransferModule } from './transfer/transfer.module';
import { ApproveModule } from './approve/approve.module';
import { WithdrawModule } from './withdraw/withdraw.module';
import { ClaimModule } from './claim/claim.module';



@NgModule({
  declarations: [
    AppComponent,
    APP_DECLARATIONS
  ],
  entryComponents: [APP_ENTRY_COMPONENTS],
  imports: [
    BrowserModule,
    HttpClientModule,
    APP_IMPORTS,
    UtilModule,
    NavbarModule,
    DepositModule,
    TransferModule,
    ApproveModule,
    WithdrawModule,
    ClaimModule,
    RouterModule.forRoot(routes, { useHash: false, preloadingStrategy: PreloadAllModules }),
  ],
  bootstrap: [AppComponent],
  exports: [AppComponent],
  providers: [APP_PROVIDERS]
})

export class AppModule {}
