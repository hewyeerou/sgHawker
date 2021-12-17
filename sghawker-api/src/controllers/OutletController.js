import { ResponseHelper } from "helpers";
import { ClientError, Constants } from "common";
import { Outlet, QueueSetting } from "models";

const DEBUG_ENV = "OutletController";

const OutletController = {
  request: {},
};

OutletController.request.createNewOutlet = function (req, res) {
  const { id } = req.params;

  const reqError = Outlet.validate(req.body, {
    outletName: true,
    outletAddress: true,
    hawkerCentreName: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  Outlet
    .createOutlet(req.body, id)
    .then(createdOutlet => QueueSetting.createQueueSettingForOutlet(createdOutlet))
    .then(createdOutlet => ResponseHelper.success(res, createdOutlet))
    .catch(error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

OutletController.request.deleteOutlet = function (req, res) {
  const { outletId } = req.params;

  Outlet.deleteOutlet(outletId).then(
    (deletedOutlet) => {
      ResponseHelper.success(res, deletedOutlet);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

OutletController.request.findOutletById = function (req, res) {
  const { outletId } = req.params;

  return Outlet
    .findOutletById(outletId)
    .then((outlet) => {
      if (outlet) {
        return ResponseHelper.success(res, outlet);
      } else {
        return ResponseHelper.error(
          res,
          new ClientError(Constants.ERROR_OUTLET_ID_NOT_FOUND),
          DEBUG_ENV
        );
      }
    });
};

OutletController.request.findOutletsByHawkerId = function (req, res) {
  const { hawkerId } = req.params;

  return Outlet.findOutletsByHawkerId(hawkerId).then((outlets) => {
    if (outlets) {
      return ResponseHelper.success(res, outlets);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_INVALID_HAWKER_ID),
        DEBUG_ENV
      );
    }
  });
};

OutletController.request.findMasterOutletsByHawkerId = function (req, res) {
  const { hawkerId } = req.params;

  return Outlet.findOutletsByHawkerId(hawkerId).then((outlets) => {
    const masterOutlet = outlets.find(x => x.isMaster);
    if (masterOutlet) {
      return ResponseHelper.success(res, masterOutlet);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_INVALID_HAWKER_ID),
        DEBUG_ENV
      );
    }
  });
};

OutletController.request.findAllOutlets = function (req, res) {
  return Outlet
    .findAllActiveOutlets()
    .then((outlets) => ResponseHelper.success(res, outlets));
};

OutletController.request.updateOutlet = function (req, res) {
  const { outletId } = req.params;

  const reqError = Outlet.validate(req.body, {
    outletName: true,
    outletAddress: true,
    hawkerCentreName: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Outlet
    .updateOutlet(outletId, req.body)
    .then(
      (outlet) => ResponseHelper.success(res, outlet),
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OutletController.request.updateOutletCashback = function (req, res) {
  const { outletId } = req.params;
  const { cashbackRate, cashbackIsActive } = req.body;

  if (cashbackRate) {
    const reqError = Outlet.validate(req.body, {
      cashbackRate: true,
    });

    if (reqError) {
      return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
    }
  }

  return Outlet
    .updateOutletCashback(outletId, cashbackRate, cashbackIsActive)
    .then(
      (outlet) => ResponseHelper.success(res, outlet),
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
};

/**
QUEUE SETTING
*/

OutletController.request.findQueueSettingByOutletId = function (req, res) {
  const { outletId } = req.params;
  return QueueSetting
    .findQueueSettingByOutletId(outletId)
    .then(
      (queueSettingArr) => ResponseHelper.success(res, queueSettingArr[0]),
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OutletController.request.updateQueueSetting = function (req, res) {
  return QueueSetting
    .updateQueueSetting(req.body)
    .then(
      queueSetting => ResponseHelper.success(res, queueSetting),
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
};

export default OutletController;
