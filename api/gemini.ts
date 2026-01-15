
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { subject, grade, level } = req.body;

  if (!subject || !grade) {
    return res.status(400).json({ error: 'Thiếu thông tin đầu vào' });
  }

  // Hỗ trợ cả hai cách đặt tên biến môi trường
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Chưa cấu hình API Key. Hãy kiểm tra biến môi trường GEMINI_API_KEY trên Vercel.' });
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prompt siêu ngắn gọn để AI xử lý nhanh nhất có thể
  const prompt = `Lập KH dạy học 35 tuần cho môn ${subject}, ${grade}, mức độ ${level}. 
  Yêu cầu: JSON array 35 objects. Các trường: weekMonth (Tuần X), theme (ngắn), lessonName (ngắn), periods (1-2), digitalCompetencyCode (Mã NLS), integrationSuggestions (Gợi ý ngắn). 
  Tuân thủ GDPT 2018 và TT 02/2025.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // Model nhanh nhất để tránh Timeout
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              weekMonth: { type: Type.STRING },
              theme: { type: Type.STRING },
              lessonName: { type: Type.STRING },
              periods: { type: Type.NUMBER },
              digitalCompetencyCode: { type: Type.STRING },
              integrationSuggestions: { type: Type.STRING },
              note: { type: Type.STRING }
            },
            required: ["weekMonth", "theme", "lessonName", "periods", "digitalCompetencyCode", "integrationSuggestions"]
          }
        },
        temperature: 0.1,
        // Vô hiệu hóa thinking để phản hồi nhanh nhất có thể
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text;
    if (!text) throw new Error('AI không phản hồi dữ liệu');

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Trả về lỗi chi tiết để frontend hiển thị cho người dùng
    return res.status(500).json({ 
      error: 'Lỗi hệ thống', 
      message: error.message || 'Có lỗi xảy ra trong quá trình tạo kế hoạch.'
    });
  }
}
