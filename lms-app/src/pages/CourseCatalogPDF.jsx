import { useRef, useState } from 'react';
import { MOCK_COURSES } from '../data/mockCourses';
import { Download, Printer, BookOpen, Users, Star, Clock, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const levelColors = {
  BEGINNER:     { bg: '#dcfce7', text: '#15803d' },
  INTERMEDIATE: { bg: '#fef9c3', text: '#a16207' },
  ADVANCED:     { bg: '#fee2e2', text: '#b91c1c' },
};

const categoryIcons = {
  Fitness:              '🏋️',
  Healthcare:           '🏥',
  Wellness:             '🧘',
  Nutrition:            '🥗',
  'Personal Development': '🚀',
  Technology:           '💻',
  Backend:              '⚙️',
  Frontend:             '🎨',
  DevOps:               '🐳',
  default:              '📚',
};

// Group courses by category
function groupByCategory(courses) {
  return courses.reduce((acc, c) => {
    const cat = c.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});
}

export default function CourseCatalogPDF() {
  const printRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const grouped = groupByCategory(MOCK_COURSES);
  const totalStudents = MOCK_COURSES.reduce((s, c) => s + (c.enrollmentCount || 0), 0);
  const freeCourses   = MOCK_COURSES.filter(c => !c.price || c.price === 0).length;

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const el = printRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageW  = pdf.internal.pageSize.getWidth();
      const pageH  = pdf.internal.pageSize.getHeight();
      const ratio  = canvas.width / canvas.height;
      const imgW   = pageW;
      const imgH   = imgW / ratio;
      const pages  = Math.ceil(imgH / pageH);

      for (let i = 0; i < pages; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -(i * pageH), imgW, imgH);
      }

      pdf.save('LearnHub-Course-Catalog.pdf');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      {/* Toolbar — hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Catalog</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {MOCK_COURSES.length} courses · Download or print as PDF
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleDownloadPDF} disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            <Download size={16} />
            {generating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── PDF Content ─────────────────────────────────────────────────── */}
      <div ref={printRef} style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }}
        className="print:block">

        {/* Cover Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          padding: '48px 40px 40px',
          color: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              📖
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>LearnHub</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 8px', letterSpacing: -1 }}>
            Course Catalog 2025
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 32px' }}>
            Fitness · Healthcare · Wellness · Nutrition · Personal Development · Technology
          </p>

          {/* Summary stats */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { icon: '📚', label: 'Total Courses',   value: MOCK_COURSES.length },
              { icon: '👥', label: 'Total Students',  value: totalStudents.toLocaleString() },
              { icon: '✅', label: 'Free Courses',    value: freeCourses },
              { icon: '🏷️', label: 'Categories',      value: Object.keys(grouped).length },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 20px', minWidth: 110 }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Table of Contents */}
        <div style={{ padding: '32px 40px 0', borderBottom: '2px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Table of Contents</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 24px', paddingBottom: 24 }}>
            {Object.entries(grouped).map(([cat, courses], i) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{categoryIcons[cat] || categoryIcons.default}</span>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{cat}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280', background: '#f3f4f6', borderRadius: 20, padding: '1px 8px' }}>
                  {courses.length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories & Courses */}
        {Object.entries(grouped).map(([category, courses]) => (
          <div key={category} style={{ padding: '32px 40px 0' }}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid #e5e7eb' }}>
              <span style={{ fontSize: 24 }}>{categoryIcons[category] || categoryIcons.default}</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>{category}</h2>
              <span style={{ marginLeft: 8, fontSize: 12, color: '#6366f1', background: '#eef2ff', borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>
                {courses.length} course{courses.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Course grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
              {courses.map(course => {
                const lvl = levelColors[course.level] || { bg: '#f3f4f6', text: '#374151' };
                return (
                  <div key={course.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    pageBreakInside: 'avoid',
                  }}>
                    {/* Course image */}
                    <div style={{ position: 'relative', height: 130, overflow: 'hidden', background: '#f3f4f6' }}>
                      <img
                        src={course.thumbnailUrl || `https://placehold.co/400x130/6366f1/white?text=${encodeURIComponent(course.title?.[0] ?? 'C')}`}
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        crossOrigin="anonymous"
                      />
                      {/* Level badge */}
                      <span style={{
                        position: 'absolute', top: 8, left: 8,
                        background: lvl.bg, color: lvl.text,
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      }}>
                        {course.level}
                      </span>
                      {/* Price badge */}
                      <span style={{
                        position: 'absolute', top: 8, right: 8,
                        background: course.price ? '#1e1b4b' : '#14532d',
                        color: '#ffffff',
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      }}>
                        {course.price ? `$${course.price}` : 'FREE'}
                      </span>
                    </div>

                    {/* Course info */}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {course.category}
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.description}
                      </p>

                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                        <span>📖 {course.lessonCount} lessons</span>
                        <span>👥 {(course.enrollmentCount || 0).toLocaleString()} students</span>
                        {course.rating && <span>⭐ {course.rating}</span>}
                      </div>

                      {/* Instructor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#4f46e5' }}>
                          {course.instructorName?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{course.instructorName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '24px 40px', marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#4f46e5' }}>📖 LearnHub</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Your gateway to knowledge</div>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
              <div>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>© 2025 LearnHub · All rights reserved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #root * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          [data-print-content], [data-print-content] * { visibility: visible; }
        }
        @page { margin: 0; size: A4; }
      `}</style>
    </div>
  );
}
