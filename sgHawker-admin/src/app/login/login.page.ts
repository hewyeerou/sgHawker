import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountTypeEnum } from '../models/enums/account-type-enum.enum';
import { User } from '../models/user';
import { SessionService } from '../services/session.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string;
  password: string;
  error: string;

  constructor(public sessionService: SessionService,
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    if (this.sessionService.getIsLogin()) {
      const user: User = this.sessionService.getCurrentUser();
      if (user.accountType === AccountTypeEnum.ADMIN) {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  login(loginForm: NgForm) {
    this.error = '';

    // eslint-disable-next-line max-len
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(this.email)) {
      this.error = 'Please type in a valid email';
    }
    else if (loginForm.valid) {
      this.userService.login(this.email, this.password).subscribe(
        response => {
          const user: User = response;
          this.sessionService.setIsLogin(true);
          this.sessionService.setCurrentUser(user);
          loginForm.reset();
          this.router.navigate(['/home']);
        },
        error => {
          this.error = error;
        }
      );
    }
  }
}
