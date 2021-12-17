import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';

@Component({
  selector: 'app-view-outlet-qr',
  templateUrl: './view-outlet-qr.page.html',
  styleUrls: ['./view-outlet-qr.page.scss'],
})
export class ViewOutletQrPage implements OnInit {

  @Input() item: any;

  elementType: NgxQrcodeElementTypes.URL;
  correctionLevel: NgxQrcodeErrorCorrectionLevels.HIGH;
  id: string;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.id = this.item;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  downloadQRCode() {
    const fileNameToDownload = 'image_qrcode' + this.id;
    const base64Img = document.getElementsByClassName('hawker-outlet-qr')[0].children[0]['src'];
    fetch(base64Img)
      .then(res => res.blob())
      .then((blob) => {
        // Internet explorer
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, fileNameToDownload);
        } else { // Chrome
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileNameToDownload;
          link.click();
        }
      });
  }

  goBackToManageOutlet() {
    this.dismiss();
  }

}
