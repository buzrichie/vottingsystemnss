const XLSX = require("xlsx");
const Voter = require("../models/Voter");
const bcrypt = require("bcryptjs");

// --- Read and Add Users from processed_data.xlsx ---
async function voterToDB(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const votersDataFromExcel = XLSX.utils.sheet_to_json(worksheet);

    const bulkOps = [];
    const updatedData = [];

    for (const voterData of votersDataFromExcel) {
      // Generate a random password
      const plainPassword = Math.random().toString(36).slice(-8);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      // Create the database insert operation
      bulkOps.push({
        insertOne: {
          document: {
            nssNumber: voterData["NSS NUMBER"],
            password: hashedPassword,
            hasVoted: false,
          },
        },
      });

      // Store plain password for Excel export
      updatedData.push({
        ...voterData,
        Password: plainPassword,
      });
    }

    // Bulk insert to database
    await Voter.bulkWrite(bulkOps, { ordered: false });

    // Write updated data (with plain passwords) to a new Excel file
    const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Updated Voters");
    XLSX.writeFile(newWorkbook, "NSS_Demo_Voters_with_passwords.xlsx");

    console.log(
      `${bulkOps.length} voters added to DB and exported to voters_with_passwords.xlsx`
    );
  } catch (error) {
    console.error("Error processing data:", error);
  }
}

module.exports = voterToDB;
