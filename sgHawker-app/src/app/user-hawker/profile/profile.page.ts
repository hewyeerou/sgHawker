import { QueueService } from './../../services/queue.service';
import { WebsocketService } from './../../services/websocket.service';
import { OrderService } from './../../services/order.service';
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { NavigationExtras, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { Outlet } from 'src/app/models/outlet';
import { WalletService } from 'src/app/services/wallet.service';
import { CreateReportModalComponent } from 'src/app/shared/create-report-modal/create-report-modal.component';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { CreateFeedbackModalComponent } from 'src/app/shared/create-feedback-modal/create-feedback-modal.component';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  hawker: User;
  outlet: Outlet;
  baseUrl = '/api';


  constructor(
    private router: Router,
    public sessionService: SessionService,
    private userService: UserService,
    private alertController: AlertController,
    private orderService: OrderService,
    private toastController: ToastController,
    private modalController: ModalController,
    private queueService: QueueService,
    public walletService: WalletService,
  ) { }

  ngOnInit() {
    this.hawker = this.sessionService.getCurrentUser();
    this.outlet = this.sessionService.getCurrentOutlet();
  }

  ionViewWillEnter() {
    this.hawker = this.sessionService.getCurrentUser();
  }

  directToAccountTier() {
    this.router.navigate(['/hawker/profile/hawkertier']);
  }

  directToHome() {
    this.router.navigate(['home']);
  }

  manageOutlet() {
    this.router.navigate(['/hawker/profile/manage-outlet/' + this.hawker._id]);
  }

  directToAccountDetails() {
    this.router.navigate(['/hawker/profile/hawker-account-details']);
  }

  directToDigitalWallet() {
    if (this.sessionService.getCurrentOutlet().wallet === null || this.sessionService.getCurrentOutlet().wallet === undefined) {
      this.walletNotFoundAlert();
    } else {
      this.router.navigate(['/hawker/profile/digital-wallet']);
    }
  }

  directToMakeReport() {
    this.modalController.create({
      component: CreateReportModalComponent,
      componentProps: {
        accountType: AccountTypeEnum.HAWKER,
      },
      backdropDismiss: false,
    }).then(x => x.present());
  }

  directToViewAllReports() {
    this.router.navigate(['/hawker/profile/view-reports']);
  }

  directToMakeFeedback() {
    this.modalController.create({
      component: CreateFeedbackModalComponent,
      componentProps: {
        accountType: AccountTypeEnum.HAWKER,
        outlet: this.outlet,
      },
      backdropDismiss: false,
    }).then(x => x.present());
  }

  logout() {
    if (this.queueService.queueIsActive) {
      this.orderService.findAllInProgressOrdersByOutletId(this.outlet._id).subscribe(
        orderArr => {
          if (orderArr?.length > 0) {
            this.alertController.create({
              header: 'You still have ' + orderArr.length + ' pending orders not yet completed!',
              message: 'Are you sure you want to logout? This will cancel all pending orders.',
              buttons: [
                {
                  text: 'Cancel',
                  role: 'cancel'
                },
                {
                  text: 'Confirm',
                  handler: () => {
                    this.orderService.cancelAllInProgressOrdersByOutletId(this.outlet._id).subscribe(
                      success => {
                        this.userService.hawkerLogout(this.hawker).subscribe(
                          logOutHawker => {
                            this.sessionService.setCurrentOutlet(null);
                            this.sessionService.setIsLogin(false);
                            this.sessionService.setCurrentUser(null);
                            this.router.navigate(['/account']);
                          }
                        );
                      },
                      error => {
                        this.toastController.create({
                          header: 'Unable to stop logout due to failure cancelling orders',
                          message: 'Please try again',
                          duration: 3000
                        })
                          .then(x => x.present());
                      }
                    );
                  }
                }
              ]
            })
              .then(x => x.present());
          } else {
            this.userService.hawkerLogout(this.hawker).subscribe(
              logOutHawker => {
                this.sessionService.setCurrentOutlet(null);
                this.sessionService.setIsLogin(false);
                this.sessionService.setCurrentUser(null);
                //this.websocketService.unsubscribeToRoom();
                this.router.navigate(['/account']);
              }
            );
          }
        }
      );
    } else {
      this.alertController.create({
        cssClass: '',
        header: 'Log Out',
        message: 'Are you sure you want to log out?',
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
              this.userService.hawkerLogout(this.hawker).subscribe(
                logOutHawker => {
                  this.sessionService.setCurrentOutlet(null);
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
  }

  walletNotFoundAlert() {
    this.alertController
      .create({
        header:
          'Digital Wallet not found for this outlet',
        message:
          'Would you like to create a digital wallet?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.presentErrorToast('Please create a digital wallet before accessing this page');
            }
          },
          {
            text: 'Confirm',
            handler: () => {
              this.createWalletAlert();
            },
          },
        ],
      })
      .then((x) => x.present());
  }

  createWalletAlert() {
    this.alertController
      .create({
        header: 'Set your withdrawal frequency',
        inputs: [
          {
            name: 'daily',
            type: 'radio',
            label: 'Daily',
            value: '1',
          },
          {
            name: 'weekly',
            type: 'radio',
            label: 'Weekly',
            value: '7',
          },
          {
            name: 'biweekly',
            type: 'radio',
            label: 'Bi-Weekly',
            value: '14',
          },
          {
            name: 'monthly',
            type: 'radio',
            label: 'Monthly',
            value: '30',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.presentErrorToast('Please set a withdrawal frequency to create your digital wallet');
            }
          },
          {
            text: 'Confirm',
            handler: data => {
              if (data) {
                // eslint-disable-next-line no-underscore-dangle
                this.walletService.createWalletForOutlet(this.sessionService.getCurrentOutlet()._id, data)
                  .subscribe(
                    res => {
                      const outletWithWallet = this.sessionService.getCurrentOutlet();
                      outletWithWallet.wallet = res;
                      this.sessionService.setCurrentOutlet(outletWithWallet);
                      this.presentErrorToast('Digital Wallet Created');
                      this.router.navigate(['/hawker/profile/digital-wallet']);
                    },
                    error => {
                      this.presentErrorToast('An error occurred while setting up digital wallet. Please try again.');
                    }
                  );
              } else {
                this.presentErrorToast('Please set a withdrawal frequency to create your digital wallet');
              }
            }
          }
        ]
      })
      .then((x) => x.present());
  }

  async presentErrorToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }
}
