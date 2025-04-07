import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportDevices = (rows) => {
  if (rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  // Formatear los datos para la exportación
  const exportData = rows.map((device) => ({
    ID: device.id,
    CÓDIGO: device.code,
    MARCA: device.brand,
    MODELO: device.model,
    SERIAL: device.serial,
    ESPECIFICACIONES: device.specification,
    TIPO: device.type,
    PRECIO: new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(device.price), // Formato de moneda
    ESTADO: device.status,
    UBICACIÓN: device.location,
  }));

  // Crear hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Crear libro de trabajo y agregar la hoja de datos
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dispositivos");

  // Generar archivo Excel y descargarlo
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(data, "dispositivos.xlsx");
};

export { exportDevices };
