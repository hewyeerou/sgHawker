import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HawkerCenter } from '../models/submodels/hawkerCenter';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  findNumOfSalesForAllHawkers(): Observable<any> {
    return this.httpClient
      .get<any>(
        this.baseUrl + '/hawker/hawkerLeaderboardModule/findNumOfSalesForAllHawkers/'
      )
      .pipe(catchError(this.handleError));
  }

  findAllHawkerCentresAndCuisineTypes(): Observable<any> {
    return this.httpClient
      .get<any>(
        this.baseUrl + '/hawker/hawkerLeaderboardModule/findAllHawkerCentresAndCuisineTypes/'
      )
      .pipe(catchError(this.handleError));
  }
  findNumOfSalesForAllHawkersForPastDays(numOfDays: number): Observable<any> {
    return this.httpClient
      .get<any>(
        this.baseUrl + '/hawker/hawkerLeaderboardModule/findNumOfSalesForAllHawkersForPastDays/' + numOfDays
      )
      .pipe(catchError(this.handleError));
  }

  findNumOfSalesForAllFoodItem(): Observable<any> {
    return this.httpClient
      .get<any>(
        this.baseUrl + '/hawker/hawkerLeaderboardModule/findNumOfSalesForAllFoodItem/'
      )
      .pipe(catchError(this.handleError));
  }

  findNumOfSalesForAllFoodItemForPastDays(numOfDays: number): Observable<any> {
    return this.httpClient
      .get<any>(
        this.baseUrl + '/hawker/hawkerLeaderboardModule/findNumOfSalesForAllFoodItemForPastDays/' + numOfDays
      )
      .pipe(catchError(this.handleError));
  }

  //FAVOURITES

  findNumOfFavouritesForAllHawkers(): Observable<any> {
    return this.httpClient
    .get<any>(
      this.baseUrl + '/hawker/hawkerLeaderboardModule/findNumOfFavouritesForAllHawkers/'
    )
    .pipe(catchError(this.handleError));
  }

  findNumOfFavouritesForAllHawkersCentres(): Observable<any> {
    return this.httpClient
    .get<any>(
      this.baseUrl + '/hawker/hawkerLeaderboardModule/findNumOfFavouritesForAllHawkerCentres/'
    )
    .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  };
}
