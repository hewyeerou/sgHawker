import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { SessionService } from './services/session.service';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  pages = [
    {
      title: 'Hawker Account Management',
      children: [
        {
          title: 'Pending Hawker Accounts',
          url: '/hawkerAccountManagement/pendingHawkerAccounts',
        },
        {
          title: 'Non-Pending Hawker Accounts',
          url: '/hawkerAccountManagement/approvedHawkerAccounts',
        },
      ]
    },
    {
      title: 'Hawker Account Upgrade Requests',
      children: [
        {
          title: 'Premium Account Upgrade Requests',
          url: '/hawkerAccountUpgrade/premiumAcctsUpgrade',
        },
        {
          title: 'Deluxe Account Upgrade Requests',
          url: '/hawkerAccountUpgrade/deluxeAcctsUpgrade',
        },
      ]
    },
    {
      title: 'Finance Management',
      children: [
        {
          title: 'Platform Earnings',
          url: '/financeManagement/platformEarnings',
        },
        {
          title: 'Outlet Earnings',
          url: '/financeManagement/outletEarnings',
        },
        {
          title: 'Hawker Subscriptions',
          url: '/financeManagement/hawkerSubscriptions',
        }
      ]
    },
  ];

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen, public sessionService: SessionService,
    private router: Router,
    private userService: UserService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  logout() {
    this.userService.logout().subscribe(
      response => {
        this.sessionService.setIsLogin(false);
        this.sessionService.setCurrentUser(null);
        this.router.navigate(['/login']);
      }
    );
  }
}