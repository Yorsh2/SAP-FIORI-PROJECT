sap.ui.define([
    "com/ccnay/jagsapinv/sapfiori/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Fragment, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.ccnay.jagsapinv.sapfiori.controller.users.pages.ManagementUsers", {



        onInit: function () {
            const oModel = new JSONModel();
            oModel.loadData("./resources/jsons/ManagementUsers.json");
            this.getView().setModel(oModel);
        },

        // Crear usuario

        onCreatePress: function () {
            if (!this._createUserDialog) {
                Fragment.load({
                    name: "com.ccnay.jagsapinv.sapfiori.view.users.components.CreateUserDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._createUserDialog = oDialog;
                    this.getView().addDependent(this._createUserDialog);
                    this._prepareCreateDialog();
                }.bind(this));
            } else {
                this._prepareCreateDialog();
            }
        },

        _prepareCreateDialog: function () {
            // Creamos el modelo para los datos del nuevo usuario con valores por defecto
            const oNewUserModel = new JSONModel({
                nombre: "",
                apellido: "",
                email: "",
                departamento: "",
                cargo: "",
                fechaIngreso: new Date(), // Fecha actual por defecto
                estado: "Activo"
            });
            oNewUserModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);

            // Asignamos el modelo al fragmento con nombre 'newUser'
            this._createUserDialog.setModel(oNewUserModel, "newUser");

            // Abrimos el diálogo
            this._createUserDialog.open();
        },

        onConfirmCreate: function () {
            // Validar los campos requeridos
            if (!this._validateUserForm()) {
                MessageToast.show("Por favor complete todos los campos requeridos.");
                return;
            }

            const oNewUserModel = this._createUserDialog.getModel("newUser");
            const oData = oNewUserModel.getData();

            // Obtener el modelo principal
            const oViewModel = this.getView().getModel();

            // Obtener los usuarios actuales desde el modelo
            const aUsers = oViewModel.getProperty("/Users") || [];

            // Generar un nuevo ID (simple incremento)
            const newId = (aUsers.length > 0) ?
                (Math.max(...aUsers.map(user => parseInt(user.id))) + 1).toString() :
                "1";

            // Añadir ID al nuevo usuario
            oData.id = newId;

            // Formatear la fecha si es un objeto Date
            if (oData.fechaIngreso instanceof Date) {
                oData.fechaIngreso = this._formatDate(oData.fechaIngreso);
            }

            // Añadir el nuevo usuario al arreglo de usuarios
            aUsers.push(oData);

            // Actualizar el modelo
            oViewModel.setProperty("/Users", aUsers);

            // Mostrar un mensaje de éxito
            MessageToast.show("Usuario creado exitosamente.");

            // Cerrar el diálogo
            this._createUserDialog.close();
        },

        _validateUserForm: function () {
            let isValid = true;

            // Función para validar un control
            const validateControl = function (oControl) {
                if (!oControl || !oControl.getRequired || !oControl.getRequired()) {
                    return true;
                }

                let sValue;
                let hasGetValueMethod = false;

                // Verificar qué método usar para obtener el valor
                if (oControl.getValue && typeof oControl.getValue === "function") {
                    sValue = oControl.getValue();
                    hasGetValueMethod = true;
                } else if (oControl.getSelectedKey && typeof oControl.getSelectedKey === "function") {
                    sValue = oControl.getSelectedKey();
                    hasGetValueMethod = true;
                } else if (oControl.getSelectedItem && typeof oControl.getSelectedItem === "function") {
                    const oItem = oControl.getSelectedItem();
                    sValue = oItem ? oItem.getKey() : "";
                    hasGetValueMethod = true;
                }

                // Solo validar si encontramos un método para obtener el valor
                if (hasGetValueMethod) {
                    if (!sValue || sValue.trim() === "") {
                        oControl.setValueState("Error");
                        oControl.setValueStateText("Campo requerido");
                        return false;
                    } else {
                        oControl.setValueState("None");
                        return true;
                    }
                }

                return true;
            };

            // Obtener el contenido del diálogo
            const aDialogContent = this._createUserDialog.getContent();
            if (aDialogContent && aDialogContent.length > 0) {
                const oForm = aDialogContent[0];

                // Si es un SimpleForm, validar sus elementos
                if (oForm.isA("sap.ui.layout.form.SimpleForm")) {
                    const aFormContent = oForm.getContent();

                    // Iterar por los elementos del formulario
                    for (let i = 0; i < aFormContent.length; i++) {
                        const oControl = aFormContent[i];

                        // Saltar Labels y otros controles que no son de entrada
                        if (oControl.isA("sap.m.Label") || !oControl.getMetadata().hasProperty("value")) {
                            continue;
                        }

                        // Validar el control
                        if (!validateControl(oControl)) {
                            isValid = false;
                        }
                    }
                }
            }

            return isValid;
        },

        _formatDate: function (oDate) {
            // Formato YYYY-MM-DD para almacenar en el modelo
            const year = oDate.getFullYear();
            const month = String(oDate.getMonth() + 1).padStart(2, '0');
            const day = String(oDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        onCancelCreate: function () {
            // Restablecer estados de validación
            const oForm = this._createUserDialog.getContent()[0];
            const aFormElements = oForm.getContent();

            for (let i = 0; i < aFormElements.length; i++) {
                const oControl = aFormElements[i];
                if (oControl.setValueState) {
                    oControl.setValueState("None");
                }
            }

            this._createUserDialog.close();
        },

        //  Eliminar un usuario
        // Método para manejar el clic en el botón Eliminar
        onDeletePress: function () {
            // Obtener la tabla
            var oTable = this.byId("ManagementUsers_tblUsers");

            // Obtener el ítem seleccionado
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                // No hay ítem seleccionado, mostrar mensaje
                sap.m.MessageToast.show("Por favor, selecciona un usuario para eliminar");
                return;
            }

            // Guardar el contexto del ítem seleccionado para usarlo en la confirmación
            this._userToDeletePath = oSelectedItem.getBindingContext().getPath();

            // Cargar y mostrar el diálogo de confirmación
            if (!this._deleteDialog) {
                Fragment.load({
                    name: "com.ccnay.jagsapinv.sapfiori.view.users.components.DeleteConfirmDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._deleteDialog = oDialog;
                    this.getView().addDependent(this._deleteDialog);

                    // Mostrar información del usuario a eliminar
                    var oModel = this.getView().getModel();
                    var oUserData = oModel.getProperty(this._userToDeletePath);

                    var oConfirmText = sap.ui.getCore().byId("DeleteUser_ConfirmText");
                    oConfirmText.setText("¿Estás seguro de que deseas eliminar al usuario " +
                        oUserData.nombre + " " + oUserData.apellido + "?");

                    this._deleteDialog.open();
                }.bind(this));
            } else {
                // El diálogo ya existe, actualizar el texto y abrirlo
                var oModel = this.getView().getModel();
                var oUserData = oModel.getProperty(this._userToDeletePath);

                var oConfirmText = sap.ui.getCore().byId("DeleteUser_ConfirmText");
                oConfirmText.setText("¿Estás seguro de que deseas eliminar al usuario " +
                    oUserData.nombre + " " + oUserData.apellido + "?");

                this._deleteDialog.open();
            }
        },

        // Método para confirmar la eliminación
        onConfirmDelete: function () {
            // Verificar que tenemos un usuario para eliminar
            if (!this._userToDeletePath) {
                this._deleteDialog.close();
                return;
            }

            // Obtener el modelo y los datos
            var oModel = this.getView().getModel();
            var sUserPath = this._userToDeletePath;

            // Obtener el índice del usuario a eliminar
            var aUsers = oModel.getProperty("/Users");
            var iIndex = parseInt(sUserPath.split("/")[2]); // Obtiene el índice del path "/Users/X"

            // Eliminar el usuario del array
            if (iIndex >= 0 && iIndex < aUsers.length) {
                aUsers.splice(iIndex, 1);

                // Actualizar el modelo
                oModel.setProperty("/Users", aUsers);

                // Mostrar mensaje de éxito
                sap.m.MessageToast.show("Usuario eliminado correctamente");
            } else {
                // Índice fuera de rango, mostrar error
                sap.m.MessageBox.error("No se pudo eliminar el usuario");
            }

            // Cerrar el diálogo y limpiar la referencia
            this._deleteDialog.close();
            this._userToDeletePath = null;
        },

        // Método para cancelar la eliminación
        onCancelDelete: function () {
            // Cerrar el diálogo y limpiar la referencia
            this._deleteDialog.close();
            this._userToDeletePath = null;
        },

        // Método para deshacer la última eliminación
        onUndoDelete: function () {
            if (!this._lastDeletedUser) {
                return;
            }

            try {
                // Obtener el modelo y los datos
                var oModel = this.getView().getModel();
                var aUsers = oModel.getProperty("/Users");

                // Restaurar el usuario en su posición original
                aUsers.splice(this._lastDeletedUser.index, 0, this._lastDeletedUser.data);

                // Actualizar el modelo
                oModel.setProperty("/Users", aUsers);

                // Mostrar mensaje
                sap.m.MessageToast.show("Se ha restaurado el usuario");

                // Limpiar la referencia
                this._lastDeletedUser = null;
            } catch (error) {
                console.error("Error al restaurar usuario:", error);
                sap.m.MessageBox.error("No se pudo restaurar el usuario");
            }
        },

        // Método para habilitar/deshabilitar botones según la selección
        onTableSelectionChange: function (oEvent) {
            var bHasSelection = !!oEvent.getSource().getSelectedItem();

            // Habilitar/deshabilitar botones que requieren selección
            this.byId("ManagementUsers_btnEdit").setEnabled(bHasSelection);
            this.byId("ManagementUsers_btnDelete").setEnabled(bHasSelection);
        }

    });
});