import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewHawkerSubscriptionDetailsPage } from './view-hawker-subscription-details.page';

describe('ViewHawkerSubscriptionDetailsPage', () => {
  let component: ViewHawkerSubscriptionDetailsPage;
  let fixture: ComponentFixture<ViewHawkerSubscriptionDetailsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewHawkerSubscriptionDetailsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewHawkerSubscriptionDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
