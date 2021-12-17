import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController, PickerController, PickerOptions, ToastController } from '@ionic/angular';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { ComplaintCategoryEnum } from 'src/app/models/enums/complaint-category-enum';
import { OrderTypeEnum } from 'src/app/models/enums/order-type-enum.enum';
import { ReportTypeEnum } from 'src/app/models/enums/report-type-enum';
import { Order } from 'src/app/models/order';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { ReportService } from 'src/app/services/report.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-create-report-modal',
  templateUrl: './create-report-modal.component.html',
  styleUrls: ['./create-report-modal.component.scss'],
})
export class CreateReportModalComponent implements OnInit {

  @Input() order: Order;
  @Input() accountType: AccountTypeEnum;
  @Input() numberOfHoursAfterOrder: number;

  user: User;
  outlet: Outlet;

  allComplaintCategories = [];
  selectedComplaintCategory: ComplaintCategoryEnum;

  reportForm: FormGroup;
  formValid: boolean;

  imagePath: any;
  file: any;
  imgURL: any;
  previewPic: boolean;

  constructor(
    private modalController: ModalController,
    private pickerController: PickerController,
    private alertController: AlertController,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private sessionService: SessionService,
  ) { }

  ngOnInit() {
    this.initCategories();
    this.formValid = true;
    this.reportForm = this.formBuilder.group({
      category: ['', [Validators.required]],
      description: ['', [Validators.required]],
    })
    if (this.accountType === AccountTypeEnum.CUSTOMER) {
      this.user = this.sessionService.getCurrentUser();
    } else {
      this.outlet = this.sessionService.getCurrentOutlet();
    }
  }

  getTotalOrderItems(): number {
    const foodBundleItems = this.order.foodBundleOrderItems ? this.order.foodBundleOrderItems.length : 0;
    const indiOrderItems = this.order.individualOrderItems ? this.order.individualOrderItems.length : 0;
    return foodBundleItems + indiOrderItems;
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async showPicker() {
    let options: PickerOptions = {
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: (value) => {
            this.reportForm.get('category').setValue(value.category.value);
          }
        }
      ],
      columns: [{
        name: 'category',
        options: this.allComplaintCategories,
        selectedIndex: this.retrieveIndex(),
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present();

    //just to fix some issues with the picker
    picker.onDidDismiss().then(async data => {
      let category = await picker.getColumn('category');
      category.options.forEach(element => {
        delete element.selected;
        delete element.duration;
        delete element.transform;
      });
    });
  }

  preview(files) {
    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return this.alertController.create({
        cssClass: '',
        header: 'Only images are supported!',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          }
        ]
      }).then(x => x.present());
    }

    const reader = new FileReader();
    this.imagePath = files;
    this.file = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
    this.previewPic = true;
  }

  removeImage() {
    this.imgURL = undefined;
    this.imagePath = undefined;
    this.file = undefined;
  }

  checkFormValid() {
    this.formValid = true;
    const controls = this.reportForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
    if (!this.imgURL) {
      this.formValid = false;
      return;
    }
  }

  cancelSubmitReport() {
    if (this.category.value ||
      this.description.value ||
      this.imgURL) {
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

  submitReport() {
    this.checkFormValid();
    if (this.formValid) {
      const formData = new FormData();
      formData.append('reportType', ReportTypeEnum.COMPLAINT);
      formData.append('complaintCategory', this.category.value);
      formData.append('reportDescription', this.description.value);
      if (this.file) {
        formData.append('file', this.file);
      }
      if (this.order) {
        formData.append('order', JSON.stringify(this.order));
      }
      if (this.user) {
        formData.append('user', JSON.stringify(this.user));
      }
      if (this.outlet) {
        formData.append('outlet', JSON.stringify(this.outlet));
      }

      this.reportService.createNewComplaint(formData).subscribe(submittedReport => {
        const id = submittedReport._id.substring(submittedReport._id.length - 5);
        this.presentToast(`Report has been created (Report #${id})`)
        this.closeModal();
      });
    }
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  get category() {
    return this.reportForm.get('category');
  }

  get description() {
    return this.reportForm.get('description');
  }

  private retrieveIndex() {
    let result = 0;
    this.allComplaintCategories.forEach((x, id) => {
      if (x.value === this.category.value) {
        result = id;
      }
    });
    return result;
  }

  private initCategories() {
    const tempArray = [];
    if (this.order && this.accountType === 'CUSTOMER' && this.numberOfHoursAfterOrder < 2) {
      if (this.order.orderType === OrderTypeEnum.TAKE_AWAY) {
        tempArray.push(
          ComplaintCategoryEnum.POOR_ARRIVED_FOOD_CONDITION,
          ComplaintCategoryEnum.INCORRECT_FOOD_PREPARATION,
          ComplaintCategoryEnum.MISSING_ORDER_ITEM,
          ComplaintCategoryEnum.WRONG_ORDER,
          ComplaintCategoryEnum.MISSING_ORDER,
        );
      } else if (this.order.orderType === OrderTypeEnum.DELIVERY) {
        tempArray.push(
          ComplaintCategoryEnum.POOR_ARRIVED_FOOD_CONDITION,
          ComplaintCategoryEnum.INCORRECT_FOOD_PREPARATION,
          ComplaintCategoryEnum.MISSING_ORDER_ITEM,
          ComplaintCategoryEnum.WRONG_ORDER,
          ComplaintCategoryEnum.MISSING_ORDER,
          ComplaintCategoryEnum.SAFETY,
          ComplaintCategoryEnum.LONG_DELIVERY,
          ComplaintCategoryEnum.MISSING_DELIVERY,
          ComplaintCategoryEnum.INCORRECT_OUTLET_INFO,
          ComplaintCategoryEnum.POOR_SERVICE
        );
      }
    }

    tempArray.push(
      ComplaintCategoryEnum.INCORRECT_PAYMENT,
      ComplaintCategoryEnum.INCORRECT_CASHBACK,
      ComplaintCategoryEnum.OTHERS
    );

    tempArray.forEach(x => {
      this.allComplaintCategories.push({
        text: x.toString().replaceAll('_', ' '),
        value: x
      });
    });
  }

}
