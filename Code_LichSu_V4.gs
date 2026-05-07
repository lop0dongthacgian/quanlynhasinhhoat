const CONFIG = {
  SPREADSHEET_ID: '1ap5mnQ2b7za2TGW4Yug3DOl7J2gOJHadruCiisMRLko', // ⚠️ THAY ID SHEET CỦA BẠN VÀO ĐÂY
  SHEET_NAMES: {
    DANG_KY:     'dang_ky',
    LICH_SU:     'lich_su',
    THUONG_XUYEN:'thuong_xuyen',
    HANG_THANG:  'hang_thang',
    TIN_NHAN:    'tin_nhan'   // [MỚI V4] Sheet lưu tin nhắn admin
  }
};

// ========================================
// HÀM SETUP BAN ĐẦU - CHẠY 1 LẦN ĐỂ TẠO SHEETS
// ========================================
function setup() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  let sheet1 = ss.getSheetByName(CONFIG.SHEET_NAMES.DANG_KY);
  if (!sheet1) {
    sheet1 = ss.insertSheet(CONFIG.SHEET_NAMES.DANG_KY);
    sheet1.appendRow(['ID', 'Thời gian đăng ký', 'Ngày (timestamp)', 'Buổi', 'Đơn vị', 'Nội dung', 'Trạng thái']);
    sheet1.getRange('A1:G1').setFontWeight('bold').setBackground('#4361ee').setFontColor('#ffffff');
  }

  let sheet2 = ss.getSheetByName(CONFIG.SHEET_NAMES.LICH_SU);
  if (!sheet2) {
    sheet2 = ss.insertSheet(CONFIG.SHEET_NAMES.LICH_SU);
    sheet2.appendRow(['ID', 'Thời gian đăng ký', 'Ngày (timestamp)', 'Buổi', 'Đơn vị', 'Nội dung', 'Trạng thái']);
    sheet2.getRange('A1:G1').setFontWeight('bold').setBackground('#22c55e').setFontColor('#ffffff');
  }

  let sheet3 = ss.getSheetByName(CONFIG.SHEET_NAMES.THUONG_XUYEN);
  if (!sheet3) {
    sheet3 = ss.insertSheet(CONFIG.SHEET_NAMES.THUONG_XUYEN);
    sheet3.appendRow(['ID', 'Thứ', 'Buổi', 'Nội dung']);
    sheet3.getRange('A1:D1').setFontWeight('bold').setBackground('#f59e0b').setFontColor('#ffffff');
  }

  let sheet4 = ss.getSheetByName(CONFIG.SHEET_NAMES.HANG_THANG);
  if (!sheet4) {
    sheet4 = ss.insertSheet(CONFIG.SHEET_NAMES.HANG_THANG);
    sheet4.appendRow(['ID', 'Ngày', 'Thứ', 'Buổi', 'Nội dung']);
    sheet4.getRange('A1:E1').setFontWeight('bold').setBackground('#8b5cf6').setFontColor('#ffffff');
  }

  // [MỚI V4] Tạo sheet tin_nhan nếu chưa có
  let sheet5 = ss.getSheetByName(CONFIG.SHEET_NAMES.TIN_NHAN);
  if (!sheet5) {
    sheet5 = ss.insertSheet(CONFIG.SHEET_NAMES.TIN_NHAN);
    sheet5.appendRow(['Thời gian cập nhật', 'Nội dung tin nhắn']);
    sheet5.getRange('A1:B1').setFontWeight('bold').setBackground('#ef476f').setFontColor('#ffffff');
    // Thêm 1 hàng trống mặc định (không có tin nhắn)
    sheet5.appendRow([new Date(), '']);
  }

  Logger.log('✅ Đã tạo xong tất cả sheets!');
}

// ========================================
// HÀM CHUYỂN ĐỔI NGÀY
// ========================================

/**
 * Chuyển ngày từ string "yyyy-mm-dd" sang timestamp số
 */
function dateStringToTimestamp(dateStr) {
  const parts = dateStr.split('-');
  const year  = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day   = parseInt(parts[2]);
  return new Date(year, month, day, 7, 0, 0).getTime();
}

/**
 * Chuyển timestamp số sang string "DD/MM/YYYY"
 * (Admin & index.html đều dùng định dạng này)
 */
