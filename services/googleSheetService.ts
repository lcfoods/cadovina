
/**
 * Service kết nối Google Sheet thông qua Google Apps Script
 * 
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Tạo Google Sheet > Extensions > Apps Script.
 * 2. Copy code Apps Script (đã cung cấp ở phần chat) vào file Code.gs.
 * 3. Deploy > New Deployment > Select type: Web App.
 * 4. Execute as: Me.
 * 5. Who has access: Anyone.
 * 6. Copy URL Web App (có đuôi /exec) và dán vào biến SCRIPT_URL dưới đây.
 */

const SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"; // <-- DÁN LINK CỦA BẠN VÀO ĐÂY

export const saveToGoogleSheet = async (type: string, data: any) => {
  // Bỏ qua nếu chưa cấu hình URL
  if (!SCRIPT_URL || SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
    console.warn("⚠️ Google Sheet Sync: Chưa cấu hình SCRIPT_URL trong services/googleSheetService.ts");
    return false;
  }

  try {
    const payload = {
      type: type, // Ví dụ: 'EMPLOYEES', 'POSITIONS', 'PROVINCES'
      data: data
    };

    // Gửi request POST
    // Lưu ý: Dùng mode 'no-cors' nếu gặp lỗi CORS chặn, nhưng tốt nhất là cấu hình Apps Script trả về JSONP hoặc text/plain
    // Ở đây dùng Content-Type text/plain để tránh preflight request phức tạp của Google
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });

    console.log(`✅ Đã đồng bộ ${type} lên Google Sheet`);
    return true;
  } catch (error) {
    console.error("❌ Lỗi đồng bộ Google Sheet:", error);
    return false;
  }
};
