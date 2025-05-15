sap.ui.define([
  "com/ccnay/jagsapinv/sapfiori/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/BindingMode",      // << Import necesario
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (
  BaseController,
  JSONModel,
  BindingMode,                     // << BindingMode inyectado
  Fragment,
  MessageToast,
  MessageBox
) {
  "use strict";

  return BaseController.extend("com.ccnay.jagsapinv.sapfiori.controller.roles.pages.ManagementRoles", {

    onInit: function () {
      // Cargo el modelo inicial con la colección Roles
      const oModel = new JSONModel();
      oModel.loadData("resources/jsons/ManagementRoles.json");
      this.getView().setModel(oModel);
    },

    /********** CREAR **********/
    onCreatePress: function () {
      if (!this._createRoleDialog) {
        Fragment.load({
          name: "com.ccnay.jagsapinv.sapfiori.view.roles.components.CreateRoleDialog",
          controller: this
        }).then(function (oDialog) {
          this._createRoleDialog = oDialog;
          this.getView().addDependent(oDialog);
          this._prepareCreateDialog();
        }.bind(this));
      } else {
        this._prepareCreateDialog();
      }
    },

    _prepareCreateDialog: function () {
      const oNewRoleModel = new JSONModel({
        ROLEID: "",
        ROLENAME: "",
        DESCRIPTION: "",
        ACTIVED: true,
        DELETED: false,
        PROCESSID: "",
        PRIVILEGEID: ""
      });
      oNewRoleModel.setDefaultBindingMode(BindingMode.TwoWay);
      this._createRoleDialog.setModel(oNewRoleModel, "newRole");
      this._createRoleDialog.open();
    },

    onConfirmCreate: function () {
      if (!this._validateForm(this._createRoleDialog)) {
        MessageToast.show("Por favor complete todos los campos requeridos.");
        return;
      }
      const oNewRole = this._createRoleDialog.getModel("newRole").getData();
      const oModel   = this.getView().getModel();
      const aRoles   = oModel.getProperty("/Roles") || [];
      const newIndex = aRoles.length + 1;
      oNewRole.ROLEID = "role" + String(newIndex).padStart(3, "0");
      aRoles.push(oNewRole);
      oModel.setProperty("/Roles", aRoles);
      MessageToast.show("Rol creado exitosamente.");
      this._createRoleDialog.close();
    },

    onCancelCreate: function () {
      this._resetValidationState(this._createRoleDialog);
      this._createRoleDialog.close();
    },


    /********** EDITAR (MODIFICAR) **********/
    onEditPress: function () {
      const oTable = this.byId("rolesTableMgmt");
      const aSel   = oTable.getSelectedIndices();
      if (aSel.length === 0) {
        MessageToast.show("Seleccione un rol para editar.");
        return;
      }
      const iIndex = aSel[0];
      this._editRolePath = `/Roles/${iIndex}`;

      if (!this._editRoleDialog) {
        Fragment.load({
          name: "com.ccnay.jagsapinv.sapfiori.view.roles.components.EditRoleDialog",
          controller: this
        }).then(function (oDialog) {
          this._editRoleDialog = oDialog;
          this.getView().addDependent(oDialog);
          this._prepareEditDialog(iIndex);
        }.bind(this));
      } else {
        this._prepareEditDialog(iIndex);
      }
    },

    _prepareEditDialog: function (iIndex) {
      const oModel = this.getView().getModel();
      const oData  = Object.assign({}, oModel.getProperty(this._editRolePath));
      const oEditModel = new JSONModel(oData);
      oEditModel.setDefaultBindingMode(BindingMode.TwoWay);
      this._editRoleDialog.setModel(oEditModel, "editRole");
      this._editRoleDialog.open();
    },

    onConfirmEdit: function () {
      if (!this._validateForm(this._editRoleDialog)) {
        MessageToast.show("Por favor complete todos los campos requeridos.");
        return;
      }
      const oEditData = this._editRoleDialog.getModel("editRole").getData();
      const oModel    = this.getView().getModel();
      oModel.setProperty(this._editRolePath, oEditData);
      MessageToast.show("Rol actualizado exitosamente.");
      this._editRoleDialog.close();
    },

    onCancelEdit: function () {
      this._resetValidationState(this._editRoleDialog);
      this._editRoleDialog.close();
    },


    /********** SELECCIÓN EN TABLA **********/
    onTableSelectionChange: function (oEvent) {
      const bSelected = this.byId("rolesTableMgmt").getSelectedIndices().length > 0;
      this.byId("editButtonMgmt").setEnabled(bSelected);
      this.byId("deleteButtonMgmt").setEnabled(bSelected);
    },


    /********** ELIMINAR **********/
  onDeletePress: function () {
      const oTable = this.byId("rolesTableMgmt");
      const aSel   = oTable.getSelectedIndices();
      if (aSel.length === 0) {
        MessageToast.show("Seleccione un rol para eliminar.");
        return;
      }
      const iIndex = aSel[0];
      const oModel = this.getView().getModel();
      const aRoles = oModel.getProperty("/Roles") || [];

      MessageBox.show(
        "¿Qué tipo de eliminación deseas?\n\n" +
        "• Físico\n" +
        "• Lógico",
        {
          icon: MessageBox.Icon.QUESTION,
          title: "Tipo de eliminación",
          actions: [
            "Físico",
            "Lógico",
            MessageBox.Action.CANCEL
          ],
          initialFocus: "Físico",
          onClose: function (sAction) {
            if (sAction === "Físico") {
              // Eliminación física
              aRoles.splice(iIndex, 1);
              oModel.setProperty("/Roles", aRoles);
              MessageToast.show("Rol eliminado de la tabla.");
            }
            else if (sAction === "Lógico") {
              // Eliminación lógica
              oModel.setProperty(`/Roles/${iIndex}/ACTIVED`, false);
              oModel.setProperty(`/Roles/${iIndex}/DELETED`, true);
              MessageToast.show("Rol desactivado y marcado como eliminado.");
            }
        else if (sAction === "Lógico") {
          // Solo marcar eliminado
          oModel.setProperty(`/Roles/${iIndex}/DELETED`, true);
          MessageToast.show("Rol marcado como eliminado.");
        }
      }
    }
  );
},



    /********** VALIDACIÓN Y RESET **********/
    _validateForm: function (oDialog) {
      let isValid = true;
      const aContent = oDialog.getContent();
      if (!aContent.length) return true;
      const oForm = aContent[0];
      if (!oForm.isA("sap.ui.layout.form.SimpleForm")) return true;

      oForm.getContent().forEach(oControl => {
        if (!oControl.getMetadata().hasProperty("value")) return;
        if (oControl.getRequired && oControl.getRequired()) {
          const sValue = oControl.getValue?.().trim();
          if (!sValue) {
            oControl.setValueState("Error");
            oControl.setValueStateText("Campo requerido");
            isValid = false;
          } else {
            oControl.setValueState("None");
          }
        }
      });
      return isValid;
    },

    _resetValidationState: function (oDialog) {
      const oForm = oDialog.getContent()[0];
      if (!oForm.isA("sap.ui.layout.form.SimpleForm")) return;
      oForm.getContent().forEach(oControl => {
        if (oControl.setValueState) {
          oControl.setValueState("None");
        }
      });
    },


    /********** PAGINACIÓN (placeholders) **********/
    onPreviousPage: function () {
      MessageToast.show("Ir a la página anterior (pendiente)");
    },
    onNextPage: function () {
      MessageToast.show("Ir a la página siguiente (pendiente)");
    }

  });
});
