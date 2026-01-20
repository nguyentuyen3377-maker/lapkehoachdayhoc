
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { subject, grade, level, academicYear } = req.body;

  if (!subject || !grade) {
    return res.status(400).json({ error: 'Thiếu thông tin đầu vào' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key không khả dụng.' });

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Bạn là chuyên gia sư phạm tiểu học. Hãy lập kế hoạch dạy học môn ${subject} lớp ${grade} (${academicYear}).

  YÊU CẦU VỀ NỘI DUNG CHUYÊN MÔN:
  1. TRƯỜNG "theme" (Chủ đề & Mạch nội dung): 
     - Phải ghi rõ: "Chủ đề: [Tên chủ đề] - Mạch nội dung: [Hành động cụ thể/Nội dung kiến thức chi tiết]".
     - Ví dụ (Khoa học): "Chủ đề: Nước - Mạch nội dung: Thí nghiệm xác định tính chất vật lý (không màu, không mùi, không vị) và khả năng hòa tan của nước".
     - Ví dụ (Toán): "Chủ đề: Phép nhân - Mạch nội dung: Hình thành ý nghĩa phép nhân thông qua tổng các số hạng bằng nhau".

  2. TRƯỜNG "digitalCompetencyCode" (Mã chỉ báo NLS):
     - BẮT BUỘC sử dụng bảng mã theo văn bản 3456/BGDĐT-GDPT.
     - Định dạng mã: [Miền].[Thành phần].[Mức độ][STT]. Ví dụ: 1.1.CB1a, 1.2.CB1a, 2.1.CB1a, 3.1.CB1a, 4.1.CB1b, 5.1.CB1a, 6.2.CB1b...
     - Chỉ tích hợp khi bài học thực sự có đất diễn cho công nghệ.

  3. TRƯỜNG "learningOutcomes" (YCCĐ Năng lực số):
     - Nội dung phải khớp với cột YCCD trong bảng mã 3456.
     - Ví dụ với mã 1.1.CB1a: "Xác định được nhu cầu thông tin, tìm kiếm dữ liệu thông qua tìm kiếm đơn giản trong môi trường số".
     - Ví dụ với mã 2.1.CB1a: "Lựa chọn được các công nghệ số đơn giản để tương tác".

  Yêu cầu về cấu trúc:
  - 35 tuần học (bao gồm ôn tập, kiểm tra).
  - Trả về JSON array: { weekMonth, theme, lessonName, periods, digitalCompetencyCode, learningOutcomes }.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
              learningOutcomes: { type: Type.STRING }
            },
            required: ["weekMonth", "theme", "lessonName", "periods", "digitalCompetencyCode", "learningOutcomes"]
          }
        },
        temperature: 0.2,
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: 'Lỗi hệ thống', message: error.message });
  }
}
