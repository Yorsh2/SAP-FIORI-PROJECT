sap.ui.define([
    "com/ccnay/jagsapinv/sapfiori/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Fragment, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.ccnay.jagsapinv.sapfiori.controller.values.pages.ManagementValues", {

        onInit: function () {
            const oModel = new JSONModel();
            oModel.loadData("./resources/jsons/Managementvalues.json");
            this.getView().setModel(oModel);
        },

    });
});