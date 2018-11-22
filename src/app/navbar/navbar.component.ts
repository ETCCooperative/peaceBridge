import { Component, OnInit, HostListener } from '@angular/core';

declare var window: any;

@Component({
    selector: 'app-nav-bar',
    templateUrl: 'navbar.component.html',
     styleUrls: ['navbar.component.css']
})
export class NavbarComponent implements OnInit {
    public isCollapsed = true;
    public isNavEnabled = true;

    constructor() {}

    ngOnInit() { }
}
