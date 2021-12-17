import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { User } from '../models/user';
import { catchError } from 'rxjs/operators';
import { Card } from '../models/submodels/card';
import { SubscriptionFees } from '../models/submodels/subscriptionFees';
import { AccountTierEnum } from '../models/enums/account-tier-enum.enum';
import { AccountStatusEnum } from '../models/enums/account-status-enum.enum';
import { Outlet } from '../models/outlet';

const httpOptions = {
  headers: new HttpHeaders({ 'content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  createCustomer(user: User): Observable<User> {
    return this.httpClient
      .post<User>(this.baseUrl + '/customer/createNewCustomer', user)
      .pipe(catchError(this.handleError));
  }

  customerLogin(
    email: string | undefined,
    password: string | undefined
  ): Observable<User> {
    const credentials = {
      email,
      password,
    };
    return this.httpClient
      .post<User>(this.baseUrl + '/customer/customerLogin', credentials)
      .pipe(catchError(this.handleError));
  }

  createHawker(newHawker: User): Observable<User> {
    return this.httpClient.post<User>(this.baseUrl + '/hawker/registerHawker', newHawker).pipe
      (
        catchError(this.handleError)
      );
  }

  hawkerLogin(
    email: string | undefined,
    password: string | undefined
  ): Observable<User> {
    const credentials = {
      email,
      password,
    };
    return this.httpClient
      .post<User>(this.baseUrl + '/hawker/hawkerLogin', credentials)
      .pipe(catchError(this.handleError));
  }

  uploadDocuments(file: FormData, email: string): Observable<FormData> {
    return this.httpClient.post<FormData>(this.baseUrl + '/hawker/uploadHawkerDocuments/' + email, file).pipe
      (
        catchError(this.handleError)
      );
  }

  updateUserDetails(_id: string | undefined, user: User | undefined): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/user/profile/updateProfile/' + _id, user).pipe(catchError(this.handleError));
  }

  addUserCard(_id: string | undefined, card: Card | undefined): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/customer/profile/addCard/' + _id, card)
    .pipe(catchError(this.handleError));
  }

  editUserCard(_id: string | undefined, card: Card | undefined): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/customer/profile/editCard/' + _id, card)
    .pipe(catchError(this.handleError));
  }

  removeUserCard(_id: string | undefined, card: Card | undefined): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/customer/profile/removeCard/' + _id, card)
    .pipe(catchError(this.handleError));
  }

  addUserFavouriteCentre(_id: string | undefined, outletName: string | undefined): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/customer/profile/addFavouriteCentre/' + _id, outletName)
      .pipe(catchError(this.handleError));
  }
  removeUserFavouriteCentre(_id: string | undefined, outletName: string | undefined): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/customer/profile/removeFavouriteCentre/' + _id, outletName)
      .pipe(catchError(this.handleError));
  }

  addUserFavouriteStore(_id: string | undefined, outletId: string | undefined): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/customer/profile/addFavouriteStore/' + _id, outletId)
      .pipe(catchError(this.handleError));
  }

  removeUserFavouriteStore(_id: string | undefined, outletId: string | undefined): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/customer/profile/removeFavouriteStore/' + _id, outletId)
      .pipe(catchError(this.handleError));
  }

  uploadUserProfilePicture(email: string | undefined, file: Blob): Observable<User> {
    const formData = new FormData();
    // Store form name as "file" with file data
    formData.append('file', file);
    return this.httpClient.post<User>(this.baseUrl + '/user/uploadProfileImage/' + email, formData).pipe(catchError(this.handleError));
  }

  hawkerLogout(hawker: User): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/hawker/hawkerLogout/' + hawker._id, hawker).pipe
      (
        catchError(this.handleError)
      );
  }

  customerLogout(customer: User): Observable<User> {
    return this.httpClient.put<User>(this.baseUrl + '/customer/customerLogout/' + customer._id, customer).pipe
      (
        catchError(this.handleError)
      );
  }

  findSubscriptionFees(): Observable<any> {
    return this.httpClient.get<SubscriptionFees>(
      this.baseUrl + '/hawker/findSubscriptionFees'
    ).pipe(catchError(this.handleError));
  }

  upgradeAccount(hawkerId: string, accountTier: AccountTierEnum, masterOutlet: Outlet): Observable<any> {
    const details = {
      accountTier,
      masterOutlet
    };
    return this.httpClient.post<any>(
      this.baseUrl + '/hawker/updateAccountTier/' + hawkerId, details
    ).pipe(catchError(this.handleError));
  }

  uploadDocumentsForAccountUpgrade(file: FormData, email: string): Observable<FormData> {
    return this.httpClient.post<FormData>(this.baseUrl + '/hawker/uploadHawkerDocumentForDeluxe/' + email, file).pipe
      (
        catchError(this.handleError)
      );
  }

  downloadDocumentsForAccountUpgrade(email: string): Observable<any> {
    const options: any = {
      headers: new HttpHeaders({ 'Content-Type': 'application/octet-stream' }),
      responseType: 'arraybuffer'
    };
    return this.httpClient.get<any>(this.baseUrl + '/hawker/downloadAccountUpgradeDocumentsAsZip/' + email, options).pipe
      (
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error);
  }
}
