import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';


@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
})
export class FilterModalComponent implements OnInit {

  @Input() filter: any;

  dateType = 'one';
  singleDate = moment(Date.now()).format().toString();
  startDate = moment(Date.now()).format().toString();
  endDate = moment(Date.now()).add(1, 'days').format().toString();

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    if (this.filter !== null) {
      this.dateType = this.filter.dateType;
      if (this.dateType === 'one') {
        this.singleDate = this.filter.singleDate;
      } else {
        this.startDate = this.filter.startDate;
        this.endDate = this.filter.endDate;
      }
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  reset() {
    this.modalController.dismiss({
      filter: null
    });
  }

  confirm() {
    this.filter = {
      dateType: this.dateType,
      singleDate: this.singleDate,
      startDate: this.startDate,
      endDate: this.endDate
    };
    this.modalController.dismiss({
      filter: this.filter
    });
  }

  change(ev) {
    this.dateType = ev;
  }

  updateDate(ev, date) {
    if (date === 1) {
      this.singleDate = ev.detail.value;
    } else if (date === 2) {
      this.startDate = ev.detail.value;
    } else {
      this.endDate = ev.detail.value;
    }
  }
}
