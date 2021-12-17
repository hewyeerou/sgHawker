import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Customization } from 'src/app/models/submodels/customization';
import { CustomizationOption } from 'src/app/models/submodels/customizationOption';

@Component({
  selector: 'app-edit-customization',
  templateUrl: './edit-customization.page.html',
  styleUrls: ['./edit-customization.page.scss'],
})
export class EditCustomizationPage implements OnInit {

  @Input() customization: Customization;

  isSubmitted: boolean;
  formValid: boolean;

  constructor(public modalController: ModalController, public alertController: AlertController) {

    this.isSubmitted = false;
  }

  ngOnInit() {
  }

  addOptions() {
    this.customization.customizationOptions.push(new CustomizationOption());
  }

  async removeOption(i) {
    if(this.customization.customizationOptions.length > 1) {
      this.customization.customizationOptions.splice(i, 1);
    } else {
      const alertOption = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Unable to remove',
        message: 'You need to have at least one option.',
        buttons: ['OK']
      });
      await alertOption.present();
    }
  }

  dismissModal() {
    if(this.isSubmitted && this.formValid) {
      this.modalController.dismiss(this.customization);
    } else {
      this.modalController.dismiss(undefined);
    }
  }

  existEmptyOption() {
    for(const k of this.customization.customizationOptions) {
      if(k.optionName === undefined || k.optionName === '') {
        return true;
      }
      if(k.optionCharge === undefined || k.optionCharge === null) {
        return true;
      }
    }
    return false;
  }

  checkFormValid() {
    if(this.customization.customizationName === '') {
      this.formValid = false;
      return;
    }

    if(this.existEmptyOption()) {
      this.formValid = false;
      return;
    }

    this.formValid = true;
  }

  async edit() {
    this.isSubmitted = true;
    this.checkFormValid();
    if(this.formValid) {
      this.dismissModal();
    } else {
      const alertInvalid = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Unable to submit',
        message: 'Please complete the form and ensure that prices are numeric.',
        buttons: ['OK']
      });
      await alertInvalid.present();
    }
  }

}
