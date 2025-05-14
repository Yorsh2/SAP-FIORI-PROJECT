sap.ui.define([
  "com/ccnay/jagsapinv/sapfiori/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast"
], function (BaseController, JSONModel, Fragment, MessageToast) {
  "use strict";

  return BaseController.extend("com.ccnay.jagsapinv.sapfiori.controller.users.pages.ManagementUsers", {
    onInit: function () {
      // Modelo principal con lista vacía de usuarios
      const oModel = new JSONModel({
        Users: []
      });
      this.getView().setModel(oModel);
    },

    onCreatePress: async function () {
      if (!this._oCreateDialog) {
        this._oCreateDialog = await Fragment.load({
          name: "com.ccnay.jagsapinv.sapfiori.view.users.components.CreateUserDialog",
          id: this.getView().getId(),
          controller: this
        });
        this.getView().addDependent(this._oCreateDialog);
      }

      // Modelo temporal del formulario con todos los campos
      const oTempModel = new JSONModel({
        nombre: "",
        apellido: "",
        email: "",
        departamento: "",
        cargo: "",
        fechaIngreso: "", // o new Date()
        estado: ""
      });
      this._oCreateDialog.setModel(oTempModel, "newUser");

      this._oCreateDialog.open();
    },

    onConfirmCreate: function () {
      const oDialogModel = this._oCreateDialog.getModel("newUser");
      const oNewUser = oDialogModel.getData();

      // Validación mínima
      if (!oNewUser.nombre || !oNewUser.apellido || !oNewUser.email) {
        MessageToast.show("Completa los campos requeridos.");
        return;
      }

      // Obtener modelo principal
      const oMainModel = this.getView().getModel();
      const aUsers = oMainModel.getProperty("/Users");

      // Agregar ID único (ej. timestamp)
      oNewUser.id = Date.now().toString();

      // Agregar el nuevo usuario
      aUsers.push(oNewUser);
      oMainModel.refresh(true);

      this._oCreateDialog.close();
      MessageToast.show("Usuario creado con éxito.");
    },

    onCancelCreate: function () {
      this._oCreateDialog.close();
    }
  });
});
