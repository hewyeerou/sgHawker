import { TestBed } from '@angular/core/testing';

import { FoodBasketServiceService } from './food-basket-service.service';

describe('FoodBasketServiceService', () => {
  let service: FoodBasketServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodBasketServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
