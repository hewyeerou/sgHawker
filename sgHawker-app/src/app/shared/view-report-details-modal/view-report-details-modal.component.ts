import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';
import { Report } from 'src/app/models/report';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-view-report-details-modal',
  templateUrl: './view-report-details-modal.component.html',
  styleUrls: ['./view-report-details-modal.component.scss'],
})
export class ViewReportDetailsModalComponent implements OnInit {

  @Input() report: Report;
  @Input() user: User;
  @Input() outlet: Outlet;

  @Output() deleteReportEvent = new EventEmitter<Report>();

  baseUrl = '/api';

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() { }

  closeModal() {
    this.modalController.dismiss();
  }
}
