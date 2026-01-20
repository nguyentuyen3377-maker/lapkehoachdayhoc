
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ScheduleRow } from './types';
import { geminiService } from './services/geminiService';
import { SUBJECTS, GRADES, ATTAINMENT_LEVELS, ACADEMIC_YEARS, REGULATION_TAGS } from './constants';

const App: React.FC = () => {
  const [subject, setSubject] = useState(SUBJECTS[5]); // Khoa học
  const [grade, setGrade] = useState(GRADES[3]); // Lớp 4
  const [level, setLevel] = useState(ATTAINMENT_LEVELS[0]);
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0]);
  const [planRows, setPlanRows] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("✨ Đang thiết lập...");

  const loadingSteps = [
    "🔍 Kiểm tra khối lớp để áp mức độ CB1/CB2...",
    "📖 Đang chi tiết hóa mạch nội dung (2-3 dòng)...",
    "🛡️ Áp dụng chính xác mã chỉ báo 3456/BGDĐT...",
    "📝 Đang biên soạn kế hoạch 35 tuần...",
    "✅ Hoàn thiện kế hoạch sư phạm chuẩn quy định..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      let step = 0;
      setLoadingMessage(loadingSteps[0]);
      interval = setInterval(() => {
        step = (step + 1) % loadingSteps.length;
        setLoadingMessage(loadingSteps[step]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setPlanRows([]); 
    try {
      const result = await geminiService.generateFullPlan(subject, grade, level, academicYear);
      if (Array.isArray(result)) {
        setPlanRows(result.map((r: any) => ({ 
          ...r, 
          id: Math.random().toString(36).substr(2, 9), 
          note: r.note || "" 
        })));
      }
    } catch (error: any) {
      alert(`⚠️ Lỗi: ${error.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = (id: string, note: string) => {
    setPlanRows(prev => prev.map(row => row.id === id ? { ...row, note } : row));
  };

  const exportToDocx = () => {
    if (planRows.length === 0) return;
    const isUpper = grade.includes("4") || grade.includes("5");
    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        body { font-family: 'Times New Roman', serif; }
        table { border-collapse: collapse; width: 100%; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 6pt; font-size: 10.5pt; vertical-align: top; }
        .header { text-align: center; font-weight: bold; margin-bottom: 20pt; text-transform: uppercase; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .small-content { font-size: 9.5pt; color: #333; line-height: 1.3; }
      </style></head>
      <body>
        <div class="header">
          KẾ HOẠCH DẠY HỌC MÔN ${subject.toUpperCase()} - ${grade.toUpperCase()}<br>
          NĂM HỌC: ${academicYear}<br>
          <span style="font-size: 10pt; font-style: italic; font-weight: normal;">(Tích hợp Năng lực số mức độ ${isUpper ? 'CB2' : 'CB1'} theo VB 3456/BGDĐT)</span>
        </div>
        <table>
          <thead><tr style="background: #f3f4f6;">
            <th width="7%">Tuần</th><th width="32%">Chủ đề & Mạch nội dung chi tiết</th><th width="16%">Tên bài học</th><th width="5%">Tiết</th><th width="9%">Mã 3456</th><th width="21%">YCCĐ Năng lực số</th><th width="10%">Ghi chú</th>
          </tr></thead>
          <tbody>
            ${planRows.map(row => {
              const themeParts = row.theme.split(' - ');
              return `
                <tr>
                  <td class="center">${row.weekMonth}</td>
                  <td><b>${themeParts[0]}</b><br><div class="small-content">${themeParts[1] || ''}</div></td>
                  <td class="bold">${row.lessonName}</td>
                  <td class="center">${row.periods}</td>
                  <td class="center"><b>${row.digitalCompetencyCode || ''}</b></td>
                  <td>${row.learningOutcomes || ''}</td>
                  <td>${row.note}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </body></html>`;
    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `KH_3456_${subject}_${grade}.doc`;
    link.click();
  };

  return (
    <Layout onExportDocx={exportToDocx} isDataReady={planRows.length > 0}>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-6 no-print">
        {REGULATION_TAGS.map(tag => (
          <span key={tag.id} className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-slate-200">
            {tag.label}
          </span>
        ))}
      </div>

      <div className="mb-8 print:mb-4">
        <h1 className="text-3xl font-extrabold text-indigo-900 uppercase tracking-tight print:text-center print:text-xl">
          Kế hoạch dạy học môn {subject} - {grade}
        </h1>
        <div className="flex items-center text-emerald-600 font-semibold mt-2 no-print">
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs mr-3">
             Mức độ NLS: {grade.includes("4") || grade.includes("5") ? "CB2 (Lớp 4-5)" : "CB1 (Lớp 1-3)"}
          </div>
          <span className="text-sm">Áp dụng bảng mã chỉ báo 3456/BGDĐT-GDPT</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-10 no-print">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Năm học</label>
            <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold">
              {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Môn học</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Khối lớp</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mức độ mục tiêu</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold">
              {ATTAINMENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={handleGenerate} disabled={isLoading} className={`rounded-xl py-3.5 font-bold transition shadow-lg w-full ${isLoading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            {isLoading ? "Đang xử lý..." : "✨ Thiết lập bằng AI"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 border-r border-slate-200 w-20 text-center">Tuần</th>
                <th className="px-6 py-4 border-r border-slate-200 min-w-[350px]">Chủ đề & Mạch nội dung chi tiết</th>
                <th className="px-6 py-4 border-r border-slate-200 min-w-[180px]">Tên bài học</th>
                <th className="px-6 py-4 border-r border-slate-200 w-16 text-center">Tiết</th>
                <th className="px-6 py-4 border-r border-slate-200 w-32 text-center text-indigo-600">Mã 3456</th>
                <th className="px-6 py-4 border-r border-slate-200 min-w-[280px]">YCCĐ Năng lực số</th>
                <th className="px-6 py-4 min-w-[150px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {planRows.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-32 text-center text-slate-400 italic">{isLoading ? loadingMessage : 'Hệ thống đã sẵn sàng cho mức độ CB2. Nhấn nút để bắt đầu.'}</td></tr>
              ) : (
                planRows.map((row) => {
                  const themeParts = row.theme.split(' - ');
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="px-6 py-4 border-r border-slate-100 font-bold text-slate-700 text-center">{row.weekMonth}</td>
                      <td className="px-6 py-4 border-r border-slate-100 leading-relaxed">
                         <div className="font-bold text-slate-800 mb-2">{themeParts[0]}</div>
                         <div className="text-[12px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-4 hover:line-clamp-none transition-all">
                           {themeParts[1] || ''}
                         </div>
                      </td>
                      <td className="px-6 py-4 border-r border-slate-100 font-bold text-slate-900">{row.lessonName}</td>
                      <td className="px-6 py-4 border-r border-slate-100 text-center font-bold text-indigo-600">{row.periods}</td>
                      <td className="px-6 py-4 border-r border-slate-100 text-center">
                        {row.digitalCompetencyCode ? (
                          <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-md text-[11px] font-black shadow-sm">
                            {row.digitalCompetencyCode}
                          </span>
                        ) : (
                          <span className="text-slate-300">---</span>
                        )}
                      </td>
                      <td className="px-6 py-4 border-r border-slate-100 text-slate-600 text-xs leading-relaxed font-medium">
                        {row.learningOutcomes || <span className="opacity-40">Không tích hợp</span>}
                      </td>
                      <td className="px-6 py-4">
                        <input type="text" value={row.note} onChange={(e) => updateNote(row.id, e.target.value)} className="w-full bg-transparent border-none text-xs focus:ring-0" placeholder="..." />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default App;
