function doGet(e) {
  // 修改為 API 模式：GET 請求僅回傳服務狀態
  var result = {
    status: 'success',
    service: 'Union Reimbursement API',
    message: 'Service is running. Please use POST method to submit data.'
  };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // 處理外部 POST 請求
  try {
    // 1. 解析傳入的資料 (預期為 JSON 格式)
    var data = null;

    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error("No data received or invalid format");
    }

    // 2. 調用核心處理邏輯
    var result = processForm(data);

    // 3. 回傳執行結果
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 錯誤處理
    var errorResponse = {
      status: 'error',
      message: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function processForm(data) {
  try {
    // 1. Config
    var SHEET_ID = '1adOaIjOYsb0s1v66u9gFB9_CB4LSz_mtZ0LWG0ztTHw';
    var FOLDER_ID = '1RgCE1-WPhG2UNPm0toprZsupun0sNEsH';

    // 2. Data Extraction
    // 確保前端傳送的 JSON 包含這些欄位
    var date = data.date; // "YYYY-MM-DD"
    var category = data.category;
    var usage = data.usage;
    var amount = data.amount;
    var payer = data.payer;

    // Date formatting for filename (remove dashes)
    var dateStr = date ? date.replace(/-/g, '') : 'NODATE';

    // 3. File Processing
    var fileUrl = '';
    if (data.fileContent && data.fileName) {
      var folder = DriveApp.getFolderById(FOLDER_ID);
      var blob = Utilities.newBlob(Utilities.base64Decode(data.fileContent), data.mimeType, data.fileName);

      // Construct new filename
      // Logic: YYYYMMDD_Category_Usage_Amount_Payer
      var originalExtension = "";
      if (data.fileName.indexOf(".") !== -1) {
        originalExtension = data.fileName.substr(data.fileName.lastIndexOf("."));
      }

      var newFileName = dateStr + "_" + category + "_" + usage + "_" + amount + "_" + payer + originalExtension;
      blob.setName(newFileName);

      var file = folder.createFile(blob);
      fileUrl = file.getUrl();
    }

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

    return { status: 'success', message: 'Submitted successfully', fileUrl: fileUrl };

  } catch (error) {
    Logger.log(error);
    // 將錯誤向外拋出，由 doPost 捕獲
    throw error;
  }
}
