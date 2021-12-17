import { LeaderboardService } from 'src/app/services/leaderboard.service';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LeaderboardInfoModalComponent } from 'src/app/shared/leaderboard-info-modal/leaderboard-info-modal.component';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {

  constructor(public leaderboardService: LeaderboardService,
    public modalController: ModalController) { }

  ngOnInit() {
  }

  async showInformation() {
    const modal = await this.modalController.create({
      component: LeaderboardInfoModalComponent,
      cssClass: 'info-modal-class'
    });
    return await modal.present();
  }

}
