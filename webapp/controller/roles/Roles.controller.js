sap.ui.define([
  "com/ccnay/jagsapinv/sapfiori/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/ui/core/mvc/XMLView"
], function (BaseController, JSONModel, MessageBox, XMLView) {
  "use strict";

  return BaseController.extend("com.ccnay.jagsapinv.sapfiori.controller.Roles", {
onInit: function () {
  // Carga del JSON con roles a nivel general
  var oRolesModel = new JSONModel();
  oRolesModel.loadData("./jsons/roles.json");
  this.getView().setModel(oRolesModel, "RolesModel");

  // Inicializa navegación
  var oNavModel = new JSONModel();
  oNavModel.loadData("./jsons/UsersNavItems.json");
  this.getView().setModel(oNavModel, "RolesNavModel");

  this._oNavContainer = this.byId("IdNavContainer1Roles");
  this._loadInitialPage();
},

    _loadInitialPage: function () {
      var oModel = this.getView().getModel("RolesNavModel");
      oModel.setProperty("/selectedKey", "page01");
      this._loadPage("page01", true);
    },

    onNavItemSelect: function (oEvent) {
      var oItem = oEvent.getParameter("item");
      var sKey = oItem.getKey();
      this._loadPage(sKey);
    },

    _loadPage: function (sKey, bIsInitialLoad = false) {
      try {
        var sViewName = "";
        var oNavContainer = this.byId("IdNavContainer1Roles");
        var oPage = sap.ui.getCore().byId(sKey);

        if (!oPage) {
          switch (sKey) {
            case "page01":
              sViewName = "com.ccnay.jagsapinv.sapfiori.view.users.pages.UsersMainTable";
              break;
            case "page02":
              MessageBox.information("Funcionalidad de cerrar sesión en desarrollo");
              return;
            case "page03":
              sViewName = "com.ccnay.jagsapinv.sapfiori.view.users.pages.Login";
              break;
            case "page20":
            case "page30":
              sViewName = "com.ccnay.jagsapinv.sapfiori.view.roles.pages.ManagementRoles";
              break;
            case "page50":
              MessageBox.information("Funcionalidad de ajustes en desarrollo");
              return;
            default:
              throw new Error("Vista no implementada");
          }

          XMLView.create({
            viewName: sViewName,
            id: sKey
          }).then(function (oCreatedView) {
            oNavContainer.addPage(oCreatedView);
            oNavContainer.to(oCreatedView);

            // ⬇ Carga de modelo estático para la vista de roles
            if (sKey === "page20" || sKey === "page30") {
              var oRolesModel = new JSONModel();
              oRolesModel.loadData("resources/jsons/roles.json");
              oCreatedView.setModel(oRolesModel);
            }

            if (!bIsInitialLoad) {
              var oModel = this.getView().getModel("RolesNavModel");
              oModel.setProperty("/selectedKey", sKey);
              oModel.updateBindings();
            }
          }.bind(this)).catch(function (oError) {
            MessageBox.error("Error al cargar la vista: " + oError.message);
          });
        } else {
          oNavContainer.to(oPage);
          if (!bIsInitialLoad) {
            var oModel = this.getView().getModel("RolesNavModel");
            oModel.setProperty("/selectedKey", sKey);
            oModel.updateBindings();
          }
        }
      } catch (error) {
        MessageBox.error("Error al cargar la vista: " + error.message);
      }
    },

    onMenuButtonPress: function () {
      var toolPage = this.byId("IdToolPage1Roles");
      toolPage.setSideExpanded(!toolPage.getSideExpanded());
    },

    onAvatarPress: function () {
      var oMyAvatar = this.getView().byId("IdAvatar1Roles");
      oMyAvatar.setActive(!oMyAvatar.getActive());

      var oPopover = new sap.m.Popover({
        title: "Opciones",
        placement: sap.m.PlacementType.Bottom,
        afterClose: function () {
          oMyAvatar.setActive(false);
        },
        content: new sap.m.List({
          items: [
            new sap.m.StandardListItem({
              title: "Cerrar sesión",
              icon: "sap-icon://log",
              type: sap.m.ListType.Active,
              press: function () {
                this.clearSession();
                oPopover.close();
                oMyAvatar.setActive(false);
                this.getRouter().navTo("RouteLogin", {}, true);
              }.bind(this)
            })
          ]
        })
      });

      oPopover.openBy(oMyAvatar);
    }
  });
});
