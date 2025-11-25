
/**
 * Service kết nối Google Sheet
 * Bạn cần tạo Google Apps Script (dạng Web App) và dán link vào biến SCRIPT_URL bên dưới.
 */

// --- CẤU HÌNH LINK WEB APP GOOGLE SCRIPT ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxDKqHQUH1g2KsHi8StMyZnV3KxwWoMHkbslRL6sOHTkUWDh2dML6YSYFXqZGdVJ6Zuw/exec"; 

export const saveToGoogleSheet = async (type: string, data: any) => {
  if (!SCRIPT_URL || SCRIPT_URL.includes("1Q6G4NYNePP0zAQz6lPI2oJBpaRM0Ott90YaxfSGyKJ4")) {
    console.warn("⚠️ Google Sheet Sync: Chưa điền SCRIPT_URL trong services/googleSheetService.ts");
    return false;
  }

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ type: type, data: data })
    });
    console.log(`✅ Đã gửi lệnh lưu ${type}`);
    return true;
  } catch (error) {
    console.error("❌ Lỗi lưu Google Sheet:", error);
    return false;
  }
};

export const fetchFromGoogleSheet = async (type: string) => {
  if (!SCRIPT_URL || SCRIPT_URL.includes("YOUR_SCRIPT_ID_HERE")) return null;

  try {
    // Gọi GET request kèm tham số type
    const response = await fetch(`${SCRIPT_URL}?type=${type}`);
    const data = await response.json();
    console.log(`📥 Đã tải ${type}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Lỗi tải ${type} từ Google Sheet:`, error);
    return null;
  }
};
