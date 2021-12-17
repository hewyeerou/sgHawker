import Promise from 'bluebird';
import QRCode from 'qrcode';

export default {
  getQrCode(str) {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(str, (err, url) => {
        if (err) {
          return reject(err);
        }
        resolve(url);
      });
    });
  }
};
