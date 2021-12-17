/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { QueueSetting } from '../models/queueSetting';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  baseUrl = '/api';

  queueSetting: QueueSetting;
  queueIsActive = false;

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  findQueueSettingByOutletId(outletId: string): Observable<QueueSetting> {
    return this.httpClient
      .get<QueueSetting>(this.baseUrl + '/hawker/queueManagement/findQueueSettingByOutletId/' + outletId)
      .pipe(
        map(data => {
          const foodMap: Map<string, number> = new Map();
          _.forEach(data.queueBySimilarOrderSetting.orderItemGroupQuantity, value => {
            foodMap.set(value.foodItem._id, value.quantity);
          });
          data.queueBySimilarOrderSetting.orderItemGroupQuantityMap = foodMap;
          return data;
        }),
        catchError(this.handleError));
  }

  updateQueueSettings(queueSetting) {
    return this.httpClient
      .post<QueueSetting>(this.baseUrl + '/hawker/queueManagement/updateQueueSetting', queueSetting)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }

}