function timestampToDisplayDate(timestamp) {
  if (!timestamp) return '';
  // Nếu đã là dạng DD/MM/YYYY thì trả luôn
  if (typeof timestamp === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(timestamp.trim())) {
    return timestamp.trim();
  }
  // Nếu là Date object từ Google Sheets
  if (timestamp instanceof Date) {
    const day   = String(timestamp.getDate()).padStart(2, '0');
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    const year  = timestamp.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // Nếu là timestamp số
  const num = Number(timestamp);
  if (isNaN(num) || num === 0) return '';
  const date  = new Date(num);
  const day   = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year  = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Chuyển timestamp số sang chuỗi hiển thị thời gian đăng ký
 * VD: "09/02/2026 08:30"
 */
function timestampToDisplayTime(timestamp) {
  if (!timestamp) return '';
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    const num = Number(timestamp);
    if (isNaN(num) || num === 0) return '';
    date = new Date(num);
  }
  const day    = String(date.getDate()).padStart(2, '0');
  const month  = String(date.getMonth() + 1).padStart(2, '0');
  const year   = date.getFullYear();
  const hour   = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

// ========================================
// HÀM XỬ LÝ WEB APP
// ========================================

function doGet(e) {
  const action = e.parameter.action;
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

    // ---- LẤY TOÀN BỘ DỮ LIỆU ----
    if (action === 'getData') {
      return createResponse({
        success:          true,
        dangKy:           getSheetData(ss, CONFIG.SHEET_NAMES.DANG_KY),
        lichSu:           getSheetData(ss, CONFIG.SHEET_NAMES.LICH_SU),
        thuongXuyen:      getSheetData(ss, CONFIG.SHEET_NAMES.THUONG_XUYEN),
        hangThang:        getSheetData(ss, CONFIG.SHEET_NAMES.HANG_THANG),
        tinNhan:          docTinNhan(ss),            // tin mới nhất (cho index.html)
        danhSachTinNhan:  docDanhSachTinNhan(ss)     // toàn bộ danh sách (cho admin.html)
      });
    }

    // ---- DUYỆT ĐĂNG KÝ ----
    if (action === 'duyetDangKy') {
      return duyetDangKy(ss, e.parameter.id);
    }

    // ---- XÓA LỊCH ----
    if (action === 'xoaLich') {
      return xoaLich(ss, e.parameter.sheet, e.parameter.id);
    }

    // ---- THÊM LỊCH HÀNG TUẦN ----
    if (action === 'themThuongXuyen') {
      const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.THUONG_XUYEN);
      if (!sheet) return createResponse({ success: false, error: 'Sheet thuong_xuyen không tồn tại' });
      const id = Date.now();
      sheet.appendRow([id, e.parameter.thu, e.parameter.buoi, e.parameter.nd]);
      SpreadsheetApp.flush();
      return createResponse({ success: true, message: 'Đã thêm lịch hàng tuần', id: id });
    }

    // ---- THÊM LỊCH HÀNG THÁNG ----
    if (action === 'themHangThang') {
      const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.HANG_THANG);
      if (!sheet) return createResponse({ success: false, error: 'Sheet hang_thang không tồn tại' });
      const id = Date.now();
      sheet.appendRow([id, e.parameter.ngay, e.parameter.thu || '', e.parameter.buoi, e.parameter.nd]);
      SpreadsheetApp.flush();
      return createResponse({ success: true, message: 'Đã thêm lịch hàng tháng', id: id });
    }

    // ---- [V4] LƯU TIN NHẮN ADMIN ----
    if (action === 'luuTinNhan') {
      return luuTinNhan(ss, e.parameter.msg || '');
    }

    // ---- [V4] XÓA TIN NHẮN ADMIN ----
    if (action === 'xoaTinNhan') {
      return xoaTinNhan(ss);
    }

    // ---- [V4] XÓA TIN NHẮN THEO SỐ HÀNG ----
    if (action === 'xoaTinNhanTheoHang') {
      return xoaTinNhanTheoHang(ss, parseInt(e.parameter.hang));
    }

    // ---- DEBUG: XEM DỮ LIỆU THÔ ----
    if (action === 'debug') {
      const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DANG_KY);
      if (!sheet) return createResponse({ error: 'Không tìm sheet dang_ky' });
      const raw = sheet.getDataRange().getValues();
      const info = raw.map((row, i) => ({
        row: i,
        col0: row[0], col1_type: typeof row[1], col1: row[1] ? row[1].toString() : '',
        col2_type: typeof row[2], col2: row[2] ? row[2].toString() : '',
        col2_isDate: row[2] instanceof Date,
        col2_converted: timestampToDisplayDate(row[2])
      }));
      return createResponse({ debug: info });
    }

    return createResponse({ success: false, error: 'Action không hợp lệ: ' + action });

  } catch (err) {
    return createResponse({ success: false, error: err.toString(), stack: err.stack });
  }
}

// ========================================
// ĐĂNG KÝ MỚI TỪ index.html (POST)
// ========================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss   = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DANG_KY);
    if (!sheet) return createResponse({ success: false, error: 'Sheet dang_ky không tồn tại' });

    const ngayTimestamp    = dateStringToTimestamp(data.ngay); // "yyyy-mm-dd" → timestamp
    const thoiGianDangKy   = Date.now();
    const id               = Date.now();

    sheet.appendRow([id, thoiGianDangKy, ngayTimestamp, data.buoi, data.tenDonVi, data.noiDung, 'pending']);
    SpreadsheetApp.flush();

    return createResponse({ success: true, message: 'Đăng ký thành công', id: id });
  } catch (err) {
    return createResponse({ success: false, error: err.toString(), stack: err.stack });
  }
}

