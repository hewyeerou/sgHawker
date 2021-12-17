/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { MenuService } from 'src/app/services/menu.service';
import { OutletService } from 'src/app/services/outlet.service';
import { CreateFoodItemPage } from './create-food-item/create-food-item.page';
import { SessionService } from 'src/app/services/session.service';
import { PopoverComponentComponent } from '../../shared/popover-component/popover-component.component';
import { Menu } from 'src/app/models/menu';
import * as _ from 'lodash';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.page.html',
  styleUrls: ['./menus.page.scss'],
})
export class MenusPage implements OnInit {
  hawker: User;
  outlets: Outlet[] = [];
  activeMenus: Menu[] = [];
  inactiveMenus: Menu[] = [];
  segmentModel = 'active';
  outlet: Outlet;

  // search bar
  originalActiveMenus: Menu[] = [];
  originalInactiveMenus: Menu[] = [];
  searchString: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public modalController: ModalController,
    private menuService: MenuService,
    private outletService: OutletService,
    private sessionService: SessionService,
    public popoverController: PopoverController,
    public alertController: AlertController
  ) {
    this.outlet = new Outlet();
  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.hawker = this.sessionService.getCurrentUser();
    // this.outletService.getHawkerOutlets(this.hawker._id).subscribe((res) => {
    this.outlet = this.sessionService.getCurrentOutlet();
    this.menuService.getMenuByOutlet(this.outlet._id).subscribe((resp) => {
      this.activeMenus = resp.filter(
        (allMenus) => allMenus.activeMenu === true
      );
      this.originalActiveMenus = this.activeMenus;
      this.inactiveMenus = resp.filter(
        (allMenus) => allMenus.activeMenu === false
      );
      this.originalInactiveMenus = this.inactiveMenus;
    });
    // });
  }

  filterMenuByFood() {
    // reset the menus
    this.activeMenus = _.cloneDeep(this.originalActiveMenus);
    this.inactiveMenus = _.cloneDeep(this.originalInactiveMenus);

    // filter the active menus
    this.activeMenus = this.activeMenus.filter((am) => {
      const foodItemsExist = am.foodItems.map(
        (food) =>
          food.itemName.toLowerCase().indexOf(this.searchString.toLowerCase()) >
          -1
      );
      if (
        am.menuName.toLowerCase().indexOf(this.searchString.toLowerCase()) >
        -1 ||
        foodItemsExist.indexOf(true) > -1
      ) {
        return true;
      }
      return false;
    });

    // filter the inactive menus
    this.inactiveMenus = this.inactiveMenus.filter((im) => {
      const foodItemsExist = im.foodItems.map(
        (food) =>
          food.itemName.toLowerCase().indexOf(this.searchString.toLowerCase()) >
          -1
      );
      if (
        im.menuName.toLowerCase().indexOf(this.searchString.toLowerCase()) >
        -1 ||
        foodItemsExist.indexOf(true) > -1
      ) {
        return true;
      }
      return false;
    });
  }

  async showPopOver(ev) {
    const popoverItemProps = [{
      label: 'New Menu',
      eventHandler: () => {
        const navigationExtras: NavigationExtras = {
          queryParams: {
            operation: 'createMenu',
            menuId: '',
          },
        };
        this.router.navigate(['/hawker/menus/create-menu'], navigationExtras);
      },
    },
    {
      label: 'Manage Food Items',
      eventHandler: () => {
        this.router.navigate(['hawker/menus/view-all-food-item']);
      },
      type: 'FOOD'
    }
    ];
    this.popoverController
      .create({
        component: PopoverComponentComponent,
        cssClass: 'popover-class',
        componentProps: { items: popoverItemProps },
        translucent: true,
        event: ev,
      })
      .then((popOverElement) => {
        popOverElement.present();
      });
  }

  viewMenuDetails(id) {
    this.router.navigate(['/hawker/menus/view-menu-details/' + id]);
  }

  alertUpdateActiveMenu(menu) {
    this.alertController.create({
      message: 'Do you want to update menu status?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.updateMenuActive(menu);
          }
        },
        {
          text: 'No',
          handler: () => {
            menu.activeMenu = !menu.activeMenu;
          }
        }
      ],
      backdropDismiss: false
    }).then(alertElement => {
      alertElement.present();
    });
  }

  updateMenuActive(menu: Menu) {
    let menuActive = '';

    if (menu.activeMenu === true) {
      menuActive = 'active';
    } else {
      menuActive = 'inactive';
    }

    if(menu.activeMenu === true && this.checkActiveForMenus(this.outlet._id, menu._id)) {
      menu.activeMenu = !menu.activeMenu;

      this.alertController
      .create({
        header: 'Oops',
        message: 'You can only have one active menu.',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ],
      })
      .then((alertElement) => {
        alertElement.present();
      });
      return;
    }

    this.menuService.updateMenuDetails(menu, menu._id).subscribe(
      updatedMenu => {
        this.alertController.create({
          header: 'Success',
          message: 'Menu is set to ' + menuActive,
          buttons: [
            {
              text: 'Dismiss',
              role: 'OK',
              handler: () => {
                this.menuService.getMenuByOutlet(this.outlet._id).subscribe((resp) => {
                  this.activeMenus = resp.filter(
                    (allMenus) => allMenus.activeMenu === true
                  );
                  this.originalActiveMenus = this.activeMenus;
                  this.inactiveMenus = resp.filter(
                    (allMenus) => allMenus.activeMenu === false
                  );
                  this.originalInactiveMenus = this.inactiveMenus;
                });
                return;
              }
            }
          ]
        }).then(alertElement => {
          alertElement.present();
        });
      }
    );
  }

  checkActiveForMenus(outletId, menuId) {
    const activeMenus = this.activeMenus.filter(
      (menus) =>
        menus.outlet === outletId &&
        menus._id !== menuId
    );
    if (activeMenus.length > 0) {
      return true;
    } else if (activeMenus.length === 0) {
      return false;
    }
  }

}
