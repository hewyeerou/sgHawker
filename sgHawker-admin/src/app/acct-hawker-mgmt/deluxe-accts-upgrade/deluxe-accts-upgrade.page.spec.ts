import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeluxeAcctsUpgradePage } from './deluxe-accts-upgrade.page';

describe('DeluxeAcctsUpgradePage', () => {
  let component: DeluxeAcctsUpgradePage;
  let fixture: ComponentFixture<DeluxeAcctsUpgradePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeluxeAcctsUpgradePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeluxeAcctsUpgradePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
