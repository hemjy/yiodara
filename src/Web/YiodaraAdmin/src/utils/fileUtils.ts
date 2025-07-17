import * as XLSX from 'xlsx';

/**
 * Exports an array of objects to an Excel file.
 * @param data The data to export.
 * @param fileName The name of the file to create (without extension).
 */
export const exportToExcel = (data: any[], fileName: string): void => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert the data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Write the workbook to a file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}; 