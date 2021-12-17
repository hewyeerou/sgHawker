import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../models/user';
import { Address } from '../../../models/submodels/address';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-user-address',
  templateUrl: './user-address.page.html',
  styleUrls: ['./user-address.page.scss'],
})
export class UserAddressPage implements OnInit {

  user: User;
  myAddresses: Address[];
  baseUrl = '/api';

  constructor(private router: Router, public sessionService: SessionService, private httpClient: HttpClient) {}


  initData() {
    this.user = this.sessionService.getCurrentUser();
    this.myAddresses = this.user.addresses;
    // this.myAddresses = [
    //   {
    //     _id: 1,
    //     addressDetails: 'Blk 123 Cake Avenue, #11-123',
    //     postalCode: 123456,
    //     isDefault: true,
    //   },
    //   {
    //     _id: 2,
    //     addressDetails: 'Blk 234 Butter Avenue, #12-234',
    //     postalCode: 654321,
    //     isDefault: false,
    //   },
    // ];
  }

  ngOnInit() {
    this.initData();
  }

  ionViewWillEnter() {
    this.initData();
  }

  addNewAddress(){
    this.router.navigate(['customer/profile/user-address/create-address']);
  }

  directToSpecificAddress(addressId){
    this.router.navigate(['/customer/profile/user-address/address-details',addressId]);
  }

}
