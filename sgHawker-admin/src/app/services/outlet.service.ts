import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Outlet } from '../models/outlet';

const httpOptions = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class OutletService {
  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  createOutlet(outlet: any | undefined, id: string | undefined): Observable<any> {
    return this.httpClient
      .post<any>(
        this.baseUrl + '/admin/hawkerAccountManagement/createOutlet/' + id,
        outlet
      )
      .pipe(catchError(this.handleError));
  }

  updateOutletDetails(outlet: any | undefined): Observable<any> {
    return this.httpClient
      .put<any>(
        this.baseUrl + '/admin/hawkerAccountManagement/updateOutlet/' + outlet._id,
        outlet
      )
      .pipe(catchError(this.handleError));
  }

  deleteOutlet(outletId: string): Observable<Outlet> {
    return this.httpClient.get<Outlet>(
      this.baseUrl + '/admin/hawkerAccountManagement/deleteOutlet/' + outletId
    )
      .pipe(catchError(this.handleError));
  };

  findAllActiveOutlets(): Observable<Outlet[]> {
    return this.httpClient.get<Outlet[]>(
      this.baseUrl + '/customer/findAllOutlets'
    )
      .pipe(catchError(this.handleError));
  }

  findOutletByOutletId(outletId: string): Observable<Outlet> {
    return this.httpClient.get<Outlet>(
      this.baseUrl + '/admin/financeManagement/findOutletById/' + outletId
    )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.message);
  }
}