// ========================================
// DUYỆT ĐĂNG KÝ
// ========================================
function duyetDangKy(ss, id) {
  try {
    const s1 = ss.getSheetByName(CONFIG.SHEET_NAMES.DANG_KY);
    const s2 = ss.getSheetByName(CONFIG.SHEET_NAMES.LICH_SU);
    if (!s1 || !s2) return createResponse({ success: false, error: 'Không tìm thấy sheet' });

    const data = s1.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id) {
        const row = data[i];
        row[6] = 'approved';
        s2.appendRow(row);      // Copy sang lich_su
        s1.deleteRow(i + 1);    // Xóa khỏi dang_ky
        SpreadsheetApp.flush();
        return createResponse({ success: true, message: 'Đã duyệt thành công' });
      }
    }
    return createResponse({ success: false, error: 'Không tìm thấy đăng ký với ID: ' + id });
  } catch (err) {
    return createResponse({ success: false, error: err.toString() });
  }
}

// ========================================
// XÓA LỊCH
// ========================================
function xoaLich(ss, sheetName, id) {
  try {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return createResponse({ success: false, error: 'Sheet không tồn tại: ' + sheetName });

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id) {
        sheet.deleteRow(i + 1);
        SpreadsheetApp.flush();
        return createResponse({ success: true, message: 'Đã xóa thành công' });
      }
    }
    return createResponse({ success: false, error: 'Không tìm thấy lịch với ID: ' + id });
  } catch (err) {
    return createResponse({ success: false, error: err.toString() });
  }
}

// ========================================
// [V4] LƯU TIN NHẮN ADMIN
// Mỗi lần gửi → appendRow (giữ lịch sử)
// Tin hiển thị = hàng cuối cùng
// Chỉ mất khi admin bấm Xóa (xoaTinNhan xóa hàng cuối)
// ========================================
function luuTinNhan(ss, msg) {
  try {
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TIN_NHAN);

    // Tự tạo sheet nếu chưa có
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAMES.TIN_NHAN);
      sheet.appendRow(['Thời gian cập nhật', 'Nội dung tin nhắn']);
      sheet.getRange('A1:B1').setFontWeight('bold').setBackground('#ef476f').setFontColor('#ffffff');
    }

    // Luôn thêm hàng mới — giữ toàn bộ lịch sử
    sheet.appendRow([new Date(), msg]);
    SpreadsheetApp.flush();
    return createResponse({ success: true, message: 'Đã lưu tin nhắn' });
  } catch (err) {
    return createResponse({ success: false, error: err.toString() });
  }
}

// ========================================
// [V4] XÓA TIN NHẮN THEO SỐ HÀNG (rowIndex = số hàng thực trong sheet)
// ========================================
function xoaTinNhanTheoHang(ss, rowIndex) {
  try {
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TIN_NHAN);
    if (!sheet) return createResponse({ success: false, error: 'Sheet tin_nhan không tồn tại' });
    if (!rowIndex || rowIndex < 2) return createResponse({ success: false, error: 'Số hàng không hợp lệ' });

    sheet.deleteRow(rowIndex);
    SpreadsheetApp.flush();
    return createResponse({ success: true, message: 'Đã xóa tin nhắn' });
  } catch (err) {
    return createResponse({ success: false, error: err.toString() });
  }
}

// ========================================
// [V4] ĐỌC TOÀN BỘ DANH SÁCH TIN NHẮN (cho admin.html)
// Trả về mảng [{hang, thoiGian, noiDung}] sắp xếp mới → cũ
// ========================================
function docDanhSachTinNhan(ss) {
  try {
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TIN_NHAN);
    if (!sheet) return [];
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    const result = [];
    data.forEach((row, i) => {
      const noiDung = row[1] ? row[1].toString().trim() : '';
      if (!noiDung) return; // bỏ qua hàng trống
      const thoiGian = row[0] ? new Date(row[0]) : null;
      result.push({
        hang:      i + 2,  // số hàng thực trong sheet (bắt đầu từ 2)
        thoiGian: thoiGian ? Utilities.formatDate(thoiGian, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : '',
        noiDung:   noiDung
      });
    });
    // Sắp xếp mới nhất lên đầu
    result.reverse();
    return result;
  } catch (err) {
    Logger.log('Lỗi đọc danh sách tin nhắn: ' + err.toString());
    return [];
  }
}

