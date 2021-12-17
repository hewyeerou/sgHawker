import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user';

const httpOptions = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class HawkerAccountManagementService {
  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  findAllPendingHawkerAccounts(): Observable<User[]> {
    return this.httpClient
      .get<User[]>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/findAllPendingHawkerAccounts'
      )
      .pipe(catchError(this.handleError));
  }

  findAllApprovedHawkerAccounts(): Observable<User[]> {
    return this.httpClient
      .get<User[]>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/findAllApprovedHawkerAccounts'
      )
      .pipe(catchError(this.handleError));
  }

  approveHawker(hawkerId: string | undefined): Observable<User> {
    return this.httpClient
      .put<User>(
        this.baseUrl +
        '/admin/hawkerAccountManagement/approveHawker/' +
        hawkerId,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  rejectHawker(hawkerId: string | undefined, writtenInstruction: string | undefined): Observable<User> {
    const rejMsg = {
      writtenInstruction,
    };

    return this.httpClient
      .put<User>(this.baseUrl + '/admin/hawkerAccountManagement/rejectHawker/' + hawkerId,
        rejMsg
      )
      .pipe(catchError(this.handleError));
  }

  getHawkerAccount(hawkerId: string | undefined): Observable<User> {
    return this.httpClient
      .get<User>(
        this.baseUrl + '/admin/hawkerAccountManagement/findHawkerAccount/' + hawkerId
      )
      .pipe(catchError(this.handleError));
  }

  updateHawkerAccount(hawker: any | undefined): Observable<User> {
    return this.httpClient
      .put<User>(
        this.baseUrl + '/admin/hawkerAccountManagement/updateHawkerAccount/' + hawker._id,
        hawker
      )
      .pipe(catchError(this.handleError));
  }

  downloadHawkerDocumentsAsZip(hawkerEmail: string): Observable<any> {
    const options: any = {
      headers: new HttpHeaders({ 'Content-Type': 'application/octet-stream' }),
      responseType: 'arraybuffer'
    };
    return this.httpClient
      .get<any>(
        this.baseUrl + '/admin/hawkerAccountManagement/downloadHawkerDocumentsAsZip/' + hawkerEmail, options)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.message);
  }
}
