import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CartIndividualOrderItemComponent } from './cart-individual-order-item.component';

describe('CartIndividualOrderItemComponent', () => {
  let component: CartIndividualOrderItemComponent;
  let fixture: ComponentFixture<CartIndividualOrderItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CartIndividualOrderItemComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CartIndividualOrderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
