import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PromotionalBundleSummaryComponent } from './promotional-bundle-summary/promotional-bundle-summary.component';
import { RecommendedFoodItemComponent } from './recommended-food-item/recommended-food-item.component';
import { FoodItemSummaryComponent } from './food-item-summary/food-item-summary.component';
import { FoodBundleSummaryComponent } from './food-bundle-summary/food-bundle-summary.component';
import { OrderDetailModalComponent } from './order-detail-modal/order-detail-modal.component';
import { ViewReportDetailsModalComponent } from './view-report-details-modal/view-report-details-modal.component';
import { ReportCardComponent } from './report-card/report-card.component';
import { CreateReportModalComponent } from './create-report-modal/create-report-modal.component';
import { CreateFeedbackModalComponent } from './create-feedback-modal/create-feedback-modal.component';
import { CartIndividualOrderItemComponent } from './cartCustomization/cart-individual-order-item/cart-individual-order-item.component';
import { CartBundleOrderItemComponent } from './cartCustomization/cart-bundle-order-item/cart-bundle-order-item.component';
import { FoodBundleDetailModalComponent } from './cartCustomization/food-bundle-detail-modal/food-bundle-detail-modal.component';
import { FoodItemCustomizeModalComponent } from './cartCustomization/food-item-customize-modal/food-item-customize-modal.component';
import { ChangeOrderTypeComponent } from './change-order-type/change-order-type.component';
@NgModule({
  declarations: [
    OrderSummaryComponent,
    PromotionalBundleSummaryComponent,
    RecommendedFoodItemComponent,
    FoodItemSummaryComponent,
    FoodBundleSummaryComponent,
    OrderDetailModalComponent,
    CreateReportModalComponent,
    CreateFeedbackModalComponent,
    ViewReportDetailsModalComponent,
    ReportCardComponent,
    CartIndividualOrderItemComponent,
    CartBundleOrderItemComponent,
    FoodBundleDetailModalComponent,
    FoodItemCustomizeModalComponent,
    ChangeOrderTypeComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    OrderSummaryComponent,
    PromotionalBundleSummaryComponent,
    RecommendedFoodItemComponent,
    FoodItemSummaryComponent,
    FoodBundleSummaryComponent,
    OrderDetailModalComponent,
    CreateReportModalComponent,
    CreateFeedbackModalComponent,
    ViewReportDetailsModalComponent,
    ReportCardComponent,
    CartIndividualOrderItemComponent,
    CartBundleOrderItemComponent,
    FoodBundleDetailModalComponent,
    FoodItemCustomizeModalComponent,
    ChangeOrderTypeComponent,
  ]
})
export class SharedModule { }
