
/**
 * Service kết nối Google Sheet
 * Bạn cần tạo Google Apps Script (dạng Web App) và dán link vào biến SCRIPT_URL bên dưới.
 */

// --- CẤU HÌNH LINK WEB APP GOOGLE SCRIPT ---
// Bước 1: Tạo Google Sheet -> Extensions -> Apps Script.
// Bước 2: Copy code backend (tôi sẽ cung cấp ở phần hướng dẫn) vào.
// Bước 3: Deploy -> New Deployment -> Web App -> Access: Anyone.
// Bước 4: Copy URL (có đuôi /exec) dán vào đây.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxDKqHQUH1g2KsHi8StMyZnV3KxwWoMHkbslRL6sOHTkUWDh2dML6YSYFXqZGdVJ6Zuw/exec"; 

export const saveToGoogleSheet = async (type: string, data: any) => {
  // Nếu chưa thay link thì báo lỗi nhẹ ở console và bỏ qua
  if (!SCRIPT_URL || SCRIPT_URL.includes("YOUR_SCRIPT_ID_HERE")) {
    console.warn("⚠️ Google Sheet Sync: Chưa điền SCRIPT_URL trong services/googleSheetService.ts");
    return false;
  }

  try {
    // Sử dụng mode 'no-cors' để tránh lỗi chặn của trình duyệt khi gọi sang Google
    // Lưu ý: 'no-cors' sẽ không trả về kết quả chi tiết, nhưng vẫn gửi dữ liệu đi được.
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain", // Dùng text/plain để tránh preflight OPTIONS request
      },
      body: JSON.stringify({
        type: type, // Ví dụ: 'EMPLOYEES', 'DEPARTMENTS'
        data: data  // Dữ liệu cần lưu
      })
    });

    console.log(`✅ Đã gửi lệnh đồng bộ ${type} lên Google Sheet`);
    return true;
  } catch (error) {
    console.error("❌ Lỗi đồng bộ Google Sheet:", error);
    return false;
  }
};
