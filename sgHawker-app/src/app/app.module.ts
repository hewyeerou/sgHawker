import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MbscModule } from '@mobiscroll/angular-lite';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { PopoverComponentComponent } from './shared/popover-component/popover-component.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { LeaderboardInfoModalComponent } from './shared/leaderboard-info-modal/leaderboard-info-modal.component';

const config: SocketIoConfig = {
  url: 'http://localhost:4000', // socket server url;
  options: {
    transports: ['websocket']
  }
};

@NgModule({
  declarations: [AppComponent, PopoverComponentComponent, LeaderboardInfoModalComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    SocketIoModule.forRoot(config),
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    HttpClientModule,
    NgSelectModule,
    NgOptionHighlightModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MbscModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
