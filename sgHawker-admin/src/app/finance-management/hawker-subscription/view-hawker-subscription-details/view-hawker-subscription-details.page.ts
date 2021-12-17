import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Outlet } from 'src/app/models/outlet';
import { OutletService } from 'src/app/services/outlet.service';

@Component({
  selector: 'app-view-hawker-subscription-details',
  templateUrl: './view-hawker-subscription-details.page.html',
  styleUrls: ['./view-hawker-subscription-details.page.scss'],
})
export class ViewHawkerSubscriptionDetailsPage implements OnInit {

  outlet: Outlet;

  constructor(
    private outletService: OutletService,
    private activatedRoute: ActivatedRoute,
  ) { 
    this.outlet = new Outlet();
  }

  ngOnInit() {
    this.outletService.findOutletByOutletId(this.activatedRoute.snapshot.params.id).subscribe(outlet => {
      this.outlet = outlet;
    });
  }

}
