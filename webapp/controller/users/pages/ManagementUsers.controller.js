sap.ui.define([
    "com/ccnay/jagsapinv/sapfiori/controller/BaseController",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict";

    return BaseController.extend("com.ccnay.jagsapinv.sapfiori.controller.users.pages.ManagementUsers", {
        onInit: function () {
            // Podrías cargar datos aquí si es necesario
        },

        onCreatePress: function () {
            MessageToast.show("Crear usuario (simulado)");
        },

        onEditPress: function () {
            MessageToast.show("Editar usuario (simulado)");
        },

        onUpdatePress: function () {
            MessageToast.show("Actualizar datos (simulado)");
        },

        onDeletePress: function () {
            MessageToast.show("Eliminar usuario (simulado)");
        },

        onPreviousPage: function () {
            MessageToast.show("Página anterior (simulado)");
        },

        onNextPage: function () {
            MessageToast.show("Página siguiente (simulado)");
        }
    });
});
