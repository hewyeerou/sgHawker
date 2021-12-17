import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular/directives/navigation/ion-tabs';


@Component({
  selector: 'app-hawker-mgmt-nav',
  templateUrl: './hawker-mgmt-nav.page.html',
  styleUrls: ['./hawker-mgmt-nav.page.scss'],
})
export class HawkerMgmtNavPage implements OnInit {

  @ViewChild('tabs', { static: false }) tabs: IonTabs;

  header: string;

  constructor() { }

  ngOnInit() { }
}
