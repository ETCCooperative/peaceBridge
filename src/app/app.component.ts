import { Component, ViewEncapsulation } from '@angular/core';

import { views } from './app-nav-views';
import { PeaceBridgeService } from './util/peace.bridge.service';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  views = views;

  constructor(public _pbs: PeaceBridgeService) { }

  activateEvent(event) {
    if (ENV === 'development') {
      console.log('Activate Event:', event);
    }
  }
  deactivateEvent(event) {
    if (ENV === 'development') {
      console.log('Deactivate Event', event);
    }
  }
}
