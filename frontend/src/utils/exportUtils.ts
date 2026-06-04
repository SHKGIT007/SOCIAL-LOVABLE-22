import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Common utility to export JSON data to Excel
 * @param data Array of objects to be exported
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the sheet in Excel
 */
export const downloadExcel = (data: any[], fileName: string, sheetName: string = "Data") => {
  if (!data || data.length === 0) return;
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf]), `${fileName}.xlsx`);
};
