import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular/directives/navigation/ion-tabs';

@Component({
  selector: 'app-finance-management',
  templateUrl: './finance-management.page.html',
  styleUrls: ['./finance-management.page.scss'],
})
export class FinanceManagementPage implements OnInit {

  @ViewChild('tabs', { static: false }) tabs: IonTabs;
  header: string;

  constructor() { }

  ngOnInit() {
  }

}
