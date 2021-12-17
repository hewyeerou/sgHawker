import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Customization } from 'src/app/models/submodels/customization';
import { CustomizationOption } from 'src/app/models/submodels/customizationOption';

@Component({
  selector: 'app-customization',
  templateUrl: './customization.page.html',
  styleUrls: ['./customization.page.scss'],
})
export class CustomizationPage implements OnInit {

  customization: Customization;
  tempName: string;
  tempMandatory: string;
  options: CustomizationOption[];
  mandatory: string;

  formValid: boolean;
  isSubmitted: boolean;

  constructor(public modalController: ModalController, public alertController: AlertController) {

  }

  ngOnInit() {
    this.options = [];
    this.options.push(new CustomizationOption());
    this.customization = new Customization();
  }

  checkFormValid() {

    if(this.tempName === '') {
      this.formValid = false;
      return;
    }

    if(this.tempMandatory === '') {
      this.formValid = false;
      return;
    }

    if(this.existEmptyOption()) {
      this.formValid = false;
      return;
    }

    this.formValid = true;
  }

  existEmptyOption() {
    for(const k of this.options) {
      if(k.optionName === undefined || k.optionName === '') {
        return true;
      }
      if(k.optionCharge === undefined || k.optionCharge === null) {
        return true;
      }
    }
    return false;
  }

  dismissModal() {
    if(this.isSubmitted && this.formValid) {
      this.modalController.dismiss(this.customization);
    } else {
      this.modalController.dismiss(undefined);
    }
  }

  async submit() {
    this.isSubmitted = true;
    this.checkFormValid();
    if(this.formValid) {
      this.customization.customizationName = this.tempName;
      this.customization.customizationOptions = this.options;
      this.dismissModal();
    } else {
      const alertInvalid = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Unable to submit',
        message: 'Please complete the form and ensure that prices are indicated as numbers.',
        buttons: ['OK']
      });
      await alertInvalid.present();
    }
  }

  checkMandatory() {
    if(this.tempMandatory === 'yes') {
      this.customization.mandatory = true;
    } else {
      this.customization.mandatory = false;
    }
    this.checkFormValid();
  }

  addOptions() {
    this.options.push(new CustomizationOption());
  }

  async removeOption(i) {
    if(this.options.length > 1) {
      this.options.splice(i, 1);
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

}
