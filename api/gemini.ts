
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

  // Xác định mức độ mã chỉ báo dựa trên khối lớp
  const isUpperPrimary = grade.includes("4") || grade.includes("5");
  const competencyLevel = isUpperPrimary ? "CB2 (Mức độ L4-L5)" : "CB1 (Mức độ L1-L2-L3)";
  const codePrefix = isUpperPrimary ? "CB2" : "CB1";

  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key không khả dụng.' });

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Bạn là chuyên gia sư phạm tiểu học và lập trình viên giáo dục. 
  Hãy lập kế hoạch dạy học môn ${subject} lớp ${grade} cho năm học ${academicYear}.

  QUY TẮC CHUYÊN MÔN BẮT BUỘC (Dựa trên văn bản 3456/BGDĐT-GDPT):
  
  1. PHÂN TẦNG MÃ CHỈ BÁO NĂNG LỰC SỐ (NLS):
     - Vì đây là ${grade}, bạn PHẢI sử dụng mức độ: ${competencyLevel}.
     - Tất cả các mã chỉ báo phải có định dạng chứa "${codePrefix}". 
     - Ví dụ cho lớp 4, 5: 1.1.CB2a, 1.2.CB2a, 2.1.CB2a, 3.1.CB2b, 5.1.CB2a... (TUYỆT ĐỐI KHÔNG DÙNG CB1).
     - Ví dụ cho lớp 1, 2, 3: 1.1.CB1a, 2.1.CB1b...

  2. CHI TIẾT MẠCH NỘI DUNG (Trường "theme"):
     - Định dạng: "Chủ đề: [Tên chủ đề] - Mạch nội dung: [Mô tả chi tiết]".
     - Phần mô tả mạch nội dung PHẢI dài từ 2-3 dòng, nêu rõ hành động sư phạm và kiến thức lõi.
     - Ví dụ (Khoa học lớp 4): "Chủ đề: Nước - Mạch nội dung: Thực hiện thí nghiệm quan sát để xác định nước là chất lỏng không màu, không mùi, không vị; quan sát hiện tượng nước thấm qua vải nhưng không thấm qua nilon để hiểu về tính thấm; thí nghiệm nước chảy từ cao xuống thấp và lan ra mọi phía."

  3. YÊU CẦU CẦN ĐẠT NĂNG LỰC SỐ (Trường "learningOutcomes"):
     - Phải trích dẫn đúng văn phong của cột YCCD trong bảng mã 3456 tương ứng với mã ${codePrefix} đã chọn.

  Yêu cầu cấu trúc: 35 tuần học. Trả về JSON array: { weekMonth, theme, lessonName, periods, digitalCompetencyCode, learningOutcomes }.`;

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
        temperature: 0.1, // Giảm tối đa sự sáng tạo để đảm bảo độ chính xác của mã chỉ báo
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: 'Lỗi hệ thống', message: error.message });
  }
}
