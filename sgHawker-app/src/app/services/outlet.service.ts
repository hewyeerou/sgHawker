import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Outlet } from '../models/outlet';
import { HawkerCenter } from '../models/submodels/hawkerCenter';
import { HawkerStore } from '../models/submodels/hawkerStore';
import * as moment from 'moment';

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

  retrieveActiveMenuForOutlet(): Observable<Outlet> {
    return this.httpClient
      .get<Outlet>(this.baseUrl + '/customer/findAllOutlets')
      .pipe(catchError(this.handleError));
  }

  getAllHawkerOutlets(): Observable<Outlet[]> {
    return this.httpClient
      .get<Outlet[]>(this.baseUrl + '/customer/findAllOutlets')
      .pipe(catchError(this.handleError));
  }

  getHawkerOutlets(id: string | undefined): Observable<any> {
    return this.httpClient
      .get<any[]>(
        this.baseUrl + '/hawker/profile/outlet/findOutletsByHawkerId/' + id
      )
      .pipe(catchError(this.handleError));
  }

  getOutletDetails(id: string | undefined): Observable<any> {
    return this.httpClient
      .get<any>(
        this.baseUrl + '/hawker/profile/outlet/findOutletById/' + id
      )
      .pipe(catchError(this.handleError));
  }

  updateOutletDetails(outlet: any | undefined): Observable<any> {
    return this.httpClient
      .put<any>(
        // eslint-disable-next-line no-underscore-dangle
        this.baseUrl + '/hawker/profile/outlet/updateOutlet/' + outlet._id,
        outlet
      )
      .pipe(catchError(this.handleError));
  }

  findAllHawkerCenters(): Observable<HawkerCenter[]> {
    return this.httpClient
      .get<HawkerCenter[]>(
        this.baseUrl + '/customer/orderManagement/findAllHawkerCenters'
      )
      .pipe(catchError(this.handleError));
  }

  findAllHawkerOutletsByHawkerCentre(hawkerCentreName: string): Observable<HawkerStore[]> {
    return this.httpClient.get<HawkerStore[]>(
      `${this.baseUrl}/customer/orderManagement/findAllHawkerOutletsByHawkerCentre/${hawkerCentreName}`
    )
      .pipe(catchError(this.handleError));
  }

  checkOutletIsActive(outlet: Outlet, advancedOrderTime?): boolean {
    const dayOfWeek = new Date().toLocaleDateString('en-us', { weekday: 'long' }).toUpperCase();
    for (const operatingDay of outlet.outletOperatingHrs) {
      if (operatingDay.day === dayOfWeek) {
        if (!operatingDay.businessStatus) {
          return false;
        } else {
          const min = moment(moment(new Date(operatingDay.startTime)).format('H:mm'), 'H:mm');
          const max = moment(moment(new Date(operatingDay.endTime)).format('H:mm'), 'H:mm');
          // if the closing time is after midnight, add one day
          if (max.hour() < 10) {
            max.add(1, 'days');
          }
          let date;
          if (advancedOrderTime) {
            date = advancedOrderTime;
          } else {
            date = moment(moment(new Date(), 'H:mm'), 'H:mm');
          }
          // return date.isAfter(min) && date.isBefore(max);
          return true;
        }
      }
    }
  }

  updateOutletCashback(outletId: string, cashbackRate: number, cashbackIsActive: boolean): Observable<any> {
    const cashback = {
      cashbackRate,
      cashbackIsActive
    };

    return this.httpClient
      .post<any>(
        this.baseUrl + '/hawker/cashback/updateOutletCashback/' + outletId,
        cashback
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }
}
