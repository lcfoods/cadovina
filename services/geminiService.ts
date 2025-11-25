import { GoogleGenAI, Type } from "@google/genai";
import { Employee } from "../types";

// Fix: Safely access import.meta.env using optional chaining (?.).
// This prevents the "Cannot read properties of undefined" error if the environment is not standard Vite.
// @ts-ignore - Suppress TS error if client types are missing
const API_KEY = import.meta.env?.VITE_API_KEY || "YOUR_API_KEY_HERE"; 
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const extractEmployeeInfo = async (text: string, fileBase64?: string, mimeType?: string): Promise<Partial<Employee> | null> => {
  try {
    const model = "gemini-2.5-flash"; 
    const parts: any[] = [];
    
    if (fileBase64 && mimeType) {
        parts.push({
            inlineData: {
                data: fileBase64,
                mimeType: mimeType
            }
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

    const response = await ai.models.generateContent({
      model: model,
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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};