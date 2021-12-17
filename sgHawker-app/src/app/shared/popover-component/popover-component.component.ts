import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover-component',
  templateUrl: './popover-component.component.html',
  styleUrls: ['./popover-component.component.scss'],
})
export class PopoverComponentComponent implements OnInit {
  @Input() items: {
    label: string;
    eventHandler: () => void;
    type?: 'ADD' | 'MANAGE' | 'FOOD' | 'SET' | 'CARD' | 'BANK';
  }[];

  constructor(
    private router: Router,
    public popoverController: PopoverController
  ) { }

  ngOnInit() {
  }

  dismissModalCtrller() {
    this.popoverController.dismiss({});
  }
  navigateToAddMenuPage = (i) => {
    this.items[i].eventHandler();
    this.dismissModalCtrller();
  };

  dismiss() {
    this.popoverController.dismiss();
  }
}
