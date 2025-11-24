import { GoogleGenAI, Type } from "@google/genai";
import { Employee } from "../types";

// ---- FIX: Support both Vite (import.meta.env) and Cloudflare (global variables) ----
let API_KEY: string = "YOUR_API_KEY_HERE";

// Cloudflare injects variables into globalThis
if (typeof globalThis !== "undefined" && (globalThis as any).VITE_API_KEY) {
  API_KEY = (globalThis as any).VITE_API_KEY;
}

// Vite local env (import.meta.env)
if (
  typeof import.meta !== "undefined" &&
  (import.meta as any).env &&
  (import.meta as any).env.VITE_API_KEY
) {
  API_KEY = (import.meta as any).env.VITE_API_KEY;
}
// -------------------------------------------------------------------------------

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const extractEmployeeInfo = async (
  text: string,
  fileBase64?: string,
  mimeType?: string
): Promise<Partial<Employee> | null> => {
  try {
    const model = "gemini-2.5-flash";
    const parts: any[] = [];

    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: fileBase64,
          mimeType: mimeType,
        },
      });
    }

    const promptText = `Bạn là một chuyên gia nhân sự (HR). Nhiệm vụ của bạn là trích xuất thông tin ứng viên từ tài liệu CV/Hồ sơ hoặc văn bản mô tả được cung cấp dưới đây thành định dạng JSON chuẩn.

      HƯỚNG DẪN XỬ LÝ:
      1. **Thông tin cá nhân**: Trích xuất chính xác Họ tên, SĐT, Email, Ngày sinh (YYYY-MM-DD).
      2. **Địa chỉ**: Phân tách địa chỉ thành 4 cấp: street, ward (Phường/Xã), district (Quận/Huyện), province (Tỉnh/Thành phố).
      3. **Công việc**: department (phòng ban dự đoán), position (chức vụ), salary (lương nếu có).

      Nội dung bổ sung: "${text}"
      
      Lưu ý: Chỉ trả về JSON.`;

    parts.push({ text: promptText });

    const response: any = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            gender: { type: Type.STRING },
            dob: { type: Type.STRING },
            phone: { type: Type.STRING },
            email: { type: Type.STRING },
            identityCard: { type: Type.STRING },
            issuedDate: { type: Type.STRING },
            issuedPlace: { type: Type.STRING },
            street: { type: Type.STRING },
            ward: { type: Type.STRING },
            district: { type: Type.STRING },
            province: { type: Type.STRING },
            department: { type: Type.STRING },
            position: { type: Type.STRING },
            salary: { type: Type.NUMBER },
          },
        },
      },
    });

    const textResponse = (
      response.text ?? response.response?.text?.() ?? "{}"
    ) as string;

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
