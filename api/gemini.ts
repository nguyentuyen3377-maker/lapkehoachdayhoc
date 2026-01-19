
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

  const prompt = `Bạn là chuyên gia sư phạm tiểu học hàng đầu Việt Nam.
  Nhiệm vụ: Lập kế hoạch dạy học môn ${subject} lớp ${grade} cho năm học ${academicYear} (Mức độ: ${level}).

  QUY TẮC CẤU TRÚC NỘI DUNG (QUAN TRỌNG):
  1. TRƯỜNG "theme": Phải bao gồm cả Chủ đề và Mạch nội dung chi tiết.
     ĐỊNH DẠNG BẮT BUỘC: "Chủ đề: [Tên chủ đề] - Mạch nội dung: [Chi tiết mạch kiến thức/kỹ năng cần truyền đạt]".
     Ví dụ: "Chủ đề: Máy tính và em - Mạch nội dung: Thành phần của máy tính và cách sử dụng chuột".

  2. CHIẾN LƯỢC TÍCH HỢP NĂNG LỰC SỐ (NLS):
     - KHÔNG TÍCH HỢP MÁY MÓC vào mọi tuần. 
     - Chỉ chọn những bài học mà việc dùng công cụ số thực sự mang lại hiệu quả vượt trội.
     - Các tiết rèn kỹ năng thủ công, ôn tập lý thuyết đơn thuần, hoặc kiểm tra viết trên giấy thì KHÔNG tích hợp NLS.

  3. ĐỊNH DẠNG TRẢ VỀ:
     - "learningOutcomes": Ghi rõ hành động của học sinh (Ví dụ: "Sử dụng bảng tương tác để kéo thả các hình khối"). Nếu không phù hợp, để trống "".
     - "digitalCompetencyCode": Ghi mã chỉ báo phù hợp. Nếu không, để trống "".

  Yêu cầu về chuyên môn:
  - Phân bổ 35 tuần học theo khung chương trình hiện hành.
  - Nội dung mạch kiến thức phải chính xác với CT GDPT 2018 của môn ${subject} ${grade}.

  Cấu trúc trả về: JSON array 35 objects.
  Trường: weekMonth, theme, lessonName, periods, digitalCompetencyCode, learningOutcomes.`;

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
        temperature: 0.25, // Giữ độ ổn định cao cho dữ liệu chuyên môn
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: 'Lỗi hệ thống', message: error.message });
  }
}
