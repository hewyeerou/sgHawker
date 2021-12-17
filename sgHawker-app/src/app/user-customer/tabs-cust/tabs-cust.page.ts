import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-tabs-cust',
  templateUrl: './tabs-cust.page.html',
  styleUrls: ['./tabs-cust.page.scss'],
})
export class TabsCustPage implements OnInit {

  user: User;

  constructor(
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
  }


}
