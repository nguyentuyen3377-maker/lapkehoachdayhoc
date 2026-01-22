
import React, { useState, useEffect, useMemo } from 'react';
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

  const stats = useMemo(() => {
    if (planRows.length === 0) return null;
    const total = planRows.length;
    const integrated = planRows.filter(r => !!r.digitalCompetencyCode).length;
    const totalPeriods = planRows.reduce((sum, r) => sum + (Number(r.periods) || 0), 0);
    return {
      total,
      integrated,
      percent: Math.round((integrated / total) * 100),
      totalPeriods
    };
  }, [planRows]);

  const loadingSteps = [
    "🔍 Đang phân tích nội dung chuyên môn từng bài...",
    "🧠 Đánh giá nhu cầu thực tế về tích hợp NLS...",
    "📖 Soạn thảo mạch nội dung chi tiết (2-3 dòng)...",
    "🛡️ Kiểm tra đối chiếu mã CB1/CB2 theo khối lớp...",
    "📋 Hoàn thiện bảng kế hoạch chọn lọc 35 tuần..."
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
        .small-content { font-size: 9pt; color: #444; line-height: 1.2; }
        .empty-nls { color: #888; font-style: italic; font-size: 8.5pt; text-align: center; }
      </style></head>
      <body>
        <div class="header">
          KẾ HOẠCH DẠY HỌC MÔN ${subject.toUpperCase()} - ${grade.toUpperCase()}<br>
          NĂM HỌC: ${academicYear}<br>
          <span style="font-size: 10pt; font-style: italic; font-weight: normal;">(Tích hợp Năng lực số chọn lọc - Mức độ ${isUpper ? 'CB2' : 'CB1'})</span>
        </div>
        <table>
          <thead><tr style="background: #f3f4f6;">
            <th width="6%">Tuần</th><th width="34%">Chủ đề & Mạch nội dung chi tiết</th><th width="16%">Tên bài học</th><th width="5%">Tiết</th><th width="9%">Mã 3456</th><th width="20%">YCCĐ Năng lực số</th><th width="10%">Ghi chú</th>
          </tr></thead>
          <tbody>
            ${planRows.map(row => {
              const themeParts = row.theme.split(' - ');
              const hasNLS = !!row.digitalCompetencyCode;
              return `
                <tr>
                  <td class="center">${row.weekMonth}</td>
                  <td><b>${themeParts[0]}</b><br><div class="small-content">${themeParts[1] || ''}</div></td>
                  <td class="bold">${row.lessonName}</td>
                  <td class="center">${row.periods}</td>
                  <td class="center">${hasNLS ? `<b>${row.digitalCompetencyCode}</b>` : '<span class="empty-nls">-</span>'}</td>
                  <td>${hasNLS ? row.learningOutcomes : '<span class="empty-nls">Không tích hợp</span>'}</td>
                  <td>${row.note}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </body></html>`;
    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `KH_${subject}_${grade}_TichHopChonLoc.doc`;
    link.click();
  };

  return (
    <Layout onExportDocx={exportToDocx} isDataReady={planRows.length > 0}>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-6 no-print">
        {REGULATION_TAGS.map(tag => (
          <span key={tag.id} className="bg-white text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase border border-slate-200 shadow-sm">
            {tag.label}
          </span>
        ))}
      </div>

      <div className="mb-8 print:mb-4">
        <h1 className="text-4xl font-black text-indigo-950 uppercase tracking-tight print:text-center print:text-xl">
          Kế hoạch dạy học môn {subject}
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-4 no-print">
          <div className="bg-indigo-600 text-white px-5 py-2 rounded-full text-xs font-black shadow-lg shadow-indigo-100 uppercase tracking-wide">
             {grade}
          </div>
          <div className="bg-emerald-500 text-white px-5 py-2 rounded-full text-xs font-black shadow-lg shadow-emerald-100 uppercase tracking-wide">
             Mức độ: {grade.includes("4") || grade.includes("5") ? "CB2" : "CB1"}
          </div>
          <div className="bg-amber-500 text-white px-5 py-2 rounded-full text-xs font-black shadow-lg shadow-amber-100 uppercase tracking-wide">
             Năm học: {academicYear}
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 no-print animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Tổng thời lượng</div>
            <div className="text-2xl font-black text-slate-800">{stats.totalPeriods} tiết</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Tuần học</div>
            <div className="text-2xl font-black text-slate-800">{stats.total} tuần</div>
          </div>
          <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 shadow-sm">
            <div className="text-indigo-400 text-[10px] font-bold uppercase mb-1">Tích hợp NLS</div>
            <div className="text-2xl font-black text-indigo-700">{stats.integrated} bài</div>
          </div>
          <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 shadow-sm">
            <div className="text-emerald-400 text-[10px] font-bold uppercase mb-1">Tỷ lệ chọn lọc</div>
            <div className="text-2xl font-black text-emerald-700">{stats.percent}%</div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 mb-10 no-print">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase px-1 tracking-widest">Năm học</label>
            <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
              {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase px-1 tracking-widest">Môn học</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase px-1 tracking-widest">Khối lớp</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase px-1 tracking-widest">Mục tiêu đạt được</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
              {ATTAINMENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={handleGenerate} disabled={isLoading} className={`rounded-2xl py-4.5 font-black transition-all shadow-xl hover:shadow-indigo-200 active:scale-[0.98] w-full ${isLoading ? 'bg-slate-300 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            {isLoading ? "ĐANG XỬ LÝ..." : "THIẾT LẬP BẰNG AI"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/30 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 backdrop-blur-sm text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                <th className="px-8 py-6 border-r border-slate-100 w-24 text-center">Tuần</th>
                <th className="px-8 py-6 border-r border-slate-100 min-w-[380px]">Chủ đề & Mạch nội dung chi tiết</th>
                <th className="px-8 py-6 border-r border-slate-100 min-w-[200px]">Tên bài học</th>
                <th className="px-8 py-6 border-r border-slate-100 w-20 text-center">Tiết</th>
                <th className="px-8 py-6 border-r border-slate-100 w-36 text-center text-indigo-600">Mã 3456</th>
                <th className="px-8 py-6 border-r border-slate-100 min-w-[300px]">YCCĐ Năng lực số</th>
                <th className="px-8 py-6 min-w-[150px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {planRows.length === 0 ? (
                <tr><td colSpan={7} className="px-8 py-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl animate-pulse">📝</div>
                    <div className="text-slate-400 italic font-medium max-w-sm">
                      {isLoading ? loadingMessage : 'Hệ thống đã cập nhật chế độ "Tích hợp chọn lọc". Nhấn nút phía trên để bắt đầu soạn thảo.'}
                    </div>
                  </div>
                </td></tr>
              ) : (
                planRows.map((row) => {
                  const themeParts = row.theme.split(' - ');
                  const hasNLS = !!row.digitalCompetencyCode;
                  return (
                    <tr key={row.id} className={`hover:bg-slate-50/50 transition-all text-sm group ${!hasNLS ? 'bg-slate-50/20' : ''}`}>
                      <td className="px-8 py-6 border-r border-slate-100 font-black text-slate-700 text-center">{row.weekMonth}</td>
                      <td className="px-8 py-6 border-r border-slate-100 leading-relaxed">
                         <div className="font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors uppercase text-[11px] tracking-tight">{themeParts[0]}</div>
                         <div className="text-[12.5px] text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm leading-relaxed italic border-l-4 border-l-slate-200">
                           {themeParts[1] || ''}
                         </div>
                      </td>
                      <td className="px-8 py-6 border-r border-slate-100 font-bold text-slate-900">{row.lessonName}</td>
                      <td className="px-8 py-6 border-r border-slate-100 text-center font-black text-indigo-600">{row.periods}</td>
                      <td className="px-8 py-6 border-r border-slate-100 text-center">
                        {hasNLS ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-black shadow-md shadow-indigo-100 tracking-tight">
                              {row.digitalCompetencyCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px] font-bold uppercase opacity-50 italic">Không gán</span>
                        )}
                      </td>
                      <td className="px-8 py-6 border-r border-slate-100 text-slate-600 text-[12px] leading-relaxed font-medium">
                        {hasNLS ? row.learningOutcomes : <span className="opacity-40 italic text-[11px]">Nội dung thực hành trực tiếp, không tích hợp NLS.</span>}
                      </td>
                      <td className="px-8 py-6">
                        <input type="text" value={row.note} onChange={(e) => updateNote(row.id, e.target.value)} className="w-full bg-transparent border-none text-[11px] focus:ring-0 italic text-slate-400" placeholder="..." />
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
