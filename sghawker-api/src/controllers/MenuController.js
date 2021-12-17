import _ from "lodash";
import { ClientError, Constants } from "common";
import { ResponseHelper, Logger } from "helpers";
import { Menu } from "models";

const DEBUG_ENV = "MenuController";

const MenuController = {
  request: {},
};

/**
 * Menu
 */
MenuController.request.createNewMenu = function (req, res) {
  const reqError = Menu.validate(req.body, {
    menuName: true,
    outlet: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  Menu.createNewMenu(req.body).then(
    (createdMenu) => {
      ResponseHelper.success(res, createdMenu);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

MenuController.request.findMenusByOutletId = function (req, res) {
  const { outletId } = req.params;

  return Menu.findMenusByOutletId(outletId).then((menus) => {
    if (menus) {
      return ResponseHelper.success(res, menus);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

MenuController.request.findActiveMenuByOutletId = function (req, res) {
  const { outletId } = req.params;

  return Menu.findActiveMenuByOutletId(outletId).then((menus) => {
    if (menus && menus[0]) {
      return ResponseHelper.success(res, menus[0]);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

MenuController.request.deleteMenu = function (req, res) {
  const { menuId } = req.params;

  return Menu.deleteMenu(menuId).then((deletedMenu) => {
    if (deletedMenu) {
      return ResponseHelper.success(res);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_MENU_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

MenuController.request.findMenuById = function (req, res) {
  const { menuId } = req.params;

  return Menu.findMenuById(menuId).then((menu) => {
    if (menu) {
      return ResponseHelper.success(res, menu);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_MENU_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

MenuController.request.findAllMenus = function (req, res) {
  Menu.findAllMenus().then((menus) => ResponseHelper.success(res, menus));
};

MenuController.request.updateMenu = function (req, res) {
  const { menuId } = req.params;

  const reqError = Menu.validate(req.body, {
    menuName: true,
    activeMenu: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }
  return Menu.updateMenu(menuId, req.body).then(
    (menu) => ResponseHelper.success(res, menu),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

export default MenuController;
