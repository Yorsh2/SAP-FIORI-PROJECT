<<<<<<< HEAD
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

        // Crear Valor
        onCreatePress: function () {
            if (!this._createDialog) {
                Fragment.load({
                    name: "com.ccnay.jagsapinv.sapfiori.view.values.components.CreateValueDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._createDialog = oDialog;
                    this.getView().addDependent(this._createDialog);
                    this._prepareCreateDialog();
                }.bind(this));
            } else {
                this._prepareCreateDialog();
            }
        },

        _prepareCreateDialog: function () {
            const oNewValueModel = new JSONModel({
                LABELID: "",
                VALUEID: "",
                VALUE: "",
                ALIAS: "",
                SEQUENCE: "",
                IMAGE: "",
                DESCRIPTION: "",
                DETAIL_ROW: {
                    DETAIL_ROW_REG: [{
                        REGDATE: new Date(),
                        REGUSER: ""
                    }]
                }
            });

            oNewValueModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
            this._createDialog.setModel(oNewValueModel, "newValue");
            this._createDialog.open();
        },

        onConfirmCreate: function () {
            if (!this._validateForm(this._createDialog)) {
                MessageToast.show("Por favor complete todos los campos requeridos.");
                return;
            }

            const oNewValue = this._createDialog.getModel("newValue").getData();
            const oModel = this.getView().getModel();
            const aValues = oModel.getProperty("/Values") || [];

            // ID simple autogenerado
            const newId = (aValues.length > 0)
                ? (Math.max(...aValues.map(item => parseInt(item.VALUEID) || 0)) + 1).toString()
                : "1";

            oNewValue.VALUEID = newId;

            // Formatear fecha
            if (oNewValue.DETAIL_ROW.DETAIL_ROW_REG[0].REGDATE instanceof Date) {
                oNewValue.DETAIL_ROW.DETAIL_ROW_REG[0].REGDATE = this._formatDate(oNewValue.DETAIL_ROW.DETAIL_ROW_REG[0].REGDATE);
            }

            aValues.push(oNewValue);
            oModel.setProperty("/Values", aValues);

            MessageToast.show("Valor creado exitosamente.");
            this._createDialog.close();
        },


                onEditPress: function () {
            const oTable = this.byId("ManagementValues_tblValues");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("Por favor, selecciona un valor para editar.");
                return;
            }

            const oContext = oSelectedItem.getBindingContext();
            this._editValuePath = oContext.getPath();

            const oData = oContext.getModel().getProperty(this._editValuePath);
            const oClonedData = JSON.parse(JSON.stringify(oData)); // Clonar para evitar edición directa

            const oEditModel = new JSONModel(oClonedData);
            oEditModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);

            if (!this._editDialog) {
                Fragment.load({
                    name: "com.ccnay.jagsapinv.sapfiori.view.values.components.EditValueDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._editDialog = oDialog;
                    this.getView().addDependent(this._editDialog);
                    this._editDialog.setModel(oEditModel, "editValue");
                    this._editDialog.open();
                }.bind(this));
            } else {
                this._editDialog.setModel(oEditModel, "editValue");
                this._editDialog.open();
            }
        },

        onCancelCreate: function () {
            this._resetValidationState(this._createDialog);
            this._createDialog.close();
        },

        // Eliminar Valor
        onDeletePress: function () {
            const oTable = this.byId("ManagementValues_tblValues");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("Por favor, selecciona un valor para eliminar.");
                return;
            }

            this._valueToDeletePath = oSelectedItem.getBindingContext().getPath();

            if (!this._deleteDialog) {
                Fragment.load({
                    name: "com.ccnay.jagsapinv.sapfiori.view.values.components.DeleteConfirmDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._deleteDialog = oDialog;
                    this.getView().addDependent(this._deleteDialog);
                    this._deleteDialog.open();
                }.bind(this));
            } else {
                this._deleteDialog.open();
            }
        },

        onConfirmDelete: function () {
            if (!this._valueToDeletePath) {
                this._deleteDialog.close();
                return;
            }

            const oModel = this.getView().getModel();
            const aValues = oModel.getProperty("/Values");
            const iIndex = parseInt(this._valueToDeletePath.split("/")[2]);

            if (iIndex >= 0 && iIndex < aValues.length) {
                aValues.splice(iIndex, 1);
                oModel.setProperty("/Values", aValues);
                MessageToast.show("Valor eliminado correctamente.");
            } else {
                MessageBox.error("No se pudo eliminar el valor.");
            }

            this._deleteDialog.close();
            this._valueToDeletePath = null;
        },

        onCancelDelete: function () {
            this._deleteDialog.close();
            this._valueToDeletePath = null;
        },

        // Validación de formulario (usado en creación y edición)
        _validateForm: function (oDialog) {
            let isValid = true;
            const aContent = oDialog.getContent();
            if (!aContent || aContent.length === 0) return true;

            const oForm = aContent[0];
            if (!oForm.isA("sap.ui.layout.form.SimpleForm")) return true;

            const aElements = oForm.getContent();
            aElements.forEach(oControl => {
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
            const aElements = oForm.getContent();

            aElements.forEach(oControl => {
                if (oControl.setValueState) {
                    oControl.setValueState("None");
                }
            });
        },

        _formatDate: function (oDate) {
            const year = oDate.getFullYear();
            const month = String(oDate.getMonth() + 1).padStart(2, '0');
            const day = String(oDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        onTableSelectionChange: function (oEvent) {
            const bHasSelection = !!oEvent.getSource().getSelectedItem();
            this.byId("ManagementValues_btnEdit").setEnabled(bHasSelection);
            this.byId("ManagementValues_btnDelete").setEnabled(bHasSelection);
        }

    });
});
=======
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

        // Crear Valor
        onCreatePress: function () {
            if (!this._createDialog) {
                Fragment.load({
                    name: "com.ccnay.jagsapinv.sapfiori.view.values.components.CreateValueDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._createDialog = oDialog;
                    this.getView().addDependent(this._createDialog);
                    this._prepareCreateDialog();
                }.bind(this));
            } else {
                this._prepareCreateDialog();
            }
        },

        _prepareCreateDialog: function () {
            const oNewValueModel = new JSONModel({
                LABELID: "",
                VALUEID: "",
                VALUE: "",
                ALIAS: "",
                SEQUENCE: "",
                IMAGE: "",
                DESCRIPTION: "",
                DETAIL_ROW: {
                    DETAIL_ROW_REG: [{
                        REGDATE: new Date(),
                        REGUSER: ""
                    }]
                }
            });

            oNewValueModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
            this._createDialog.setModel(oNewValueModel, "newValue");
            this._createDialog.open();
        },

        onConfirmCreate: function () {
            if (!this._validateForm(this._createDialog)) {
                MessageToast.show("Por favor complete todos los campos requeridos.");
                return;
            }

            const oNewValue = this._createDialog.getModel("newValue").getData();
            const oModel = this.getView().getModel();
            const aValues = oModel.getProperty("/Values") || [];

            // ID simple autogenerado
            const newId = (aValues.length > 0)
                ? (Math.max(...aValues.map(item => parseInt(item.VALUEID) || 0)) + 1).toString()
                : "1";

            oNewValue.VALUEID = newId;

            // Formatear fecha
            if (oNewValue.DETAIL_ROW.DETAIL_ROW_REG[0].REGDATE instanceof Date) {
                oNewValue.DETAIL_ROW.DETAIL_ROW_REG[0].REGDATE = this._formatDate(oNewValue.DETAIL_ROW.DETAIL_ROW_REG[0].REGDATE);
            }

            aValues.push(oNewValue);
            oModel.setProperty("/Values", aValues);

            MessageToast.show("Valor creado exitosamente.");
            this._createDialog.close();
        },

        onCancelCreate: function () {
            this._resetValidationState(this._createDialog);
            this._createDialog.close();
        },

        // Eliminar Valor
        onDeletePress: function () {
            const oTable = this.byId("ManagementValues_tblValues");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("Por favor, selecciona un valor para eliminar.");
                return;
            }

            this._valueToDeletePath = oSelectedItem.getBindingContext().getPath();

            if (!this._deleteDialog) {
                Fragment.load({
                    name: "com.ccnay.jagsapinv.sapfiori.view.values.components.DeleteConfirmDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._deleteDialog = oDialog;
                    this.getView().addDependent(this._deleteDialog);
                    this._deleteDialog.open();
                }.bind(this));
            } else {
                this._deleteDialog.open();
            }
        },

        onConfirmDelete: function () {
            if (!this._valueToDeletePath) {
                this._deleteDialog.close();
                return;
            }

            const oModel = this.getView().getModel();
            const aValues = oModel.getProperty("/Values");
            const iIndex = parseInt(this._valueToDeletePath.split("/")[2]);

            if (iIndex >= 0 && iIndex < aValues.length) {
                aValues.splice(iIndex, 1);
                oModel.setProperty("/Values", aValues);
                MessageToast.show("Valor eliminado correctamente.");
            } else {
                MessageBox.error("No se pudo eliminar el valor.");
            }

            this._deleteDialog.close();
            this._valueToDeletePath = null;
        },

        onCancelDelete: function () {
            this._deleteDialog.close();
            this._valueToDeletePath = null;
        },

        // Validación de formulario (usado en creación y edición)
        _validateForm: function (oDialog) {
            let isValid = true;
            const aContent = oDialog.getContent();
            if (!aContent || aContent.length === 0) return true;

            const oForm = aContent[0];
            if (!oForm.isA("sap.ui.layout.form.SimpleForm")) return true;

            const aElements = oForm.getContent();
            aElements.forEach(oControl => {
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
            const aElements = oForm.getContent();

            aElements.forEach(oControl => {
                if (oControl.setValueState) {
                    oControl.setValueState("None");
                }
            });
        },

        _formatDate: function (oDate) {
            const year = oDate.getFullYear();
            const month = String(oDate.getMonth() + 1).padStart(2, '0');
            const day = String(oDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        onTableSelectionChange: function (oEvent) {
            const bHasSelection = !!oEvent.getSource().getSelectedItem();
            this.byId("ManagementValues_btnEdit").setEnabled(bHasSelection);
            this.byId("ManagementValues_btnDelete").setEnabled(bHasSelection);
        }

    });
});

