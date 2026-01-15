
export class GeminiService {
  async generateFullPlan(subject: string, grade: string, level: string) {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, level }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Lỗi không xác định từ API');
      }
      
      if (!data.text) throw new Error("Dữ liệu trả về trống.");

      // Parse text từ backend trả về (đã được định dạng JSON nhờ schema)
      return JSON.parse(data.text);
    } catch (error: any) {
      console.error("Gemini Service Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
