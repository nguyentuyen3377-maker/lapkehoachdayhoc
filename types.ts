
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
  learningOutcomes: string; // Yêu cầu cần đạt về Năng lực số (thay cho gợi ý tích hợp)
  note: string;
}

export interface CurriculumPlan {
  subject: string;
  grade: string;
  attainmentLevel: string;
  academicYear: string;
  rows: ScheduleRow[];
}
