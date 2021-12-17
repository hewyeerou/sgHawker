import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ChangeOrderTypeComponent } from './change-order-type.component';

import { SetCashbackModalComponent } from './set-cashback-modal.component';

describe('SetCashbackModalComponent', () => {
  let component: SetCashbackModalComponent;
  let fixture: ComponentFixture<SetCashbackModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SetCashbackModalComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetCashbackModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
