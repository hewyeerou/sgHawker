import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-cuisine-type-modal',
  templateUrl: './add-cuisine-type-modal.page.html',
  styleUrls: ['./add-cuisine-type-modal.page.scss'],
})
export class AddCuisineTypeModalPage implements OnInit {

  cuisineType: string;

  constructor(
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalCtrl.dismiss({
      cuisineType: this.cuisineType
    });
  }

  addToList() {
    this.dismiss();
  }

}
