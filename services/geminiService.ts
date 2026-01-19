
export class GeminiService {
  async generateFullPlan(subject: string, grade: string, level: string, academicYear: string) {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, level, academicYear }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Lỗi không xác định từ API');
      }
      
      if (!data.text) throw new Error("Dữ liệu trả về trống.");

      return JSON.parse(data.text);
    } catch (error: any) {
      console.error("Gemini Service Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
