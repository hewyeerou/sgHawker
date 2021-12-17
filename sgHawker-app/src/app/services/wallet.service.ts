import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Wallet } from '../models/wallet';
import { Card } from '../models/submodels/card';
import { BankAccount } from '../models/submodels/bankAccount';

const httpOptions = {
  headers: new HttpHeaders({ 'content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  // SHARED
  findWalletByOwnerId(userId: string): Observable<Wallet> {
    return this.httpClient.get<Wallet>(
      this.baseUrl + '/wallet/findWalletByOwnerId/' + userId
    ).pipe(catchError(this.handleError));
  }

  // CUSTOMER
  createWalletForCustomer(userId: string): Observable<Wallet> {
    return this.httpClient.get<Wallet>(
      this.baseUrl + '/customer/wallet/createNewWalletForCustomer/' + userId
    ).pipe(catchError(this.handleError));
  }

  topUpFromCreditCardToWallet(walletId: string, topUpAmount: number, creditCardInvolved: any): Observable<Wallet> {
    const topUpDetails = {
      topUpAmount,
      creditCardInvolved
    };

    return this.httpClient.post<Wallet>(
      this.baseUrl + '/customer/wallet/topUpFromCreditCardToWallet/' + walletId,
      topUpDetails
    ).pipe(catchError(this.handleError));
  }

  // OUTLET
  createWalletForOutlet(outletId: string, withdrawalFrequency: number): Observable<Wallet> {
    const details = {
      withdrawalFrequency
    };
    return this.httpClient.post<Wallet>(
      this.baseUrl + '/hawker/wallet/createNewWalletForOutlet/' + outletId,
      details
    ).pipe(catchError(this.handleError));
  }

  debitFromWalletToBankAccount(walletId: string, bankAccountInvolved: BankAccount): Observable<Wallet> {
    const details = {
      bankAccountInvolved,
      setNewNextWithdrawalDate: null
    };

    return this.httpClient.post<Wallet>(
      this.baseUrl + '/hawker/wallet/debitFromWalletToBankAccount/' + walletId,
      details
    ).pipe(catchError(this.handleError));
  }

  updateWithdrawalFrequency(walletId: string, withdrawalFrequency: number): Observable<Wallet> {
    const details = {
      withdrawalFrequency
    };
    return this.httpClient.post<Wallet>(
      this.baseUrl + '/hawker/wallet/updateWithdrawalFrequency/' + walletId,
      details
    ).pipe(catchError(this.handleError));
  }


  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }
}
