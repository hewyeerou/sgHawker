import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { LeaderboardTimeFramesTypeEnum } from 'src/app/models/enums/leaderboard-time-frames-enum.enum';
import { LeaderboardValueTypeEnum } from 'src/app/models/enums/leaderboard-value-type-enum.enum';
import { LeaderboardViewTypeEnum } from 'src/app/models/enums/leaderboard-view-enum.enum';
import { HawkerCenter } from 'src/app/models/submodels/hawkerCenter';

@Component({
  selector: 'app-hawker-leaderboard-filter-modal',
  templateUrl: './hawker-leaderboard-filter-modal.page.html',
  styleUrls: ['./hawker-leaderboard-filter-modal.page.scss'],
})
export class HawkerLeaderboardFilterModalPage implements OnInit {
  @Input() userType: AccountTypeEnum;

  @Input() allHawkerCentres: string[];
  @Input() allCuisineTypes: string[];

  @Input() pCurrentView: LeaderboardViewTypeEnum =
    LeaderboardViewTypeEnum.HAWKERS;
  @Input() pValueType: LeaderboardValueTypeEnum =
    LeaderboardValueTypeEnum.SALES;
  @Input() pHawkerCentre: string;
  @Input() pTimeFrame: LeaderboardTimeFramesTypeEnum;
  @Input() pCuisineType: string;
  leaderBoardViewTypes = LeaderboardViewTypeEnum;

  selectedCurrentView: LeaderboardViewTypeEnum;
  selectedValueType: LeaderboardValueTypeEnum;
  selectedHawkerCentre: string;
  selectedTimeFrame: LeaderboardTimeFramesTypeEnum | '';
  selectedCuisineType: string;

  viewSelections = [
    { label: 'Hawkers', value: LeaderboardViewTypeEnum.HAWKERS },
    { label: 'Hawker Centres', value: LeaderboardViewTypeEnum.HAWKER_CENTRES },
    { label: 'Food Items', value: LeaderboardViewTypeEnum.FOOD_ITEMS },
  ];

  valueTypeSelections = [
    { label: 'By Sales', value: LeaderboardValueTypeEnum.SALES },
    { label: 'By Favourites', value: LeaderboardValueTypeEnum.FAVOURITES },
  ];

  timeFrameSelections = [
    { label: 'Last 7 Days', value: LeaderboardTimeFramesTypeEnum.LAST_7_DAYS },
    {
      label: 'Last 30 Days',
      value: LeaderboardTimeFramesTypeEnum.LAST_30_DAYS,
    },
    {
      label: 'Last 60 Days',
      value: LeaderboardTimeFramesTypeEnum.LAST_60_DAYS,
    },
  ];

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.allCuisineTypes.sort((a, b) => (a > b ? 1 : -1));
    this.reset();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  submit() {
    if (this.selectedCurrentView === LeaderboardViewTypeEnum.HAWKERS) {
      this.selectedCuisineType = null;
    } else if (
      this.selectedCurrentView === LeaderboardViewTypeEnum.HAWKER_CENTRES
    ) {
      this.selectedCuisineType = null;
      this.selectedHawkerCentre = null;
    } else if (
      this.selectedCurrentView === LeaderboardViewTypeEnum.FOOD_ITEMS
    ) {
      this.selectedValueType = LeaderboardValueTypeEnum.SALES;
    }
    if (this.selectedTimeFrame === '') {
      this.selectedTimeFrame = null;
    }

    const resp = {
      pCurrentView: this.selectedCurrentView,
      pValueType: this.selectedValueType,
      pTimeFrame: this.selectedTimeFrame,
      pCuisineType: this.selectedCuisineType,
      pHawkerCentre: this.selectedHawkerCentre,
    };
    this.modalController.dismiss(resp);
  }

  reset() {
    this.selectedCurrentView = this.pCurrentView;
    this.selectedValueType = this.pValueType;
    this.selectedHawkerCentre = this.pHawkerCentre;
    this.selectedTimeFrame = this.pTimeFrame;
    this.selectedCuisineType = this.pCuisineType;
  }
}
