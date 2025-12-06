function doGet(e) {
  // If you want to serve the HTML directly from the script
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('聯醫工會墊款請款單')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function processForm(data) {
  try {
    // 1. Config
    var SHEET_ID = '1adOaIjOYsb0s1v66u9gFB9_CB4LSz_mtZ0LWG0ztTHw';
    var FOLDER_ID = '1RgCE1-WPhG2UNPm0toprZsupun0sNEsH';
    
    // 2. Data Extraction
    var date = data.date; // "YYYY-MM-DD"
    var category = data.category;
    var usage = data.usage;
    var amount = data.amount;
    var payer = data.payer;
    
    // Date formatting for filename (remove dashes)
    var dateStr = date.replace(/-/g, '');
    
    // 3. File Processing
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var blob = Utilities.newBlob(Utilities.base64Decode(data.fileContent), data.mimeType, data.fileName);
    
    // Construct new filename
    // Logic: YYYYMMDD_Category_Usage_Amount_Payer
    // Note: We keep the original extension
    var originalExtension = "";
    if (data.fileName.indexOf(".") !== -1) {
      originalExtension = data.fileName.substr(data.fileName.lastIndexOf("."));
    }
    
    var newFileName = dateStr + "_" + category + "_" + usage + "_" + amount + "_" + payer + originalExtension;
    blob.setName(newFileName);
    
    var file = folder.createFile(blob);
    var fileUrl = file.getUrl();
    
    // 4. Sheet Recording
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0]; // Assumes first sheet
    // Append Row: [Timestamp, Date, Category, Usage, Amount, Payer, File URL]
    sheet.appendRow([
      new Date(),
      date,
      category,
      usage,
      amount,
      payer,
      fileUrl
    ]);
    
    return { status: 'success', message: 'Submitted successfully' };
    
  } catch (error) {
    Logger.log(error);
    return { status: 'error', message: error.toString() };
  }
}
