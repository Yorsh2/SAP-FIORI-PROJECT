sap.ui.define([
    "com/ccnay/jagsapinv/sapfiori/controller/BaseController",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict";

    return BaseController.extend("com.ccnay.jagsapinv.sapfiori.controller.users.pages.Login", {
        onInit: function () {
            // Inicialización si es necesaria
        },

        onLoginPress: function () {
            var oUsername = this.byId("usernameInput").getValue();
            var oPassword = this.byId("passwordInput").getValue();

            // Validación básica
            if (!oUsername || !oPassword) {
                MessageToast.show("Por favor ingrese usuario y contraseña");
                return;
            }

            // Aquí iría la lógica real de autenticación
            MessageToast.show("Inicio de sesión exitoso (simulado)");

            // Navegar a la página principal después del login
            this.getRouter().navTo("RouteUsers");
        }
    });
});