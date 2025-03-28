import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportDevices = (rows) => {
  if (rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const exportData = rows.map((device) => ({
    "ID": device.id,
    "CÓDIGO": device.code,
    "NOMBRE": device.name,
    "SERIAL": device.serial,
    "ESPECIFICACIONES": device.specification,
    "TIPO": device.type,
    "PRECIO": device.price,
    "ESTADO": device.status,
    "UBICACIÓN": device.location,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData, { origin: "A2" });

  // Agregar estilos a los encabezados (Cursiva)
  const header = Object.keys(exportData[0]);
  XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: "A1" });

  // Aplicar estilos a los encabezados
  header.forEach((col, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
    if (!worksheet[cellRef]) worksheet[cellRef] = {};
    worksheet[cellRef].s = { font: { italic: true } }; // Cursiva
  });

  // Crear libro de trabajo y exportar
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dispositivos");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(data, "dispositivos.xlsx");
};
