import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavbarComponent} from './navbar.component';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbModule
  ],
  declarations: [NavbarComponent],
  exports: [NavbarComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class NavbarModule {
}
