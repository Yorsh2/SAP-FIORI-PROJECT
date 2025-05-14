sap.ui.define([
    "com/ccnay/jagsapinv/sapfiori/controller/BaseController", // Controlador base con funciones comunes
    "sap/ui/model/json/JSONModel",                                    // Modelo para manejar datos JSON
    "sap/ui/util/Storage",                                             // Utilidad para manejo de almacenamiento (no se usa en este bloque)
    "sap/ui/core/BusyIndicator",                                       // Indicador visual para procesos en curso
    "sap/m/MessageToast",                                              // Componente para mostrar mensajes tipo toast
    "sap/base/Log",                                                    // Herramienta de logging (no se utiliza en el bloque actual)
    "sap/ui/core/library"                                              // Biblioteca adicional de SAPUI5
], function (BaseController, JSONModel, Storage, BusyIndicator, MessageToast) {
    "use strict";

    return BaseController.extend("com.ccnay.jagsapinv.sapfiori.controller.users.pages.UsersMainTable", {
        onInit: function () {
            let oRouter = this.getRouter();
            oRouter.getRoute("RouteUsers").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: async function (oEvent) {
            // Mostrar el indicador de carga
            BusyIndicator.show(0);

            // Obtener la referencia a la tabla en la vista
            const oTable = this.byId("IdTable1UsersMainTable");
            // Crear un modelo JSON vacío
            const oModel = new JSONModel();

            // Cargar datos desde el archivo local ubicado en "resources/jsons/users.json"
            oModel.loadData('./resources/jsons/users.json'); //Esta es la parte donde obtinen los datos estaticos del json

            // Cuando la carga se complete exitosamente, se asigna el modelo a la tabla
            oModel.attachRequestCompleted((oEvent) => {
                if (oEvent.getParameter("success")) {
                    oTable.setModel(oModel);
                } else {
                    MessageToast.show("Error al cargar los datos.");
                }
                // Ocultar el indicador de carga
                BusyIndicator.hide();
            });

            // Si falla la carga del archivo, se muestra un mensaje de error y se oculta el indicador de carga
            oModel.attachRequestFailed(() => {
                MessageToast.show("No se pudo cargar el archivo JSON.");
                BusyIndicator.hide();
            });
        }

        //*FIC: Others Events Controllers
        // Aquí se podrían agregar otros métodos y eventos según se requiera

    });
});