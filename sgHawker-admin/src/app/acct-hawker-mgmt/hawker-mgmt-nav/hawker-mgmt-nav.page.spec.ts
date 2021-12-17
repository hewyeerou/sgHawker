import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HawkerMgmtNavPage } from './hawker-mgmt-nav.page';

describe('HawkerMgmtNavPage', () => {
  let component: HawkerMgmtNavPage;
  let fixture: ComponentFixture<HawkerMgmtNavPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HawkerMgmtNavPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HawkerMgmtNavPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
