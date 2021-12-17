import { WebsocketService } from './../../services/websocket.service';
import { OrderService } from './../../services/order.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { CreateReportModalComponent } from 'src/app/shared/create-report-modal/create-report-modal.component';
import { CreateFeedbackModalComponent } from 'src/app/shared/create-feedback-modal/create-feedback-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: User;
  baseUrl = '/api';

  constructor(
    private router: Router,
    public sessionService: SessionService,
    public userService: UserService,
    public alertController: AlertController,
    private orderService: OrderService,
    private websocket: WebsocketService,
    private modalController: ModalController,
  ) { }

  initData() {
    this.user = this.sessionService.getCurrentUser();
  }

  ngOnInit() {
    this.initData();
  }

  ionViewWillEnter() {
    this.initData();
  }

  openReportModal() {
    this.modalController.create({
      component: CreateReportModalComponent,
      componentProps: {
        accountType: AccountTypeEnum.CUSTOMER,
      },
      backdropDismiss: false,
    }).then(x => x.present());
  }

  openFeedbackModal() {
    this.modalController.create({
      component: CreateFeedbackModalComponent,
      componentProps: {
        accountType: AccountTypeEnum.CUSTOMER,
        user: this.user,
      },
      backdropDismiss: false,
    }).then(x => x.present());
  }

  logout() {
    this.orderService.findOngoingOrdersByCustomerId(this.user._id).subscribe(
      ongoingOrders => {
        let numOrders = '';
        if (ongoingOrders?.length > 0) {
          numOrders += ongoingOrders.length;
        }
        this.alertController.create({
          cssClass: '',
          header: 'Are you sure you want to log out?',
          message: 'You will not be able to receive updates on your ' + numOrders + ' ongoing orders!',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
              }
            },
            {
              text: 'Log Out',
              handler: () => {
                this.userService.customerLogout(this.user).subscribe(
                  logOutCustomer => {
                    this.sessionService.setIsLogin(false);
                    this.sessionService.setCurrentUser(null);
                    this.router.navigate(['/account']);
                  }
                );
              }
            }
          ]
        }).then(alertLogOut => {
          alertLogOut.present();
        });
      }
    );
  }
}
