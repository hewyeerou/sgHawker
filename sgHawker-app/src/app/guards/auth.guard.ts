import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';

import { SessionService } from '../services/session.service';
import { User } from '../models/user';
import { AccountTypeEnum } from '../models/enums/account-type-enum.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanDeactivate<unknown> {
  user: User;

  constructor(private router: Router, private sessionService: SessionService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    if (this.sessionService.getIsLogin()) {
      this.user = this.sessionService.getCurrentUser();
      if (this.user?.accountType.toString() === 'CUSTOMER') {
        if (route.url[0].path === 'customer' || 'profile') {
          return true;
        } else {
          this.router.navigate(['/accessRightError']);
          return false;
        }
      } else if (this.user?.accountType.toString() === 'HAWKER') {
        if (route.url[0].path === 'hawker' || 'hawkerprofile' || 'hawkertier' || 'hawker-account-details') {
          if (this.user.outlets.length === 0) {
            this.router.navigate(['/accessRightError']);
            return false;
          }
          return true;
        } else {
          this.router.navigate(['/accessRightError']);
          return false;
        }
      } else if (this.sessionService.getIsGuest()) {
        return true;
      }
    } else {
      this.router.navigate(['/accessRightError']);
      return false;
    }
  }

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return true;
  }
}
