import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HawkerLeaderboardFilterModalPage } from './hawker-leaderboard-filter-modal.page';

describe('HawkerLeaderboardFilterModalPage', () => {
  let component: HawkerLeaderboardFilterModalPage;
  let fixture: ComponentFixture<HawkerLeaderboardFilterModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HawkerLeaderboardFilterModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HawkerLeaderboardFilterModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
