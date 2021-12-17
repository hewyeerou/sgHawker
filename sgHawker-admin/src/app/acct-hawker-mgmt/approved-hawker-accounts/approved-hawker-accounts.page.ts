import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HawkerAccountManagementService } from 'src/app/services/hawker-account-management.service';


@Component({
  selector: 'app-approved-hawker-accounts',
  templateUrl: './approved-hawker-accounts.page.html',
  styleUrls: ['./approved-hawker-accounts.page.scss'],
})
export class ApprovedHawkerAccountsPage implements OnInit {
  dtOptions: any = {};
  approvedHawkers: any[] = [];

  constructor(
    private hawkerAccountManagementService: HawkerAccountManagementService,
    private router: Router
  ) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: [
        'colvis',
        'print',
        'pdf'
      ]
    };
  }

  ionViewWillEnter(){
    this.hawkerAccountManagementService.findAllApprovedHawkerAccounts().subscribe(approvedHawkerAccounts => {
      this.approvedHawkers = approvedHawkerAccounts;
    });
  }

  goToDetailsPage(hawkerId) {
    this.router.navigateByUrl('/hawkerAccountManagement/viewHawkerAccountDetails/' + hawkerId);
  }

}
