import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HawkerAcctUpgradeNavPage } from './hawker-acct-upgrade-nav.page';

describe('HawkerAcctUpgradeNavPage', () => {
  let component: HawkerAcctUpgradeNavPage;
  let fixture: ComponentFixture<HawkerAcctUpgradeNavPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HawkerAcctUpgradeNavPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HawkerAcctUpgradeNavPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
