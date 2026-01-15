
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

  // Sử dụng API_KEY theo hướng dẫn
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key không khả dụng.' });
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prompt được tinh chỉnh để tối ưu hóa độ dài và chất lượng nội dung chuyên môn
  const prompt = `Bạn là chuyên gia sư phạm tiểu học. Hãy lập kế hoạch dạy học môn ${subject} lớp ${grade} cho cả năm học (35 tuần).
  Mức độ đạt được mục tiêu: ${level}.
  
  Yêu cầu cực kỳ quan trọng cho cột "theme":
  Phải bao gồm: [Tên Chủ đề] + [Mạch nội dung/Kiến thức].
  Trong đó, mạch nội dung phải trình bày dưới dạng các gạch đầu dòng ngắn gọn, sử dụng động từ chỉ mức độ nhận thức:
  - Nêu được...
  - Nhận biết được...
  - Nhận diện được...
  - Thực hiện được...
  
  Cấu trúc trả về: JSON array gồm 35 objects tương ứng 35 tuần.
  Các trường: weekMonth, theme, lessonName, periods, digitalCompetencyCode, integrationSuggestions.
  
  Đảm bảo nội dung bám sát Chương trình GDPT 2018 và khung năng lực số của Bộ GD&ĐT.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Sử dụng mô hình flash mới nhất để xử lý nhanh và mạnh
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
              integrationSuggestions: { type: Type.STRING }
            },
            required: ["weekMonth", "theme", "lessonName", "periods", "digitalCompetencyCode", "integrationSuggestions"]
          }
        },
        temperature: 1, // Tăng tính sáng tạo nhưng vẫn giữ trong khung schema
      },
    });

    const text = response.text;
    if (!text) throw new Error('AI không phản hồi dữ liệu');

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Lỗi hệ thống', 
      message: error.message || 'Có lỗi xảy ra trong quá trình tạo kế hoạch.'
    });
  }
}
