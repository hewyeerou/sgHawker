import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { ReportTypeEnum } from 'src/app/models/enums/report-type-enum';
import { Outlet } from 'src/app/models/outlet';
import { Report } from 'src/app/models/report';
import { User } from 'src/app/models/user';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-create-feedback-modal',
  templateUrl: './create-feedback-modal.component.html',
  styleUrls: ['./create-feedback-modal.component.scss'],
})
export class CreateFeedbackModalComponent implements OnInit {

  @Input() accountType: AccountTypeEnum;
  @Input() user: User;
  @Input() outlet: Outlet;
  feedback: string;
  formValid = true;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private reportService: ReportService,
  ) { }

  ngOnInit() { }

  cancelSubmitFeedback() {
    if (this.feedback) {
        this.alertController.create({
          message: 'Are you sure you want to cancel? All changes will be lost.',
          buttons: [
            {
              text: 'Confirm',
              handler: () => {
                this.closeModal();
              }
            },
            {
              text: 'Cancel',
              role: 'cancel',
            },
          ]
        }).then(x => x.present());
    } else {
      this.closeModal();
    }
  }

  submitFeedback() {
    if (!this.feedback || this.feedback === '') {
      this.formValid = false;
    } else {
      this.formValid = true;
      const report = new Report();
      report.reportType = ReportTypeEnum.FEEDBACK;
      report.reportDescription = this.feedback;
      if (this.user) {
        report.user = this.user;
      }
      if (this.outlet) {
        report.outlet = this.outlet;
      }
      this.reportService.createNewFeedback(report).subscribe(feedback => {
        this.presentToast();
        this.closeModal();
      });
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Feedback successfully submitted. Thank you for your feedback!',
      duration: 2000,
    });
    toast.present();
  }

  closeModal() {
    this.modalController.dismiss();
  }

}
