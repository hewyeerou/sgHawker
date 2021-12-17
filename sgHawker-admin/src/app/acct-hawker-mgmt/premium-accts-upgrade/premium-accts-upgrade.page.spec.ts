import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PremiumAcctsUpgradePage } from './premium-accts-upgrade.page';

describe('PremiumAcctsUpgradePage', () => {
  let component: PremiumAcctsUpgradePage;
  let fixture: ComponentFixture<PremiumAcctsUpgradePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PremiumAcctsUpgradePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PremiumAcctsUpgradePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
