
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

  const isUpperPrimary = grade.includes("4") || grade.includes("5");
  const codePrefix = isUpperPrimary ? "CB2" : "CB1";

  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key không khả dụng.' });

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Bạn là chuyên gia sư phạm tiểu học cao cấp, am hiểu sâu sắc về Công văn 3456/BGDĐT. 
  Hãy soạn kế hoạch dạy học môn ${subject} lớp ${grade} cho năm học ${academicYear}.

  YÊU CẦU NGHIÊM NGẶT VỀ TÍCH HỢP CHỌN LỌC (QUAN TRỌNG NHẤT):
  - KHÔNG TÍCH HỢP TRÀN LAN: Bạn phải phân tích nội dung từng bài học. Nếu bài học đó mang tính chất thực hành offline hoàn toàn (ví dụ: tập đọc, viết chữ vào vở, thảo luận nhóm trực tiếp không dùng thiết bị, quan sát vật thật...), bạn PHẢI để trống "digitalCompetencyCode" và "learningOutcomes" (trả về "").
  - CHỈ TÍCH HỢP KHI: Bài học có các hoạt động như: Xem video/hình ảnh minh họa số, tìm kiếm internet, sử dụng phần mềm học tập, thảo luận qua bảng tương tác, hoặc học về an toàn mạng.
  - TỶ LỆ GỢI Ý: Với các môn như Tiếng Việt, Đạo đức, Âm nhạc... tỷ lệ tích hợp NLS chỉ nên khoảng 25-40%. Môn Tin học là 100%.

  YÊU CẦU CHUYÊN MÔN:
  - Soạn đủ 35 tuần học.
  - Trường "theme": Phải mô tả Mạch nội dung chi tiết từ 2-3 dòng (Ví dụ: "Chủ đề: Thực vật - Mạch nội dung: Tìm hiểu về các bộ phận của cây; thực hiện thí nghiệm trồng cây trong các điều kiện ánh sáng khác nhau; ghi chép nhật ký sinh trưởng của cây").
  - MÃ CHỈ BÁO: Phải dùng mức độ "${codePrefix}" cho ${grade}. Ví dụ: 1.1.${codePrefix}a, 2.1.${codePrefix}b...

  Trả về JSON array: { weekMonth, theme, lessonName, periods, digitalCompetencyCode, learningOutcomes }.`;

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
        temperature: 0.1, 
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: 'Lỗi hệ thống', message: error.message });
  }
}
