import { Component, OnInit, HostListener } from '@angular/core';
import { BridgeService } from '../util/bridge.service';

declare var window: any;

@Component({
    selector: 'app-nav-bar',
    templateUrl: 'navbar.component.html',
     styleUrls: ['navbar.component.css']
})
export class NavbarComponent implements OnInit {
    public isCollapsed = true;
    public isNavEnabled = true;

    constructor(public _bs: BridgeService) {}

    ngOnInit() { }

    public setUser(idx: number) {
      this._bs.setCurrentUser(idx);
    }
}
