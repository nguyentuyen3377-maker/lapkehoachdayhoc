
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

  const prompt = `Bạn là chuyên gia sư phạm tiểu học hàng đầu Việt Nam, chuyên trách về Đổi mới sáng tạo và Chuyển đổi số giáo dục.
  Nhiệm vụ: Lập kế hoạch dạy học môn ${subject} lớp ${grade} cho năm học ${academicYear} (Mức độ: ${level}).
  
  CHIẾN LƯỢC TÍCH HỢP NĂNG LỰC SỐ (NLS) "CHẤT LƯỢNG HƠN SỐ LƯỢNG":
  1. KHÔNG TÍCH HỢP MÁY MÓC: Tuyệt đối không ép bài nào cũng có NLS. Áp dụng cho TẤT CẢ các môn học.
  2. TIÊU CHÍ CHỌN BÀI TÍCH HỢP:
     - Chỉ chọn những bài học mà việc dùng công cụ số (Internet, phần mềm, thiết bị trình chiếu, robot...) giúp học sinh hiểu bài sâu hơn hoặc giải quyết vấn đề tốt hơn.
     - Các tiết học mang tính chất: Rèn kỹ năng tay (viết chữ, vẽ chì, hát, vận động), Ôn tập lý thuyết thuần túy, Kiểm tra định kỳ... thường KHÔNG cần tích hợp NLS.
  3. ĐỊNH DẠNG NỘI DUNG:
     - "learningOutcomes": Nếu tích hợp, ghi rõ hành động cụ thể của học sinh liên quan đến kỹ thuật số (Ví dụ: "Sử dụng máy tính để tra cứu ảnh động vật", "Thực hiện trình bày ý tưởng qua sơ đồ tư duy số"). Nếu không thấy phù hợp, để trống "".
     - "digitalCompetencyCode": Ghi mã (1.1.CB1, 2.3.K2...) tương ứng nếu có tích hợp. Nếu không, để trống "".
  
  Yêu cầu về chuyên môn môn học:
  - Phải đúng mạch kiến thức của CT GDPT 2018 cho môn ${subject} lớp ${grade}.
  - Phân bổ 35 tuần hợp lý, có tuần ôn tập và kiểm tra.
  
  Cấu trúc trả về: JSON array 35 objects.
  Trường: weekMonth (Tuần 1, Tuần 2...), theme (Chủ đề/Mạch nội dung), lessonName (Tên bài học), periods (Số tiết), digitalCompetencyCode, learningOutcomes.`;

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
        temperature: 0.3, // Giảm thêm để AI bớt "sáng tạo" quá đà, tập trung vào tính logic sư phạm
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: 'Lỗi hệ thống', message: error.message });
  }
}
