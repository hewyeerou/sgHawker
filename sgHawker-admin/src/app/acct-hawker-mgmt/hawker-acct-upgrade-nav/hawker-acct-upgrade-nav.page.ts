import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';

@Component({
  selector: 'app-hawker-acct-upgrade-nav',
  templateUrl: './hawker-acct-upgrade-nav.page.html',
  styleUrls: ['./hawker-acct-upgrade-nav.page.scss'],
})
export class HawkerAcctUpgradeNavPage implements OnInit {

  @ViewChild('tabs', { static: false }) tabs: IonTabs;

  constructor() { }

  ngOnInit() {
  }

}
