
export enum DigitalCompetency {
  INFO_DATA = "Thông tin và dữ liệu",
  COMM_COLLAB = "Giao tiếp và hợp tác",
  CONTENT_CREATION = "Sáng tạo nội dung số",
  SAFETY = "An toàn",
  PROBLEM_SOLVING = "Giải quyết vấn đề"
}

export interface ScheduleRow {
  id: string;
  weekMonth: string;
  theme: string;
  lessonName: string;
  periods: number;
  digitalCompetencyCode: string; // Địa chỉ tích hợp NLS (Mã chỉ báo)
  integrationSuggestions: string; // Gợi ý nội dung lồng ghép
  note: string;
}

export interface CurriculumPlan {
  subject: string;
  grade: string;
  attainmentLevel: string;
  rows: ScheduleRow[];
}