// ========================================
// [V4] XÓA TIN NHẮN CUỐI (fallback, không dùng trực tiếp nữa)
// ========================================
function xoaTinNhan(ss) {
  try {
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TIN_NHAN);
    if (!sheet) return createResponse({ success: false, error: 'Sheet tin_nhan không tồn tại' });

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return createResponse({ success: false, error: 'Không có tin nhắn nào để xóa' });

    sheet.deleteRow(lastRow);
    SpreadsheetApp.flush();
    return createResponse({ success: true, message: 'Đã xóa tin nhắn' });
  } catch (err) {
    return createResponse({ success: false, error: err.toString() });
  }
}

// ========================================
// [V4] ĐỌC TIN NHẮN ADMIN
// Luôn đọc hàng CUỐI CÙNG = tin mới nhất
// Trả về '' nếu không có tin nào
// ========================================
function docTinNhan(ss) {
  try {
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TIN_NHAN);
    if (!sheet) return '';

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return '';

    const msg = sheet.getRange(lastRow, 2).getValue();
    return msg ? msg.toString().trim() : '';
  } catch (err) {
    Logger.log('Lỗi đọc tin nhắn: ' + err.toString());
    return '';
  }
}

// ========================================
// LẤY DỮ LIỆU SHEET → TRẢ VỀ JSON
// Ngày trả về dạng "DD/MM/YYYY"
// Thời gian đăng ký trả về dạng "DD/MM/YYYY HH:MM"
// ========================================
function getSheetData(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      const val = row[i];
      if (h === 'Ngày (timestamp)' || h.includes('timestamp')) {
        // Xử lý cả Date object, số timestamp, và string
        obj['Ngày'] = timestampToDisplayDate(val);
      } else if (h === 'Thời gian đăng ký') {
        // Xử lý cả Date object và số timestamp
        obj[h] = timestampToDisplayTime(val);
      } else {
        obj[h] = val;
      }
    });
    return obj;
  });
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// TỰ ĐỘNG DỌN DẸP - CHẠY MỖI NGÀY (TRIGGER)
//
// Cài trigger: Extensions > Apps Script > Triggers
//   Function : autoCleanOldSchedules
//   Event    : Time-driven > Day timer > 1am to 2am
//
// Logic:
//   ✅ Chỉ XÓA đăng ký chờ duyệt (dang_ky) đã QUA NGÀY
//   ✅ KHÔNG xóa, KHÔNG archive lich_su
//      → Admin tự lọc 30 ngày qua / 30 ngày tới khi hiển thị
// ========================================
function autoCleanOldSchedules() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

    // Mốc hôm nay lúc 7h sáng (giờ Việt Nam)
    const today = new Date();
    today.setHours(7, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // ✅ Chỉ xóa đăng ký chờ duyệt đã qua ngày
    deleteOldPendingRequests(ss, todayTimestamp);

    Logger.log('✅ Đã dọn dẹp đăng ký quá hạn thành công');
  } catch (err) {
    Logger.log('❌ Lỗi autoClean: ' + err.toString());
  }
}

/**
 * Xóa các hàng trong sheet dang_ky có ngày sử dụng < hôm nay
 * (đã qua ngày mà chưa được duyệt → xóa bỏ)
 */
function deleteOldPendingRequests(ss, todayTimestamp) {
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DANG_KY);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return;

  let deletedCount = 0;

  // Duyệt từ dưới lên để xóa không bị lệch index
  for (let i = data.length - 1; i >= 1; i--) {
    const ngayTimestamp = data[i][2]; // Cột "Ngày (timestamp)"
    if (ngayTimestamp && ngayTimestamp < todayTimestamp) {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }

  SpreadsheetApp.flush();
  Logger.log(`🗑️ Đã xóa ${deletedCount} đăng ký quá hạn khỏi dang_ky`);
}

// ========================================
// HÀM TEST
// ========================================

/**
 * Chạy thủ công để kiểm tra chuyển đổi ngày
 */
function testConversion() {
  const testDate = "2026-03-07";
  const ts       = dateStringToTimestamp(testDate);
  Logger.log("Input       : " + testDate);
  Logger.log("Timestamp   : " + ts);
  Logger.log("DisplayDate : " + timestampToDisplayDate(ts));   // 07/03/2026
  Logger.log("DisplayTime : " + timestampToDisplayTime(ts));   // 07/03/2026 07:00
}

/**
 * Chạy thủ công để kiểm tra dọn dẹp
 */
function testAutoClean() {
  autoCleanOldSchedules();
}

/**
 * [MỚI V4] Chạy thủ công để kiểm tra tin nhắn
 */
function testTinNhan() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  // Ghi thử một tin nhắn
  luuTinNhan(ss, 'Đây là tin nhắn thử nghiệm từ Admin.');
  // Đọc lại
  const msg = docTinNhan(ss);
  Logger.log('Tin nhắn hiện tại: ' + msg);
}