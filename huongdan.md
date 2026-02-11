📋 HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG ĐĂNG KÝ ĐỊA ĐIỂM
===============================================

🌐 TỔNG QUAN
------------
Hệ thống gồm 3 phần:
1. Google Apps Script Backend (code.gs) - Xử lý dữ liệu
2. Google Sheets - Lưu trữ dữ liệu
3. Website Frontend (2 trang HTML) - Giao diện người dùng

📁 CÁC FILE CẦN CÓ
------------------
1. code.gs                → Backend Google Apps Script
2. index.html            → Trang đăng ký cho thành viên
3. admin.html            → Trang quản trị
4. HƯỚNG DẪN.txt         → Tệp này

🚀 CÁC BƯỚC TRIỂN KHAI
---------------------

🔹 BƯỚC 1: TẠO GOOGLE SHEETS
1. Mở https://sheets.google.com
2. Tạo spreadsheet mới
3. Đặt tên: "Đăng ký địa điểm"
4. Copy ID từ URL:
   Ví dụ: https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
          ID là: 1AbCdEfGhIjKlMnOpQrStUvWxYz

🔹 BƯỚC 2: TẠO GOOGLE APPS SCRIPT
1. Mở https://script.google.com
2. Tạo project mới → Đặt tên "Đăng ký địa điểm"
3. Xóa code mặc định, dán code.gs vào
4. Ở dòng 8, thay SPREADSHEET_ID bằng ID từ Bước 1

🔹 BƯỚC 3: CHẠY SETUP
1. Trong Apps Script, chọn hàm "setupSheets"
2. Nhấn Run ▶️
3. Authorize (cho phép quyền)
4. Quay lại Google Sheets → Kiểm tra có 2 sheet mới:
   - dang_ky (chờ duyệt)
   - lich_su (đã duyệt)

🔹 BƯỚC 4: DEPLOY WEB APP
1. Trong Apps Script: Deploy → New deployment
2. Type: Web App
3. Description: Đăng ký địa điểm
4. Execute as: Me
5. Who has access: Anyone
6. Nhấn Deploy
7. COPY Web App URL (quan trọng!)
   Ví dụ: https://script.google.com/macros/s/AKfycby.../exec

🔹 BƯỚC 5: CẤU HÌNH FRONTEND
1. Mở file index.html và admin.html
2. Tìm dòng: const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_WEB_APP_URL/exec";
3. Thay YOUR_WEB_APP_URL bằng URL từ Bước 4
4. Lưu các file HTML

🔹 BƯỚC 6: KIỂM TRA
1. Mở Web App URL + ?action=test
   https://script.google.com/.../exec?action=test
   → Nếu thấy "Backend đang hoạt động!" là OK

2. Mở index.html trong trình duyệt → Thử đăng ký

3. Mở admin.html trong trình duyệt → Thử duyệt đăng ký

📊 CẤU TRÚC DỮ LIỆU
-------------------
SHEET "dang_ky" (chờ duyệt):
┌─────────────────┬────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────┐
│ Thời gian ĐK    │ Thứ, Ngày  │ Giờ bắt đầu │ Giờ kết thúc │ Tên đơn vị   │ Nội dung     │ Trạng thái│
├─────────────────┼────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────┤
│ 10/02/2024 14:30│ T2, 10/2   │ 08:00       │ 10:00        │ Tổ dân phố 5 │ Họp định kỳ │ pending  │
└─────────────────┴────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────┘

SHEET "lich_su" (đã duyệt):
┌──────┬─────────────────┬────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ ID   │ Ngày duyệt      │ Thứ, Ngày │ Giờ bắt đầu │ Giờ kết thúc │ Tên đơn vị   │ Nội dung     │
├──────┼─────────────────┼────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ DK1  │ 10/02/2024 15:00│ T2, 10/2   │ 08:00       │ 10:00        │ Tổ dân phố 5 │ Họp định kỳ │
└──────┴─────────────────┴────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

🔧 API ENDPOINTS
----------------
GET /exec?action=getLichSu    → Lấy lịch sử đã duyệt
GET /exec?action=getDangKy    → Lấy đăng ký chờ duyệt
GET /exec?action=duyetDangKy&id=X → Duyệt đăng ký ID X
GET /exec?action=getStats     → Lấy thống kê
GET /exec?action=test         → Kiểm tra kết nối
POST /exec                    → Gửi đăng ký mới

📱 CÁCH SỬ DỤNG
---------------
1. THÀNH VIÊN (index.html):
   - Xem lịch sử đã đăng ký
   - Điền form đăng ký mới
   - Gửi → Chờ admin duyệt

2. QUẢN TRỊ VIÊN (admin.html):
   - Xem thống kê
   - Xem đăng ký chờ duyệt
   - Nhấn "Duyệt" để chấp nhận
   - Xem lịch sử đã duyệt

⚠️ LƯU Ý QUAN TRỌNG
------------------
1. Mỗi khi cập nhật code.gs → Phải Deploy lại
2. Web App URL thay đổi khi deploy mới
3. Cập nhật SCRIPT_URL trong HTML nếu URL thay đổi
4. Hàm setupSheets chỉ chạy 1 lần đầu

🛠️ HÀM TIỆN ÍCH
---------------
1. setupSheets()     → Tạo sheet (chạy 1 lần)
2. testConnection()  → Kiểm tra kết nối
3. cleanupOldData(30) → Xóa dữ liệu cũ >30 ngày

📞 HỖ TRỢ
---------
Nếu có lỗi:
1. Kiểm tra Console (F12) → Xem lỗi JavaScript
2. Kiểm tra Apps Script Logs (View → Logs)
3. Kiểm tra Google Sheets có 2 sheet đúng tên
4. Kiểm tra Web App URL đúng trong HTML

✅ HOÀN THÀNH KHI
-----------------
1. Backend trả về "Backend đang hoạt động!" khi test
2. Đăng ký mới thành công
3. Admin duyệt được đăng ký
4. Dữ liệu chuyển từ "chờ duyệt" sang "đã duyệt"

🎉 CHÚC BẠN TRIỂN KHAI THÀNH CÔNG!

