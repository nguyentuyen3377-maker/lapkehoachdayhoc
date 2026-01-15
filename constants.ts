
import { DigitalCompetency } from './types';

export const SUBJECTS = [
  "Tin học",
  "Toán",
  "Tiếng Việt",
  "Tiếng Anh",
  "Tự nhiên và Xã hội",
  "Khoa học",
  "Lịch sử và Địa lí",
  "Đạo đức",
  "Âm nhạc",
  "Mĩ thuật",
  "Công nghệ"
];

export const GRADES = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];

export const ATTAINMENT_LEVELS = [
  "Cơ bản 1 (Với sự hướng dẫn)",
  "Cơ bản 2 (Tự thực hiện)",
  "Khá (Vận dụng linh hoạt)",
  "Tốt (Sáng tạo)"
];

export const REGULATION_TAGS = [
  { id: 1, label: "CV 3456/BGDĐT (MỚI NHẤT)" },
  { id: 2, label: "MẪU CV 2345/BGDĐT" },
  { id: 3, label: "CT GDPT 2018" },
  { id: 4, label: "THÔNG TƯ 02 (KHUNG NLS)" }
];

export const DIGITAL_COMPETENCY_DETAILS: Record<DigitalCompetency, string> = {
  [DigitalCompetency.INFO_DATA]: "Tìm kiếm, lọc và đánh giá thông tin, dữ liệu và nội dung số.",
  [DigitalCompetency.COMM_COLLAB]: "Giao tiếp và cộng tác thông qua các phương tiện kỹ thuật số.",
  [DigitalCompetency.CONTENT_CREATION]: "Tạo lập và chỉnh sửa các nội dung số mới, hiểu về bản quyền.",
  [DigitalCompetency.SAFETY]: "Bảo vệ thiết bị, bảo mật và sức khỏe trong môi trường số.",
  [DigitalCompetency.PROBLEM_SOLVING]: "Giải quyết các vấn đề kỹ thuật và vận dụng sáng tạo công nghệ."
};
