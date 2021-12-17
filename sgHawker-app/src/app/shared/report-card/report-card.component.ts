import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ReportStatusEnum } from 'src/app/models/enums/report-status-enum';
import { Outlet } from 'src/app/models/outlet';
import { Report } from 'src/app/models/report';
import { User } from 'src/app/models/user';
import { ReportService } from 'src/app/services/report.service';
import { ViewReportDetailsModalComponent } from '../view-report-details-modal/view-report-details-modal.component';

@Component({
  selector: 'app-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.scss'],
})
export class ReportCardComponent implements OnInit {

  @Input() report: Report;
  @Input() user: User;
  @Input() outlet: Outlet;

  @Output() removeReportEvent = new EventEmitter<Report>();

  allReports: Report[];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private reportService: ReportService,

  ) { }

  ngOnInit() { }

  viewReportDetails() {
    this.modalController.create({
      component: ViewReportDetailsModalComponent,
      componentProps: {
        report: this.report,
        user: this.user,
        outlet: this.outlet,
      }
    }).then(x => x.present());
  }

  deleteReport() {
    if (this.report.reportStatus === ReportStatusEnum.NEW) {
      this.alertController.create({
        message: 'Are you sure you want to delete this report?',
        buttons: [
          {
            text: 'Confirm',
            handler: () => {
              this.reportService.deleteReportById(this.report._id).subscribe(res => {
                this.removeReportEvent.emit(this.report);
                this.toastController.create({
                  message: `Report #${this.report._id.substring(this.report._id.length - 5)} successfully deleted.`,
                  duration: 2000,
                }).then(x => x.present());
                // this.router.navigate(['/customer/profile/view-reports']);
                // this.closeModal();
              })
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ]
      }).then(x => x.present());
    }
  }

  removeReportFromList(event) {
    this.removeReportEvent.emit(this.report);
  }
}
