import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { OutletService } from 'src/app/services/outlet.service';

@Component({
  selector: 'app-hawker-subscription',
  templateUrl: './hawker-subscription.page.html',
  styleUrls: ['./hawker-subscription.page.scss'],
})
export class HawkerSubscriptionPage implements OnInit {

  dtOptions: any = {};
  outlets: Outlet[];
  hawkerAccounts: User[];

  constructor(
    private outletService: OutletService,
    private router: Router
  ) {
    this.outlets = [];
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: [],
      paging: false,
    };

    this.outletService.findAllActiveOutlets().subscribe(outlets => {
      this.outlets = outlets.filter(outlet => outlet.isMaster === true);
    });
  }

  presentSubscriptionDetailsModal(outlet){
    this.router.navigate(['/financeManagement/hawkerSubscriptions/viewHawkerSubscriptionDetails/' + outlet._id])
  }

}
