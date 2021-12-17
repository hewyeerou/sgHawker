import { Component, Input, OnInit } from '@angular/core';
import { PopoverController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  @Input() items: {
    label: string,
    type?: 'ADD' | 'MANAGE' | 'FOOD' | 'SET' | 'CARD' | 'BANK'
  }[];

  constructor(
    public popoverController: PopoverController,
  ) { }

  ngOnInit() {
  }

}
