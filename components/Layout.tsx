
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              E
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">EduPlan Pro</h1>
              <p className="text-xs text-slate-500">Tích hợp Năng lực số - GDPT 2018</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Tổng quan</a>
            <a href="#" className="text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 pb-1">35 Tuần Học</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Báo cáo</a>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
              Xuất kế hoạch (.docx)
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; 2025 EduPlan Pro. Hỗ trợ chuyển đổi số giáo dục Tiểu học.
        </div>
      </footer>
    </div>
  );
};
