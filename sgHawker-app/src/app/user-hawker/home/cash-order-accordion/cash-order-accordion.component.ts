/* eslint-disable no-underscore-dangle */
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  Renderer2,
  Input,
} from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'cash-order-accordion',
  templateUrl: './cash-order-accordion.component.html',
  styleUrls: ['./cash-order-accordion.component.scss'],
})
export class CashOrderAccordionComponent implements OnInit, AfterViewInit {
  @ViewChild('details') cardContent: any;
  @Input() order: Order;
  @Input() markCashOrderPaidCB: (order: Order) => void;
  expanded = false;
  timeleft;
  startedDeleteTimer = false;
  deleteTimer;

  constructor(
    public renderer: Renderer2,
    public alertController: AlertController,
    public toastController: ToastController
  ) { }

  ngOnInit() { }

  ngAfterViewInit() { }

  toggleAccordion() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.renderer.setStyle(this.cardContent.el, 'max-height', '500px');
      this.renderer.setStyle(this.cardContent.el, 'padding', '5px 16px');
    } else {
      this.renderer.setStyle(this.cardContent.el, 'max-height', '0px');
      this.renderer.setStyle(this.cardContent.el, 'padding', '0px 16px');
    }
  }

  clickMarkPaid(event) {
    this.alertController
      .create({
        header: 'Mark as Paid',
        message:
          'Are you sure to mark this cash order #' +
          this.order._id.substring(this.order._id.length - 5) +
          ' as "paid"?',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          },
          {
            text: 'Yes',
            handler: () => {
              this.startDeleteTimer();
            },
          },
        ],
      })
      .then((alertElement) => {
        alertElement.present();
      });
    event.stopPropagation();
  }

  startDeleteTimer = () => {
    this.startedDeleteTimer = true;
    this.timeleft = 10;
    this.deleteTimer = setInterval(() => {
      if (this.timeleft <= 0) {
        this.startedDeleteTimer = false;
        this.markCashOrderPaidCB(this.order);
        clearInterval(this.deleteTimer);
      }
      this.timeleft -= 1;
    }, 1000);
  };

  undoDelete = (event) => {
    this.startedDeleteTimer = false;
    clearInterval(this.deleteTimer);

    event.stopPropagation();
  };

  get orderNumber() {
    return '#' + this.order._id.substring(this.order._id.length - 5);
  }
}
