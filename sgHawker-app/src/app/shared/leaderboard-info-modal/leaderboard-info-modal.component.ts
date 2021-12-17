import { SessionService } from 'src/app/services/session.service';
import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-leaderboard-info-modal',
  templateUrl: './leaderboard-info-modal.component.html',
  styleUrls: ['./leaderboard-info-modal.component.scss'],
})
export class LeaderboardInfoModalComponent implements OnInit {

  user: User;
  userType;
  constructor(public modalController: ModalController, private sessionService: SessionService) { }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.userType = this.user.accountType;
  }

  modalDismiss() {
    this.modalController.dismiss();
  }

}
