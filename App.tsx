
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ScheduleRow } from './types';
import { geminiService } from './services/geminiService';
import { SUBJECTS, GRADES, ATTAINMENT_LEVELS, REGULATION_TAGS } from './constants';

const App: React.FC = () => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[2]); 
  const [level, setLevel] = useState(ATTAINMENT_LEVELS[0]);
  const [planRows, setPlanRows] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("✨ Đang thiết lập...");

  const loadingSteps = [
    "🔍 Đang phân tích chương trình GDPT 2018...",
    "📚 Đang soạn thảo mạch nội dung kiến thức...",
    "💻 Đang tích hợp năng lực số chuẩn Thông tư 02...",
    "📝 Đang hoàn thiện kế hoạch 35 tuần học...",
    "⚡ Sắp xong rồi, vui lòng đợi trong giây lát..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      let step = 0;
      setLoadingMessage(loadingSteps[0]);
      interval = setInterval(() => {
        step = (step + 1) % loadingSteps.length;
        setLoadingMessage(loadingSteps[step]);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setPlanRows([]); 
    try {
      const result = await geminiService.generateFullPlan(subject, grade, level);
      if (Array.isArray(result)) {
        setPlanRows(result.map((r: any) => ({ 
          ...r, 
          id: Math.random().toString(36).substr(2, 9), 
          note: r.note || "" 
        })));
      } else {
        throw new Error("Dữ liệu trả về không đúng định dạng danh sách.");
      }
    } catch (error: any) {
      console.error("Generate error:", error);
      alert(`⚠️ Không thể tạo kế hoạch: ${error.message}. Vui lòng thử lại sau vài giây.`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = (id: string, note: string) => {
    setPlanRows(prev => prev.map(row => row.id === id ? { ...row, note } : row));
  };

  const exportToExcel = () => {
    if (planRows.length === 0) return alert("Chưa có dữ liệu để xuất! Vui lòng tạo kế hoạch trước.");
    
    const headers = ["Tuần", "Chủ đề/Mạch nội dung", "Tên bài học", "Số tiết", "Mã NLS", "Nội dung tích hợp", "Ghi chú"];
    
    const csvRows = planRows.map(row => {
      const escape = (val: any) => `"${String(val).replace(/"/g, '""')}"`;
      return [
        escape(row.weekMonth),
        escape(row.theme),
        escape(row.lessonName),
        row.periods,
        escape(row.digitalCompetencyCode),
        escape(row.integrationSuggestions),
        escape(row.note)
      ].join(",");
    });

    const csvContent = "\ufeff" + headers.join(",") + "\n" + csvRows.join("\n");
    
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `KH_35Tuan_${subject.replace(/\s+/g, '_')}_${grade.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Lỗi khi tải file Excel.");
    }
  };

  const exportToDocx = () => {
    if (planRows.length === 0) return alert("Vui lòng tạo dữ liệu trước khi xuất Word.");

    const headerHtml = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="text-transform: uppercase; margin: 0;">KẾ HOẠCH DẠY HỌC MÔN ${subject.toUpperCase()} - ${grade.toUpperCase()}</h2>
        <p style="margin: 5px 0;">Năm học: 2025 - 2026 | Mức độ: ${level}</p>
        <p style="font-style: italic; font-size: 10pt;">(Tích hợp Năng lực số theo Khung năng lực số dành cho học sinh tiểu học)</p>
      </div>
    `;

    const tableHeader = `
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid black; padding: 8px; width: 50px;">Tuần</th>
          <th style="border: 1px solid black; padding: 8px;">Chủ đề/Mạch nội dung</th>
          <th style="border: 1px solid black; padding: 8px;">Tên bài học</th>
          <th style="border: 1px solid black; padding: 8px; width: 40px;">Tiết</th>
          <th style="border: 1px solid black; padding: 8px; width: 70px;">Mã NLS</th>
          <th style="border: 1px solid black; padding: 8px;">Tích hợp NLS</th>
          <th style="border: 1px solid black; padding: 8px;">Ghi chú</th>
        </tr>
      </thead>
    `;

    const tableRows = planRows.map(row => `
      <tr>
        <td style="border: 1px solid black; padding: 8px; text-align: center;">${row.weekMonth}</td>
        <td style="border: 1px solid black; padding: 8px; white-space: pre-wrap;">${row.theme}</td>
        <td style="border: 1px solid black; padding: 8px; font-weight: bold;">${row.lessonName}</td>
        <td style="border: 1px solid black; padding: 8px; text-align: center;">${row.periods}</td>
        <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${row.digitalCompetencyCode}</td>
        <td style="border: 1px solid black; padding: 8px; font-style: italic; font-size: 9pt;">${row.integrationSuggestions}</td>
        <td style="border: 1px solid black; padding: 8px;">${row.note}</td>
      </tr>
    `).join('');

    const footerHtml = `
      <div style="margin-top: 40px; display: flex; justify-content: space-between;">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="text-align: center; width: 50%; border: none;">
              <strong>Người lập kế hoạch</strong><br><em>(Ký và ghi rõ họ tên)</em>
              <br><br><br><br>
            </td>
            <td style="text-align: center; width: 50%; border: none;">
              <strong>Ban Giám hiệu duyệt</strong><br><em>(Ký tên và đóng dấu)</em>
              <br><br><br><br>
            </td>
          </tr>
        </table>
      </div>
    `;

    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Kế hoạch dạy học</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; }
        table { border-collapse: collapse; width: 100%; font-size: 11pt; }
        th, td { border: 1px solid black; vertical-align: top; }
      </style>
      </head>
      <body>
        ${headerHtml}
        <table>
          ${tableHeader}
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        ${footerHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KeHoach_35Tuan_${subject}_Lop${grade}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (planRows.length === 0) return alert("Vui lòng tạo kế hoạch trước khi in.");
    window.print();
  };

  return (
    <Layout onExportDocx={exportToDocx} isDataReady={planRows.length > 0}>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-8 no-print">
        {REGULATION_TAGS.map(tag => (
          <span key={tag.id} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-slate-200">
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
          Tích hợp khung năng lực số - Năm học 2025 - 2026
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-10 no-print">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Môn học</label>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:border-indigo-500"
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Khối lớp</label>
            <select 
              value={grade} 
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:border-indigo-500"
            >
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mức độ đạt được</label>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:border-indigo-500"
            >
              {ATTAINMENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className={`rounded-xl py-3.5 font-bold transition shadow-lg flex items-center justify-center space-x-2 w-full active:scale-95 ${
              isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs">{loadingMessage}</span>
              </div>
            ) : "✨ Thiết lập bằng AI"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden container-box min-h-[400px]">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 no-print">
          <h2 className="text-lg font-bold text-slate-700 uppercase flex items-center">
            <span className="w-1 h-6 bg-indigo-500 mr-3 rounded-full"></span>
            Chi tiết kế hoạch dạy học
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition"
            >
              Tải Excel (.csv)
            </button>
            <button 
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition"
            >
              In PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 print:bg-white print:text-black">
                <th className="px-6 py-4 border-r border-slate-200 w-20">Tuần</th>
                <th className="px-6 py-4 border-r border-slate-200 min-w-[280px]">Chủ đề/Mạch nội dung</th>
                <th className="px-6 py-4 border-r border-slate-200 min-w-[200px]">Tên bài học</th>
                <th className="px-6 py-4 border-r border-slate-200 w-16 text-center">Tiết</th>
                <th className="px-6 py-4 border-r border-slate-200 w-32">Mã NLS</th>
                <th className="px-6 py-4 border-r border-slate-200 min-w-[250px]">Tích hợp NLS</th>
                <th className="px-6 py-4 min-w-[150px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {planRows.length === 0 ? (
                <tr className="no-print">
                  <td colSpan={7} className="px-6 py-32 text-center">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">{loadingMessage}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-4xl">🗓️</div>
                        <p className="text-slate-400 italic">Chưa có dữ liệu. Vui lòng nhấn "Thiết lập bằng AI" để bắt đầu.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                planRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-6 py-4 border-r border-slate-100 font-bold text-slate-700 text-center">{row.weekMonth}</td>
                    <td className="px-6 py-4 border-r border-slate-100 text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                      {row.theme}
                    </td>
                    <td className="px-6 py-4 border-r border-slate-100 text-slate-900 font-bold">{row.lessonName}</td>
                    <td className="px-6 py-4 border-r border-slate-100 text-center font-bold text-indigo-600 print:text-black">{row.periods}</td>
                    <td className="px-6 py-4 border-r border-slate-100 text-center">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold border border-indigo-100 badge-nls">
                        {row.digitalCompetencyCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-100 text-slate-600 text-xs leading-relaxed italic">
                      {row.integrationSuggestions}
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={row.note}
                        onChange={(e) => updateNote(row.id, e.target.value)}
                        className="w-full bg-transparent border-none text-xs focus:ring-0 placeholder-slate-300 print:placeholder-transparent" 
                        placeholder="Nhập ghi chú..."
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="print-footer">
        <div className="text-center w-64">
          <p className="font-bold">Người lập kế hoạch</p>
          <p className="italic text-xs">(Ký và ghi rõ họ tên)</p>
          <div className="h-20"></div>
        </div>
        <div className="text-center w-64">
          <p className="font-bold">Ban Giám hiệu duyệt</p>
          <p className="italic text-xs">(Ký tên và đóng dấu)</p>
          <div className="h-20"></div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
