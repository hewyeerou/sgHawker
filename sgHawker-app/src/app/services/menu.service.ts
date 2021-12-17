import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Menu } from '../models/menu';
import { catchError } from 'rxjs/operators';
import { FoodItem } from '../models/foodItem';

const httpOptions = {
  headers: new HttpHeaders({ 'content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class MenuService {

  baseUrl = '/api';

  constructor(private httpClient: HttpClient) { }

  retrieveActiveMenuForOutlet(outletId: string): Observable<Menu> {
    return this.httpClient
      .get<Menu>(this.baseUrl + '/hawker/menu/findActiveMenuByOutletId/' + outletId)
      .pipe(catchError(this.handleError));
  }

  createNewMenu(menu: Menu): Observable<Menu> {
    return this.httpClient
      .post<Menu>(
        this.baseUrl + '/hawker/menu/createMenu',
        menu
      );
  }
  retrieveAllUniqueFoodCategories(outletId: string): Observable<string[]> {
    return this.httpClient.get<string[]>
      (this.baseUrl + '/hawker/menuManagement/retrieveAllUniqueFoodCategories/' + outletId)
      .pipe(catchError(this.handleError));
  }

  updateCategoryName(outletId: string, oldItemCategory: string, newItemCategory: string): Observable<{ modified: number }> {
    return this.httpClient.post<{ modified: number }>
      (this.baseUrl + '/hawker/menuManagement/updateCategoryName/' +
        outletId, { oldItemCategory, newItemCategory })
      .pipe(catchError(this.handleError));
  }

  getMenuByOutlet(outletId: string | undefined): Observable<Menu[]> {
    return this.httpClient
      .get<Menu[]>(
        this.baseUrl + '/hawker/menu/findMenusByOutletId/' + outletId
      )
      .pipe(catchError(this.handleError));
  }

  deleteMenu(menuId: string | undefined): Observable<Menu> {
    return this.httpClient
      .delete<Menu>(
        this.baseUrl + '/hawker/menu/deleteMenu/' + menuId
      )
      .pipe(catchError(this.handleError));
  }

  getMenuById(menuId: string | undefined): Observable<Menu> {
    return this.httpClient
      .get<Menu>(
        this.baseUrl + '/hawker/menu/findMenuById/' + menuId
      )
      .pipe(catchError(this.handleError));
  }

  getAllMenus(): Observable<Menu[]> {
    return this.httpClient
      .get<Menu[]>(
        this.baseUrl + '/hawker/menu/findAllMenus'
      )
      .pipe(catchError(this.handleError));
  }

  updateMenuDetails(menu: Menu | undefined, menuId: string | undefined): Observable<Menu> {
    return this.httpClient
      .put<Menu>(
        // eslint-disable-next-line no-underscore-dangle
        this.baseUrl + '/hawker/menu/updateMenu/' + menuId,
        menu
      )
      .pipe(catchError(this.handleError));
  }

  updateCategory(foodItemsIds: string[] | undefined, toItemCategory: string): Observable<any> {
    return this.httpClient.post<any>(this.baseUrl + '/hawker/menuManagement/updateCategory/', { foodItemsIds, toItemCategory })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error.error.message);
  }
}
