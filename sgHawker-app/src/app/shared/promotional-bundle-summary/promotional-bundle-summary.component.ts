import { FoodBundle } from '../../models/submodels/foodBundle';
import { PromotionalBundleSummary } from '../../models/submodels/promotionalBundleSummary';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-promotional-bundle-summary',
  templateUrl: './promotional-bundle-summary.component.html',
  styleUrls: ['./promotional-bundle-summary.component.scss'],
})
export class PromotionalBundleSummaryComponent {

  @Input() promotionFoodBundle: PromotionalBundleSummary;

  constructor(
    private router: Router,
  ) { }

  redirectToOutlet() {
    this.router.navigate(['/customer/home/hawkerOutlets', this.promotionFoodBundle._id]);
  }
}
