import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BankAccount } from 'src/app/models/submodels/bankAccount';
import { Card } from 'src/app/models/submodels/card';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-linked-payment-methods',
  templateUrl: './linked-payment-methods.page.html',
  styleUrls: ['./linked-payment-methods.page.scss'],
})
export class LinkedPaymentMethodsPage implements OnInit {

  user: User;
  myCards: Card[];
  myBankAccounts: BankAccount[];

  constructor(
    public sessionService: SessionService,
    private router: Router,
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

  addNewCard(){
    this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods/create-card']);
  }

  directToSpecificCard(cardId){
    this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods/card-details',cardId]);
  }

  addNewBankAccount(){
    this.router.navigate(['hawker/profile/digital-wallet/linked-payment-methods/create-bank-account']);
  }

  directToSpecificBankAccount(bankAccountId){
    this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods/bank-account-details',bankAccountId]);
  }
}
