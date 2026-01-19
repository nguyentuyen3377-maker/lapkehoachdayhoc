
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ScheduleRow } from './types';
import { geminiService } from './services/geminiService';
import { SUBJECTS, GRADES, ATTAINMENT_LEVELS, ACADEMIC_YEARS, REGULATION_TAGS } from './constants';

const App: React.FC = () => {
  const [subject, setSubject] = useState(SUBJECTS[1]); // Mặc định thử môn Toán để kiểm tra tính chọn lọc
  const [grade, setGrade] = useState(GRADES[2]); 
  const [level, setLevel] = useState(ATTAINMENT_LEVELS[0]);
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0]);
  const [planRows, setPlanRows] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("✨ Đang thiết lập...");

  const loadingSteps = [
    "🔍 Phân tích chương trình môn học...",
    "🛡️ Thẩm định các nội dung có thể ứng dụng công nghệ...",
    "💡 Chỉ tích hợp NLS vào các bài học thực sự hiệu quả...",
    "📝 Đang soạn thảo chi tiết 35 tuần...",
    "✅ Hoàn thiện kế hoạch sư phạm..."
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

  const exportToExcel = () => {
    if (planRows.length === 0) return alert("Chưa có dữ liệu!");
    const headers = ["Tuần", "Chủ đề/Mạch nội dung", "Tên bài học", "Số tiết", "Mã NLS", "Yêu cầu cần đạt", "Ghi chú"];
    const csvRows = planRows.map(row => {
      const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
      return [escape(row.weekMonth), escape(row.theme), escape(row.lessonName), row.periods, escape(row.digitalCompetencyCode), escape(row.learningOutcomes), escape(row.note)].join(",");
    });
    const csvContent = "\ufeff" + headers.join(",") + "\n" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `KH_${subject}_Lop${grade}_${academicYear.replace(/\s/g, '')}.csv`;
    link.click();
  };

  const exportToDocx = () => {
    if (planRows.length === 0) return;
    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        body { font-family: 'Times New Roman', serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 6pt; font-size: 11pt; vertical-align: top; }
        .header { text-align: center; font-weight: bold; margin-bottom: 20pt; text-transform: uppercase; }
        .center { text-align: center; }
      </style></head>
      <body>
        <div class="header">
          KẾ HOẠCH DẠY HỌC MÔN ${subject.toUpperCase()} - ${grade.toUpperCase()}<br>
          NĂM HỌC: ${academicYear}<br>
          <span style="font-size: 10pt; font-style: italic; font-weight: normal;">(Tích hợp Năng lực số chọn lọc theo Khung NLS tiểu học)</span>
        </div>
        <table>
          <thead><tr style="background: #f3f4f6;">
            <th width="8%">Tuần</th><th width="25%">Chủ đề/Mạch nội dung</th><th width="20%">Tên bài học</th><th width="5%">Tiết</th><th width="10%">Mã NLS</th><th width="22%">Yêu cầu cần đạt NLS</th><th width="10%">Ghi chú</th>
          </tr></thead>
          <tbody>
            ${planRows.map(row => `
              <tr>
                <td class="center">${row.weekMonth}</td>
                <td>${row.theme}</td>
                <td><strong>${row.lessonName}</strong></td>
                <td class="center">${row.periods}</td>
                <td class="center">${row.digitalCompetencyCode || ''}</td>
                <td>${row.learningOutcomes || ''}</td>
                <td>${row.note}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </body></html>`;
    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `KH_${subject}_Lop${grade}_${academicYear.replace(/\s/g, '')}.doc`;
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
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Phát triển Năng lực số chọn lọc - Năm học {academicYear}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-10 no-print">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Năm học</label>
            <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none">
              {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Môn học</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Khối lớp</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mức độ mục tiêu</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none">
              {ATTAINMENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={handleGenerate} disabled={isLoading} className={`rounded-xl py-3.5 font-bold transition shadow-lg w-full active:scale-95 ${isLoading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            {isLoading ? "Đang xử lý..." : "✨ Thiết lập bằng AI"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 no-print">
          <h2 className="text-lg font-bold text-slate-700 uppercase flex items-center">
            <span className="w-1 h-6 bg-indigo-500 mr-3 rounded-full"></span>
            Chi tiết kế hoạch dạy học ({academicYear})
          </h2>
          <div className="flex space-x-2">
            <button onClick={exportToExcel} className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition">Tải Excel (.csv)</button>
            <button onClick={() => window.print()} className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition">In PDF</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 print:bg-white print:text-black">
                <th className="px-6 py-4 border-r border-slate-200 w-20 text-center">Tuần</th>
                <th className="px-6 py-4 border-r border-slate-200 min-w-[280px]">Chủ đề/Mạch nội dung</th>
                <th className="px-6 py-4 border-r border-slate-200 min-w-[200px]">Tên bài học</th>
                <th className="px-6 py-4 border-r border-slate-200 w-16 text-center">Tiết</th>
                <th className="px-6 py-4 border-r border-slate-200 w-28 text-center">Mã NLS</th>
                <th className="px-6 py-4 border-r border-slate-200 min-w-[300px]">YCCĐ Năng lực số</th>
                <th className="px-6 py-4 min-w-[150px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {planRows.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-32 text-center text-slate-400 italic">{isLoading ? loadingMessage : 'Vui lòng nhấn nút "Thiết lập bằng AI" để bắt đầu.'}</td></tr>
              ) : (
                planRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-6 py-4 border-r border-slate-100 font-bold text-slate-700 text-center">{row.weekMonth}</td>
                    <td className="px-6 py-4 border-r border-slate-100 whitespace-pre-wrap leading-relaxed text-slate-600">{row.theme}</td>
                    <td className="px-6 py-4 border-r border-slate-100 font-bold text-slate-900">{row.lessonName}</td>
                    <td className="px-6 py-4 border-r border-slate-100 text-center font-bold text-indigo-600 print:text-black">{row.periods}</td>
                    <td className="px-6 py-4 border-r border-slate-100 text-center">
                      {row.digitalCompetencyCode ? (
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold border border-indigo-100">
                          {row.digitalCompetencyCode}
                        </span>
                      ) : (
                        <span className="text-slate-300">---</span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r border-slate-100 text-slate-600 text-xs leading-relaxed font-medium">
                      {row.learningOutcomes || <span className="text-slate-400 italic text-[10px] uppercase opacity-60">Không tích hợp</span>}
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" value={row.note} onChange={(e) => updateNote(row.id, e.target.value)} className="w-full bg-transparent border-none text-xs focus:ring-0" placeholder="..." />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="print-footer mt-10">
        <div className="text-center w-64"><p className="font-bold">Người lập kế hoạch</p><p className="italic text-xs">(Ký và ghi rõ họ tên)</p><div className="h-24"></div></div>
        <div className="text-center w-64"><p className="font-bold">Ban Giám hiệu duyệt</p><p className="italic text-xs">(Ký tên và đóng dấu)</p><div className="h-24"></div></div>
      </div>
    </Layout>
  );
};

export default App;
