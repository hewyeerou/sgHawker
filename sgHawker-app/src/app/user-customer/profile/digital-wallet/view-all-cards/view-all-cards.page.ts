import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BankAccount } from 'src/app/models/submodels/bankAccount';
import { Card } from 'src/app/models/submodels/card';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-view-all-cards',
  templateUrl: './view-all-cards.page.html',
  styleUrls: ['./view-all-cards.page.scss'],
})
export class ViewAllCardsPage implements OnInit {

  user: User;
  myCards: Card[];
  myBankAccounts: BankAccount[];
  baseUrl = '/api';

  constructor(
    private router: Router,
    public sessionService: SessionService
  ) { }

  initData() {
    this.user = this.sessionService.getCurrentUser();
    this.myCards = this.user.cards;
    this.myBankAccounts = this.user.bankAccounts;
  }

  ngOnInit() {
    this.initData();
  }

  ionViewWillEnter() {
    this.initData();
  }

  addNewCard() {
    this.router.navigate(['/customer/profile/digital-wallet/create-card']);
  }

  directToSpecificCard(cardId) {
    this.router.navigate(['/customer/profile/digital-wallet/card-details', cardId]);
  }

  addNewBankAccount() {
    this.router.navigate(['/customer/profile/digital-wallet/create-bank-account']);
  }

  directToSpecificBankAccount(bankAccountId) {
    this.router.navigate(['/customer/profile/digital-wallet/bank-account-details', bankAccountId]);
  }

}
