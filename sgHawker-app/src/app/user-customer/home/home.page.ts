/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { OutletService } from '../../services/outlet.service';
import { UserService } from 'src/app/services/user.service';
import { SessionService } from 'src/app/services/session.service';
import * as _ from "lodash";
import { HawkerCenter } from '../../models/submodels/hawkerCenter';
import { PopoverController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { AlertController } from '@ionic/angular';
import { threadId } from 'worker_threads';
import { PopoverComponentComponent } from 'src/app/shared/popover-component/popover-component.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  allHawkerCentres: HawkerCenter[];
  tempHawkerCentres: HawkerCenter[];
  input: string;
  user: User;

  allCategories: string[];
  selectedCategories: string[];

  slideOptions: any;

  constructor(
    private router: Router,
    private outletService: OutletService,
    private userService: UserService,
    private sessionService: SessionService,
    private popOverController: PopoverController,
    public alertController: AlertController,
    public popoverController: PopoverController,
  ) { }

  ionViewWillEnter() {
    this.ngOnInit();
  }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();

    this.outletService.findAllHawkerCenters().subscribe(hawkerCenterArray => {
      const tempSet = new Set();
      this.allHawkerCentres = hawkerCenterArray;
      this.tempHawkerCentres = hawkerCenterArray;
      _.forEach(hawkerCenterArray, hawkerCenter => {
        _.forEach(hawkerCenter.cuisineTypes, type => {
          tempSet.add(type);
        });
      });
      this.allCategories = <string[]>Array.from(tempSet);
    });
  }


  filterCategories() {
    if (!this.selectedCategories || this.selectedCategories.length <= 0) {
      this.allHawkerCentres = this.tempHawkerCentres;
      return;
    }
    this.allHawkerCentres = this.filterCategory(this.tempHawkerCentres);
  }

  private filterCategory(source: HawkerCenter[]) {
    if (!this.selectedCategories || this.selectedCategories.length === 0) {
      return source;
    }
    return _.filter(source, centre => {
      let hasCategory = false;
      _.forEach(centre.cuisineTypes, type => {
        if (this.selectedCategories.includes(type)) {
          hasCategory = true;
        }
      });
      return hasCategory;
    });
  }

  searchData(event) {
    this.allHawkerCentres = this.filterCategory(this.tempHawkerCentres);

    this.input = event.target.value.toLowerCase();
    this.allHawkerCentres = _.filter(this.allHawkerCentres, centre => centre.hawkerCenterName.toLowerCase().includes(this.input));
  }

  isFavourited(hawkerCentreName) {
    for (const id in this.user?.favouriteHawkerCentres) {
      if (hawkerCentreName === this.user.favouriteHawkerCentres[id]) {
        return true;
      }
    }
  }


  navigateHawkerCentreDetails(hawkerCentreName) {
    this.router.navigate(['/customer/home', hawkerCentreName]);
  }

  async presentPopover(ev) {
    const popoverItemProps = [{
      label: 'View Favourites',
      eventHandler: () => {
        this.router.navigate(['/customer/home/favourites']);
      },
      type: 'FAVOURITE'
    }];

    this.popoverController
      .create({
        component: PopoverComponentComponent,
        cssClass: 'popover-class',
        componentProps: { items: popoverItemProps },
        translucent: true,
        event: ev,
      })
      .then((popOverElement) => {
        popOverElement.present();
      });
  }

  addFavouriteHawkerCentre(hawkerCentreName) {
    if (!this.isFavourited(hawkerCentreName)) {
      this.userService
        .addUserFavouriteCentre(this.user._id, hawkerCentreName)
        .subscribe(
          updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.presentAlert('Success', 'Added to favourites!');
            this.ngOnInit();
          },
          error => {
            this.presentAlert('Hmm..something went wrong', 'Cannot add to favourites');
          }
        );
    } else {
      this.presentAlert('Error', 'Already Added to Favourites');
    }
  }
  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }
}
