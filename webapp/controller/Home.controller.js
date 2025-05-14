sap.ui.define([
  "com/ccnay/jagsapinv/sapfiori/controller/BaseController",
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageBox',
  'sap/ui/core/mvc/XMLView'
], function (BaseController, JSONModel, MessageBox, XMLView) {
  "use strict";

  return BaseController.extend("com.ccnay.jagsapinv.sapfiori.controller.Home", {
    onInit: function () {
      var oModel = new JSONModel();
      oModel.loadData("./resources/jsons/usersNavItems.json", null, false); // Carga síncrona (más simple para este caso)
      this.getView().setModel(oModel, "usersNavModel");

      // Construir dinámicamente los NavigationListItems
      this._buildNavigationItems();

      // Inicializa el NavContainer
      this._oNavContainer = this.byId("IdNavContainer1Users");

      // Cargar página inicial
      this._loadInitialPage();
    },


    _loadInitialPage: function () {
      // Forzar la selección de "Inicio" (page01) al iniciar
      var oModel = this.getView().getModel("usersNavModel");
      oModel.setProperty("/selectedKey", "page01");

      // Cargar la tabla de usuarios como página inicial
      this._loadPage("page01", true);
    },

    // Maneja la selección de items en la navegación
    onNavItemSelect: function (oEvent) {
      var oItem = oEvent.getParameter("item");

      // Si el ítem tiene hijos (subItems), no hacemos nada
      if (oItem.getItems && oItem.getItems().length > 0) {
        return;
      }
      var sKey = oItem.getKey();
      this._loadPage(sKey);
    }
    ,

    _loadPage: function (sKey, bIsInitialLoad = false) {
      try {
        var sViewName = "";
        var oNavContainer = this.byId("IdNavContainer1Users");
        var oPage = sap.ui.getCore().byId(sKey);

        if (!oPage) {
          switch (sKey) {
            case "home": // Inicio - Mostrar tabla de usuarios
              sViewName = "com.ccnay.jagsapinv.sapfiori.view.users.pages.UsersMainTable";
              break;
            case "login": // Login (Cambiar usuario)
              sViewName = "com.ccnay.jagsapinv.sapfiori.view.users.pages.Login";
              break;
            case "userManagement":
              sViewName = "com.ccnay.jagsapinv.sapfiori.view.users.pages.ManagementUsers";
              break;
            case "values":
              sViewName = "com.ccnay.jagsapinv.sapfiori.view.values.pages.ManagementValues";
              break;
            case "roleManagement":
              MessageBox.information("Funcionalidad de gestión de roles en desarrollo");
              return;
            case "settings":
              MessageBox.information("Funcionalidad de ajustes en desarrollo");
              return;
            case "log_out":
              MessageBox.information("Funcionalidad de cerrar sesión en desarrollo");
              return;
            default:
              throw new Error("Vista no implementada");
          }

          // Crea la vista de forma asíncrona
          XMLView.create({
            viewName: sViewName,
            id: sKey
          }).then(function (oCreatedView) {
            oNavContainer.addPage(oCreatedView);
            oNavContainer.to(oCreatedView);

            // Actualiza el modelo solo si no es la carga inicial
            if (!bIsInitialLoad) {
              var oModel = this.getView().getModel("usersNavModel");
              oModel.setProperty("/selectedKey", sKey);
              oModel.updateBindings();
            }
          }.bind(this)).catch(function (oError) {
            MessageBox.error("Error al cargar la vista: " + oError.message);
          });
        } else {
          oNavContainer.to(oPage);
          if (!bIsInitialLoad) {
            var oModel = this.getView().getModel("usersNavModel");
            oModel.setProperty("/selectedKey", sKey);
            oModel.updateBindings();
          }
        }
      } catch (error) {
        MessageBox.error("Error al cargar la vista: " + error.message);
      }
    },

    _buildNavigationItems: function () {
      const oView = this.getView();
      const oModel = oView.getModel("usersNavModel");
      const aNavItems = oModel.getProperty("/navigation");
      const oNavList = oView.byId("IdNavigationList1Users");

      // Limpia el contenido anterior si existiera
      oNavList.destroyItems();

      aNavItems.forEach(section => {
        const oParentItem = new sap.tnt.NavigationListItem({
          key: section.key,
          text: section.title,
          icon: section.icon,
          expanded: false 
        });

        if (section.subItems && section.subItems.length > 0) {
          section.subItems.forEach(sub => {
            const oSubItem = new sap.tnt.NavigationListItem({
              key: sub.key,
              text: sub.title,
              icon: sub.icon
            });
            oParentItem.addItem(oSubItem);
          });
        }

        oNavList.addItem(oParentItem);
      });
    }



  });
});