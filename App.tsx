
import React, { useState } from 'react';
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

  const handleGenerate = async () => {
    setIsLoading(true);
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
      alert(`⚠️ Không thể tạo kế hoạch: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = (id: string, note: string) => {
    setPlanRows(prev => prev.map(row => row.id === id ? { ...row, note } : row));
  };

  const exportToExcel = () => {
    if (planRows.length === 0) return alert("Chưa có dữ liệu để xuất! Vui lòng tạo kế hoạch trước.");
    
    // Header cho file CSV
    const headers = ["Tuần", "Chủ đề", "Tên bài học", "Số tiết", "Mã NLS", "Nội dung tích hợp", "Ghi chú"];
    
    // Chuyển đổi dữ liệu, xử lý dấu phẩy và ngoặc kép để không bị lệch cột trong Excel
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
      
      // Hỗ trợ tốt hơn cho trình duyệt di động
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      alert("Lỗi khi tải file. Vui lòng thử lại.");
    }
  };

  const handlePrint = () => {
    if (planRows.length === 0) return alert("Vui lòng tạo kế hoạch trước khi in.");
    window.print();
  };

  return (
    <Layout>
      {/* Cấu hình hiển thị */}
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
          Tích hợp khung năng lực số - Năm học 2024 - 2025
        </div>
      </div>

      {/* Bộ lọc AI */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-10 no-print">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Môn học</label>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Khối lớp</label>
            <select 
              value={grade} 
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mức độ đạt được</label>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {ATTAINMENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className={`rounded-xl py-3.5 font-bold transition shadow-lg flex items-center justify-center space-x-2 w-full ${
              isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
            }`}
          >
            {isLoading ? "Đang thiết lập..." : "✨ Thiết lập bằng AI"}
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden container-box">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 no-print">
          <h2 className="text-lg font-bold text-slate-700 uppercase flex items-center">
            <span className="w-1 h-6 bg-indigo-500 mr-3 rounded-full"></span>
            Chi tiết kế hoạch
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
                <th className="px-6 py-4 border-r border-slate-200 min-w-[150px]">Chủ đề</th>
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
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic">
                    Chưa có dữ liệu. Vui lòng nhấn "Thiết lập bằng AI" để bắt đầu.
                  </td>
                </tr>
              ) : (
                planRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-6 py-4 border-r border-slate-100 font-bold text-slate-700">{row.weekMonth}</td>
                    <td className="px-6 py-4 border-r border-slate-100 text-slate-600 font-medium">{row.theme}</td>
                    <td className="px-6 py-4 border-r border-slate-100 text-slate-900 font-bold">{row.lessonName}</td>
                    <td className="px-6 py-4 border-r border-slate-100 text-center font-bold text-indigo-600 print:text-black">{row.periods}</td>
                    <td className="px-6 py-4 border-r border-slate-100">
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
      
      {/* Chữ ký khi in PDF */}
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
