const XLSX = require("xlsx");

try {
  const workbook = XLSX.readFile(
    "C:\\Users\\AnyRicmo\\Documents\\voting system\\backend\\utils\\NOMINAL_ROLL_FOR_ALL_2024.xlsx"
  );
  const sheetNames = workbook.SheetNames;

  let extractedData = [];
  sheetNames.forEach((sheetName) => {
    const workSheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(workSheet);
    console.log(`--- Data from Sheet: ${sheetName} ---`);
    extractedData.push(...data);
  });

  let userWithNSSNumber = new Map();
  extractedData.forEach((data, k) => {
    if (data["NSS NUMBER"]) {
      userWithNSSNumber.set(data["NSS NUMBER"], data);
    }
  });

  // Convert the Map values back to an array of objects
  const newDataToWrite = Array.from(userWithNSSNumber.values());

  // Create a new workbook
  const newWorkbook = XLSX.utils.book_new();

  // Convert the array of objects to a worksheet
  const newWorksheet = XLSX.utils.json_to_sheet(newDataToWrite);

  // Add the worksheet to the new workbook
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Processed Data"); // 'Processed Data' is the name of the new sheet

  // Write the new workbook to a new Excel file
  const outputFilePath = "NSS_AWUTU_SENYA_EAST_MUNICIPAL_NominalRoll.xlsx"; // Choose your desired output file name
  XLSX.writeFile(newWorkbook, outputFilePath);

  console.log(`Successfully wrote processed data to ${outputFilePath}`);
} catch (error) {
  console.error(error);
}
