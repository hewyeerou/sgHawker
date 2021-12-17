import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Report } from '../models/report';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  baseUrl = '/api';

  constructor(
    private httpClient: HttpClient
  ) { }

  createNewFeedback(feedback: Report): Observable<Report> {
    return this.httpClient.post<Report>(
      `${this.baseUrl}/report/createNewFeedback`,
      feedback
    )
      .pipe(catchError(this.handleError));
  }

  createNewComplaint(formData: FormData): Observable<Report> {
    return this.httpClient.post<Report>(
      `${this.baseUrl}/report/createNewComplaint`,
      formData
    )
      .pipe(catchError(this.handleError));
  }

  findComplaintsByCustomerId(customerId: string): Observable<Report[]> {
    return this.httpClient.get<Report[]>(
      `${this.baseUrl}/customer/report/findComplaintsByCustomerId/${customerId}`,
    )
      .pipe(catchError(this.handleError));
  }

  findComplaintsByOutletId(outletId: string): Observable<Report[]> {
    return this.httpClient.get<Report[]>(
      `${this.baseUrl}/hawker/report/findComplaintsByOutletId/${outletId}`,
    )
      .pipe(catchError(this.handleError));
  }

  deleteReportById(reportId: string): Observable<Report> {
    return this.httpClient.get<Report>(
      `${this.baseUrl}/report/deleteReportById/${reportId}`,
    )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }
}
