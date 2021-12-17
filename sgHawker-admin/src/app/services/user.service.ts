import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { User } from '../models/user';
import { catchError } from 'rxjs/operators';

const httpOptions = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class UserService {

  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  login(
    email: string | undefined,
    password: string | undefined
  ): Observable<User> {
    const credentials = {
      email,
      password,
    };
    return this.httpClient.post<User>(this.baseUrl + '/admin/adminLogin', credentials)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    return this.httpClient
      .get<any>(
        this.baseUrl + '/admin/adminLogout'
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.message);
  }
}
