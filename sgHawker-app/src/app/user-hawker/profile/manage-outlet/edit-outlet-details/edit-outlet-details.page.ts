import { Component, OnInit, ɵConsole } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OutletService } from '../../../../services/outlet.service';
import { Outlet } from '../../../../models/outlet';
import { NgForm } from '@angular/forms';
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { AddCuisineTypeModalPage } from './add-cuisine-type-modal/add-cuisine-type-modal.page';

@Component({
  selector: 'app-edit-outlet-details',
  templateUrl: './edit-outlet-details.page.html',
  styleUrls: ['./edit-outlet-details.page.scss'],
})
export class EditOutletDetailsPage implements OnInit {

  id: string;
  // eslint-disable-next-line @typescript-eslint/member-delimiter-style
  outletSelected: any;
  sameDayStartTime: Date;
  sameDayEndTime: Date;
  errorMsg: string;
  hawkerId: string;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private outletService: OutletService,
    public toastController: ToastController,
    public alertController: AlertController,
    public modalCtrl: ModalController,
  ) {
    this.outletSelected = new Outlet();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.hawkerId = params.hawkerId;
    });
    this.id = this.route.snapshot.paramMap.get('id');
    this.outletService
      .getOutletDetails(this.id)
      .subscribe(
        res => {
          this.outletSelected = res;
        }
      );
  }

  updateOutletDetails(editOutletForm: NgForm) {
    if (editOutletForm.valid) {
      // if business hours option is 'same day for all days'
      if (this.outletSelected.businessHrsOption === 'same') {
        for (let i = 0; i < this.outletSelected.outletOperatingHrs.length; i++) {
          if (i === 0) {
            this.sameDayStartTime = this.outletSelected.outletOperatingHrs[i].startTime;
            this.sameDayEndTime = this.outletSelected.outletOperatingHrs[i].endTime;
          }
        }
        const resultForEveryday = this.outletSelected.outletOperatingHrs.map(ooh => (
          { ...ooh, startTime: this.sameDayStartTime, endTime: this.sameDayEndTime }
        ));

        this.outletSelected.outletOperatingHrs = resultForEveryday;
      }

      this.outletService.updateOutletDetails(this.outletSelected).subscribe(
        res => {
          this.presentToast('Outlet details is updated.');
          this.router.navigate(['/hawker/profile/manage-outlet/' + this.hawkerId]);
          this.errorMsg = '';
        },
        error => {
          this.errorMsg = error;
          // this.presentToast('Something went wrong: ' + error);
        }
      );
    }
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  goBackToViewOutlet() {
    this.router.navigate(['/hawker/profile/manage-outlet/' + this.hawkerId]);
  }

  async addCuisineTypeModal() {
    const modal = await this.modalCtrl.create({
      component: AddCuisineTypeModalPage,
      cssClass: 'add-cuisine-modal-css',
      componentProps: {
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    modal.onDidDismiss()
      .then((data) => {
        const modalData = data.data;
        if (modalData !== undefined && modalData.cuisineType !== undefined) {
          this.outletSelected.cuisineType.push(data.data.cuisineType);
        }
      });
    return await modal.present();
  }

  removeCuisineType(i) {
    this.outletSelected.cuisineType.splice(i, 1);
  }
}
