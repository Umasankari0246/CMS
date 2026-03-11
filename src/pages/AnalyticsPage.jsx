import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cmsRoles, getValidRole, roleMenuGroups } from '../data/roleConfig';

// ─── Icons ────────────────────────────────────────────────────────────────────
function GraduationIcon() {
  return <svg viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 2.26L19.02 9 12 12.74 4.98 9 12 5.26zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" /></svg>;
}
function MenuIcon() {
  return <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>;
}
function LogoutIcon() {
  return <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>;
}
function BackIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="#6b7280"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>;
}
function FilterIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>;
}
function ChevronIcon() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 10l5 5 5-5H7z" /></svg>;
}
function AlertIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>;
}
function TrendUpIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" /></svg>;
}
function TrendDownIcon() {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z" /></svg>;
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  blue: '#2563eb', cyan: '#06b6d4', green: '#22c55e',
  orange: '#f97316', purple: '#8b5cf6', red: '#ef4444',
  teal: '#14b8a6', pink: '#ec4899', amber: '#f59e0b',
};
const PIE_COLORS = [C.blue, C.green, C.orange, C.purple, C.red, C.teal];

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
};

// ─── Role filter config ───────────────────────────────────────────────────────
const ROLE_FILTERS = {
  student: {
    semester: ['Semester 4 (Current)', 'Semester 3', 'Semester 2', 'Semester 1'],
    course:   ['All Courses', 'DBMS', 'Data Structures', 'Physics', 'Mathematics', 'CS Elective'],
    month:    ['March 2026', 'February 2026', 'January 2026', 'December 2025'],
  },
  faculty: {
    semester: ['Semester 4 (Current)', 'Semester 3', 'Semester 2'],
    course:   ['All Classes', 'CS 6.001', 'CS 6.002', 'Physics 8.01', 'Math 18.01'],
    month:    ['March 2026', 'February 2026', 'January 2026'],
  },
  admin: {
    semester:   ['Semester 4 (Current)', 'Semester 3', 'Semester 2', 'Semester 1'],
    department: ['All Departments', 'Computer Science', 'Physics', 'Mathematics', 'Electronics', 'Mechanical'],
    month:      ['March 2026', 'February 2026', 'January 2026', 'Q1 2026'],
  },
  finance: {
    semester:   ['Semester 4 (Current)', 'Semester 3', 'Semester 2'],
    department: ['All Departments', 'Computer Science', 'Physics', 'Mathematics', 'Electronics'],
    month:      ['March 2026', 'February 2026', 'January 2026', 'Q1 2026'],
  },
};

// ─── Sample data per role ─────────────────────────────────────────────────────

// STUDENT data
const studentAttendanceBySubject = [
  { subject: 'DBMS',          pct: 92 },
  { subject: 'Data Struct.',  pct: 85 },
  { subject: 'Physics',       pct: 76 },
  { subject: 'Mathematics',   pct: 88 },
  { subject: 'CS Elective',   pct: 95 },
  { subject: 'English',       pct: 70 },
];
const studentMarksProgress = [
  { test: 'Test 1',  DBMS: 72, DS: 68, Phy: 60, Math: 75 },
  { test: 'Test 2',  DBMS: 78, DS: 74, Phy: 65, Math: 80 },
  { test: 'Mid Sem', DBMS: 82, DS: 79, Phy: 70, Math: 85 },
  { test: 'Test 3',  DBMS: 85, DS: 82, Phy: 74, Math: 88 },
];
const studentAssignmentCompletion = [
  { week: 'Wk 1', completed: 4, pending: 1 },
  { week: 'Wk 2', completed: 5, pending: 0 },
  { week: 'Wk 3', completed: 3, pending: 2 },
  { week: 'Wk 4', completed: 5, pending: 0 },
  { week: 'Wk 5', completed: 4, pending: 1 },
  { week: 'Wk 6', completed: 5, pending: 0 },
];
const studentInsights = {
  improvement: [
    { subject: 'English',  attendance: '70%', lastGrade: 'C+', risk: 'high'   },
    { subject: 'Physics',  attendance: '76%', lastGrade: 'B-', risk: 'medium' },
  ],
  recentGrades: [
    { subject: 'DBMS',        grade: 'A',  score: 85, date: 'Mar 08' },
    { subject: 'Mathematics', grade: 'A+', score: 92, date: 'Mar 06' },
    { subject: 'Data Struct.',grade: 'B+', score: 79, date: 'Mar 05' },
  ],
  deadlines: [
    { title: 'DBMS Assignment 3',  due: 'Mar 20, 2026', status: 'pending'  },
    { title: 'Physics Lab Report', due: 'Mar 22, 2026', status: 'pending'  },
    { title: 'Math Problem Set 4', due: 'Mar 25, 2026', status: 'upcoming' },
  ],
};

// FACULTY data
const facultyAttendanceTrend = [
  { week: 'Wk 1', CS6001: 91, CS6002: 88, Phy801: 85 },
  { week: 'Wk 2', CS6001: 89, CS6002: 84, Phy801: 82 },
  { week: 'Wk 3', CS6001: 93, CS6002: 86, Phy801: 80 },
  { week: 'Wk 4', CS6001: 87, CS6002: 90, Phy801: 84 },
  { week: 'Wk 5', CS6001: 92, CS6002: 88, Phy801: 87 },
  { week: 'Wk 6', CS6001: 90, CS6002: 85, Phy801: 83 },
];
const facultySubmissionRate = [
  { week: 'Wk 1', onTime: 42, late: 5, missing: 3 },
  { week: 'Wk 2', onTime: 38, late: 8, missing: 4 },
  { week: 'Wk 3', onTime: 44, late: 4, missing: 2 },
  { week: 'Wk 4', onTime: 40, late: 7, missing: 3 },
  { week: 'Wk 5', onTime: 46, late: 3, missing: 1 },
  { week: 'Wk 6', onTime: 43, late: 5, missing: 2 },
];
const facultyMarksDistribution = [
  { range: 'O (≥90)', count: 12 },
  { range: 'A+ (80-89)', count: 18 },
  { range: 'A  (70-79)', count: 22 },
  { range: 'B+ (60-69)', count: 14 },
  { range: 'B  (50-59)', count: 8  },
  { range: 'F  (<50)',   count: 4  },
];
const facultyInsights = {
  lowAttendance: [
    { name: 'Ravi Kumar',    rollNo: 'CS21041', attendance: '62%', course: 'CS 6.001' },
    { name: 'Sneha Patel',   rollNo: 'CS21053', attendance: '65%', course: 'CS 6.002' },
    { name: 'Arjun Sharma',  rollNo: 'PH21012', attendance: '68%', course: 'PHY 8.01' },
  ],
  missingAssignments: [
    { name: 'Priya Nair',    rollNo: 'CS21034', missing: 3, course: 'CS 6.001' },
    { name: 'Amit Singh',    rollNo: 'CS21067', missing: 2, course: 'CS 6.002' },
  ],
  topStudents: [
    { name: 'Alex Chen',     rollNo: 'CS21001', avg: '94%', grade: 'O'  },
    { name: 'Maria Gomez',   rollNo: 'CS21008', avg: '91%', grade: 'O'  },
    { name: 'James Kim',     rollNo: 'CS21015', avg: '88%', grade: 'A+' },
  ],
};

// ADMIN data
const adminEnrollmentTrend = [
  { year: '2021', CS: 180, Phy: 120, Math: 100, ECE: 150, Mech: 130 },
  { year: '2022', CS: 200, Phy: 115, Math: 105, ECE: 160, Mech: 125 },
  { year: '2023', CS: 230, Phy: 118, Math: 110, ECE: 155, Mech: 128 },
  { year: '2024', CS: 260, Phy: 122, Math: 108, ECE: 162, Mech: 132 },
  { year: '2025', CS: 280, Phy: 125, Math: 112, ECE: 170, Mech: 135 },
];
const adminDeptStudents = [
  { dept: 'CS',   students: 820 },
  { dept: 'Phys', students: 440 },
  { dept: 'Math', students: 380 },
  { dept: 'ECE',  students: 560 },
  { dept: 'Mech', students: 490 },
];
const adminAttendanceAvg = [
  { month: 'Sep', avg: 88 }, { month: 'Oct', avg: 86 }, { month: 'Nov', avg: 84 },
  { month: 'Dec', avg: 80 }, { month: 'Jan', avg: 87 }, { month: 'Feb', avg: 89 },
  { month: 'Mar', avg: 91 },
];
const adminExamPerformance = [
  { dept: 'CS',   pass: 94, fail: 6  },
  { dept: 'Phys', pass: 88, fail: 12 },
  { dept: 'Math', pass: 85, fail: 15 },
  { dept: 'ECE',  pass: 91, fail: 9  },
  { dept: 'Mech', pass: 87, fail: 13 },
];
const adminInsights = {
  lowAttendance: [
    { dept: 'Mathematics', count: 34, threshold: '<75%' },
    { dept: 'Physics',     count: 28, threshold: '<75%' },
    { dept: 'Mechanical',  count: 22, threshold: '<75%' },
  ],
  topDepts: [
    { dept: 'Computer Science', avgScore: '87%', passRate: '94%' },
    { dept: 'Electronics',      avgScore: '84%', passRate: '91%' },
    { dept: 'Physics',          avgScore: '81%', passRate: '88%' },
  ],
  newAdmissions: [
    { name: 'Kavya Reddy',  dept: 'CS',   date: 'Mar 10' },
    { name: 'Rohan Mehta',  dept: 'ECE',  date: 'Mar 09' },
    { name: 'Tanya Joshi',  dept: 'Math', date: 'Mar 08' },
    { name: 'Vikram Nair',  dept: 'Phys', date: 'Mar 07' },
  ],
};

// FINANCE data
const financeMonthlyCollection = [
  { month: 'Sep', collected: 4200000, target: 4500000 },
  { month: 'Oct', collected: 3800000, target: 4000000 },
  { month: 'Nov', collected: 4100000, target: 4200000 },
  { month: 'Dec', collected: 2200000, target: 2500000 },
  { month: 'Jan', collected: 4400000, target: 4500000 },
  { month: 'Feb', collected: 4050000, target: 4200000 },
  { month: 'Mar', collected: 2800000, target: 4500000 },
];
const financePaidPending = [
  { name: 'Paid',    value: 72 },
  { name: 'Pending', value: 18 },
  { name: 'Overdue', value: 10 },
];
const financeDeptWise = [
  { dept: 'CS',   paid: 680, pending: 88, overdue: 52 },
  { dept: 'Phys', paid: 320, pending: 62, overdue: 38 },
  { dept: 'Math', paid: 280, pending: 54, overdue: 26 },
  { dept: 'ECE',  paid: 440, pending: 72, overdue: 48 },
  { dept: 'Mech', paid: 370, pending: 68, overdue: 42 },
];
const financeInsights = {
  pendingStudents: [
    { name: 'Ravi Kumar',   rollNo: 'CS21041', amount: '₹45,000', due: 'Mar 25',  dept: 'CS'   },
    { name: 'Sneha Patel',  rollNo: 'PH21053', amount: '₹42,000', due: 'Mar 25',  dept: 'Phys' },
    { name: 'Arjun Sharma', rollNo: 'ME21022', amount: '₹38,000', due: 'Mar 20',  dept: 'Mech' },
    { name: 'Priya Nair',   rollNo: 'EC21034', amount: '₹44,000', due: 'Mar 15',  dept: 'ECE'  },
  ],
  topDepts: [
    { dept: 'CS',   collected: '₹68L', rate: '88%' },
    { dept: 'ECE',  collected: '₹44L', rate: '82%' },
    { dept: 'Mech', collected: '₹37L', rate: '80%' },
  ],
  overdue: [
    { name: 'Vikram Singh',  rollNo: 'CS21067', amount: '₹45,000', overdueDays: 15 },
    { name: 'Meena Patel',   rollNo: 'PH21044', amount: '₹42,000', overdueDays: 22 },
    { name: 'Karan Mehta',   rollNo: 'ME21018', amount: '₹38,000', overdueDays: 8  },
  ],
};

// ─── Role summary cards ───────────────────────────────────────────────────────
const SUMMARY_CARDS = {
  student: [
    { label: 'Attendance',          value: '84%',  sub: '↑ 2% this month', tone: 'blue',   icon: '📅', trend: 'up'   },
    { label: 'Assignments Done',     value: '26/30',sub: '4 pending',        tone: 'green',  icon: '✅', trend: 'up'   },
    { label: 'CGPA',                 value: '8.6',  sub: '↑ 0.2 this sem',  tone: 'purple', icon: '🎯', trend: 'up'   },
    { label: 'Upcoming Exams',       value: '3',    sub: 'Next: Mar 18',    tone: 'orange', icon: '📝', trend: null   },
  ],
  faculty: [
    { label: 'Students in Class',    value: '156',  sub: 'Across 4 courses', tone: 'blue',   icon: '👥', trend: null   },
    { label: 'Avg Attendance',       value: '87%',  sub: '↑ 3% vs last wk', tone: 'green',  icon: '📅', trend: 'up'   },
    { label: 'Assignments Submitted',value: '612',  sub: '94% submission',  tone: 'purple', icon: '📋', trend: 'up'   },
    { label: 'Pending Assignments',  value: '38',   sub: '2 overdue',       tone: 'orange', icon: '⚠️', trend: 'down' },
  ],
  admin: [
    { label: 'Total Students',       value: '2,690',sub: '↑ 42 this month', tone: 'blue',   icon: '🎓', trend: 'up'   },
    { label: 'Total Faculty',        value: '400',  sub: '8 departments',   tone: 'green',  icon: '👨‍🏫',trend: null   },
    { label: 'Departments',          value: '5',    sub: '48 courses',      tone: 'purple', icon: '🏫', trend: null   },
    { label: 'Active Courses',       value: '48',   sub: 'Spring 2026',     tone: 'orange', icon: '📚', trend: 'up'   },
  ],
  finance: [
    { label: 'Total Fees Collected', value: '₹2.4Cr',sub: '72% of target',  tone: 'blue',   icon: '💰', trend: 'up'   },
    { label: 'Pending Fees',         value: '₹48L', sub: '18% unpaid',      tone: 'orange', icon: '⏳', trend: 'down' },
    { label: 'Scholarships',         value: '142',  sub: '₹14.2L disbursed',tone: 'green',  icon: '🎓', trend: 'up'   },
    { label: 'Late Payments',        value: '28',   sub: 'Avg 12 days late',tone: 'purple', icon: '🔴', trend: 'down' },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return (n / 100000).toFixed(1) + 'L'; }

function FilterDropdown({ label, options, value, onChange }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          height: 38, paddingLeft: 12, paddingRight: 32,
          borderRadius: 9, border: '1.5px solid #e5e7eb',
          background: '#fff', fontSize: 13, fontWeight: 600,
          color: '#374151', cursor: 'pointer', outline: 'none',
          appearance: 'none', WebkitAppearance: 'none',
          transition: 'border 0.15s', minWidth: 160,
        }}
        onFocus={e => (e.target.style.borderColor = '#2563eb')}
        onBlur={e  => (e.target.style.borderColor = '#e5e7eb')}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <ChevronIcon />
      </span>
    </div>
  );
}

function SummaryCard({ label, value, sub, tone, icon, trend }) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-sub" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              {trend === 'up'   && <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center' }}><TrendUpIcon /></span>}
              {trend === 'down' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}><TrendDownIcon /></span>}
              {sub}
            </div>
          </div>
          <span style={{ fontSize: 26, opacity: 0.55, marginTop: 2 }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, span2 }) {
  return (
    <div className="content-card" style={{ marginBottom: 0, gridColumn: span2 ? 'span 2' : 'span 1' }}>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <span className="section-title">{title}</span>
          {subtitle && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function InsightCard({ title, icon, children }) {
  return (
    <div className="content-card" style={{ marginBottom: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span className="section-title" style={{ fontSize: 15 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function InsightRow({ children, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 12px', borderRadius: 9,
      background: accent || '#f9fafb', border: '1px solid #f3f4f6',
      marginBottom: 8, gap: 8, flexWrap: 'wrap',
    }}>
      {children}
    </div>
  );
}

function RiskBadge({ level }) {
  const map = { high: ['#fef2f2','#b91c1c'], medium: ['#fff7ed','#c2410c'], low: ['#f0fdf4','#15803d'] };
  const [bg, color] = map[level] || map.low;
  return <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: bg, color, textTransform: 'uppercase' }}>{level}</span>;
}

function GradeBadge({ grade }) {
  const map = { O: '#15803d', 'A+': '#1d4ed8', A: '#2563eb', 'B+': '#7c3aed', B: '#d97706', F: '#b91c1c' };
  return (
    <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 9px', borderRadius: 999, background: '#f3f4f6', color: map[grade] || '#6b7280' }}>
      {grade}
    </span>
  );
}

const tH = { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.4, padding: '6px 10px', textAlign: 'left', whiteSpace: 'nowrap' };
const tD = { fontSize: 13, padding: '10px 10px', verticalAlign: 'middle', borderBottom: '1px solid #f9fafb' };

const chartH = 210;

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function AnalyticsPage({ role: propRole }) {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storedRole = localStorage.getItem('cmsRole') || 'student';
  const role       = getValidRole(propRole || searchParams.get('role') || storedRole);
  const data       = cmsRoles[role];
  const menuGroups = roleMenuGroups[role] || roleMenuGroups.student;
  const filterCfg  = ROLE_FILTERS[role] || ROLE_FILTERS.student;

  // ── Filter state
  const [semester,   setSemester]   = useState(filterCfg.semester?.[0]   || '');
  const [department, setDepartment] = useState(filterCfg.department?.[0] || filterCfg.course?.[0] || '');
  const [month,      setMonth]      = useState(filterCfg.month?.[0]      || '');

  useEffect(() => {
    document.title = `MIT Connect – ${data.label} Analytics`;
    localStorage.setItem('cmsRole', role);
  }, [data.label, role]);

  function handleLogout() {
    localStorage.removeItem('cmsRole');
    localStorage.removeItem('cmsUserId');
    navigate('/');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FILTER BAR (shared)
  // ─────────────────────────────────────────────────────────────────────────────
  function FilterBar() {
    return (
      <div className="content-card" style={{ marginBottom: 24, padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 4 }}>
            <FilterIcon /> Filters:
          </span>

          {filterCfg.semester && (
            <FilterDropdown
              label="Semester"
              options={filterCfg.semester}
              value={semester}
              onChange={setSemester}
            />
          )}

          {filterCfg.department && (
            <FilterDropdown
              label="Department"
              options={filterCfg.department}
              value={department}
              onChange={setDepartment}
            />
          )}

          {filterCfg.course && (
            <FilterDropdown
              label="Course"
              options={filterCfg.course}
              value={department}
              onChange={setDepartment}
            />
          )}

          {filterCfg.month && (
            <FilterDropdown
              label="Month"
              options={filterCfg.month}
              value={month}
              onChange={setMonth}
            />
          )}

          <button
            type="button"
            onClick={() => {
              setSemester(filterCfg.semester?.[0] || '');
              setDepartment(filterCfg.department?.[0] || filterCfg.course?.[0] || '');
              setMonth(filterCfg.month?.[0] || '');
            }}
            style={{
              marginLeft: 'auto', height: 38, padding: '0 14px',
              borderRadius: 9, border: '1.5px solid #e5e7eb',
              background: '#f9fafb', color: '#6b7280',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Reset
          </button>

          {/* Active filter pills */}
          <div style={{ width: '100%', display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {[semester, department, month].filter(Boolean).map((v, i) => (
              <span key={i} style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px',
                borderRadius: 999, background: '#eff6ff',
                color: '#2563eb', border: '1px solid #bfdbfe',
              }}>
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDENT VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  function StudentAnalytics() {
    return (
      <>
        {/* Summary */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {SUMMARY_CARDS.student.map(c => <SummaryCard key={c.label} {...c} />)}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

          <ChartCard title="📊 Attendance per Subject" subtitle="Current semester %">
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={studentAttendanceBySubject} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
                <Bar dataKey="pct" name="Attendance %" radius={[6, 6, 0, 0]}>
                  {studentAttendanceBySubject.map((d, i) => (
                    <Cell key={i} fill={d.pct < 75 ? C.red : d.pct < 85 ? C.orange : C.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11, color: '#6b7280' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: C.red, marginRight: 4 }} />Below 75%</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: C.orange, marginRight: 4 }} />75–84%</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: C.blue, marginRight: 4 }} />85%+</span>
            </div>
          </ChartCard>

          <ChartCard title="📈 Marks Progress" subtitle="Score across tests">
            <ResponsiveContainer width="100%" height={chartH}>
              <LineChart data={studentMarksProgress} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="test" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="DBMS" stroke={C.blue}   strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="DS"   stroke={C.cyan}   strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Phy"  stroke={C.orange} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Math" stroke={C.green}  strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="✅ Assignment Completion" subtitle="Weekly submitted vs pending" span2>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={studentAssignmentCompletion} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill={C.green}  radius={[0,0,0,0]} />
                <Bar dataKey="pending"   name="Pending"   stackId="a" fill={C.orange} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Insights */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span className="section-title">Detailed Insights</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

            <InsightCard title="Subjects Needing Improvement" icon="⚠️">
              {studentInsights.improvement.map((s, i) => (
                <InsightRow key={i} accent={s.risk === 'high' ? '#fff5f5' : '#fffbeb'}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{s.subject}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Attendance: {s.attendance} · Grade: {s.lastGrade}</div>
                  </div>
                  <RiskBadge level={s.risk} />
                </InsightRow>
              ))}
            </InsightCard>

            <InsightCard title="Recent Grades" icon="📊">
              {studentInsights.recentGrades.map((g, i) => (
                <InsightRow key={i}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{g.subject}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{g.date} · Score: {g.score}</div>
                  </div>
                  <GradeBadge grade={g.grade} />
                </InsightRow>
              ))}
            </InsightCard>

            <InsightCard title="Upcoming Deadlines" icon="📅">
              {studentInsights.deadlines.map((d, i) => (
                <InsightRow key={i} accent={d.status === 'pending' ? '#fffbeb' : undefined}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{d.title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Due: {d.due}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: d.status === 'pending' ? '#fff7ed' : '#eff6ff', color: d.status === 'pending' ? '#c2410c' : '#1d4ed8', textTransform: 'uppercase' }}>{d.status}</span>
                </InsightRow>
              ))}
            </InsightCard>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FACULTY VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  function FacultyAnalytics() {
    return (
      <>
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {SUMMARY_CARDS.faculty.map(c => <SummaryCard key={c.label} {...c} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

          <ChartCard title="📅 Attendance Trend" subtitle="Weekly % per course">
            <ResponsiveContainer width="100%" height={chartH}>
              <LineChart data={facultyAttendanceTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="CS6001" stroke={C.blue}   strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="CS6002" stroke={C.cyan}   strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Phy801" stroke={C.orange} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="📋 Submission Rate" subtitle="On-time vs late vs missing">
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={facultySubmissionRate} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="onTime"  name="On Time" stackId="a" fill={C.green}  radius={[0,0,0,0]} />
                <Bar dataKey="late"    name="Late"    stackId="a" fill={C.orange} radius={[0,0,0,0]} />
                <Bar dataKey="missing" name="Missing" stackId="a" fill={C.red}    radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="📊 Marks Distribution" subtitle="Grade-range breakdown" span2>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={facultyMarksDistribution} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                  {facultyMarksDistribution.map((d, i) => (
                    <Cell key={i} fill={[C.green, C.blue, C.cyan, C.purple, C.orange, C.red][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Insights */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span className="section-title">Detailed Insights</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

            <InsightCard title="Low Attendance Students" icon="⚠️">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={tH}>Name</th><th style={tH}>Course</th><th style={tH}>%</th>
                </tr></thead>
                <tbody>
                  {facultyInsights.lowAttendance.map((s, i) => (
                    <tr key={i}>
                      <td style={tD}><div style={{ fontWeight: 600, fontSize: 12 }}>{s.name}</div><div style={{ fontSize: 10, color: '#9ca3af' }}>{s.rollNo}</div></td>
                      <td style={{ ...tD, fontSize: 11, color: '#6b7280' }}>{s.course}</td>
                      <td style={tD}><span style={{ fontWeight: 800, fontSize: 13, color: '#ef4444' }}>{s.attendance}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </InsightCard>

            <InsightCard title="Missing Assignments" icon="📋">
              {facultyInsights.missingAssignments.map((s, i) => (
                <InsightRow key={i} accent="#fff5f5">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.rollNo} · {s.course}</div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#b91c1c', background: '#fef2f2', padding: '3px 9px', borderRadius: 999 }}>{s.missing} missing</span>
                </InsightRow>
              ))}
            </InsightCard>

            <InsightCard title="Top Performing Students" icon="🏆">
              {facultyInsights.topStudents.map((s, i) => (
                <InsightRow key={i} accent={i === 0 ? '#fffbeb' : undefined}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{['🥇','🥈','🥉'][i]}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.rollNo}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{s.avg}</span>
                    <GradeBadge grade={s.grade} />
                  </div>
                </InsightRow>
              ))}
            </InsightCard>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ADMIN VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  function AdminAnalytics() {
    return (
      <>
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {SUMMARY_CARDS.admin.map(c => <SummaryCard key={c.label} {...c} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

          <ChartCard title="📈 Student Enrollment Trend" subtitle="Year-on-year by department">
            <ResponsiveContainer width="100%" height={chartH}>
              <AreaChart data={adminEnrollmentTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  {[['gCS', C.blue], ['gPhy', C.cyan], ['gMath', C.green], ['gECE', C.orange], ['gMech', C.purple]].map(([id, color]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={color} stopOpacity={0}   />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="CS"   stroke={C.blue}   strokeWidth={2} fill="url(#gCS)"   />
                <Area type="monotone" dataKey="ECE"  stroke={C.orange} strokeWidth={2} fill="url(#gECE)"  />
                <Area type="monotone" dataKey="Mech" stroke={C.purple} strokeWidth={2} fill="url(#gMech)" />
                <Area type="monotone" dataKey="Phy"  stroke={C.cyan}   strokeWidth={2} fill="url(#gPhy)"  />
                <Area type="monotone" dataKey="Math" stroke={C.green}  strokeWidth={2} fill="url(#gMath)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="🏫 Department-wise Students" subtitle="Total enrolled per department">
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={adminDeptStudents} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="students" name="Students" radius={[6, 6, 0, 0]}>
                  {adminDeptStudents.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="📅 Attendance Average" subtitle="Monthly college-wide average %">
            <ResponsiveContainer width="100%" height={chartH}>
              <LineChart data={adminAttendanceAvg} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
                <Line type="monotone" dataKey="avg" name="Avg Attendance" stroke={C.blue} strokeWidth={2.5} dot={{ r: 4, fill: C.blue }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="📝 Exam Performance" subtitle="Pass vs fail % by department">
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={adminExamPerformance} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="pass" name="Pass %" stackId="a" fill={C.green}  radius={[0,0,0,0]} />
                <Bar dataKey="fail" name="Fail %" stackId="a" fill={C.red}    radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Insights */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span className="section-title">Detailed Insights</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

            <InsightCard title="Low Attendance Departments" icon="⚠️">
              {adminInsights.lowAttendance.map((d, i) => (
                <InsightRow key={i} accent="#fff5f5">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{d.dept}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Threshold: {d.threshold}</div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: '#ef4444' }}>{d.count} students</span>
                </InsightRow>
              ))}
            </InsightCard>

            <InsightCard title="Top Departments" icon="🏆">
              {adminInsights.topDepts.map((d, i) => (
                <InsightRow key={i} accent={i === 0 ? '#fffbeb' : undefined}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{['🥇','🥈','🥉'][i]}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{d.dept}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Pass: {d.passRate}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#2563eb' }}>{d.avgScore}</span>
                </InsightRow>
              ))}
            </InsightCard>

            <InsightCard title="New Admissions" icon="🎓">
              {adminInsights.newAdmissions.map((a, i) => (
                <InsightRow key={i}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.date}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: '#eff6ff', color: '#2563eb' }}>{a.dept}</span>
                </InsightRow>
              ))}
            </InsightCard>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FINANCE VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  function FinanceAnalytics() {
    return (
      <>
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {SUMMARY_CARDS.finance.map(c => <SummaryCard key={c.label} {...c} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>

          <ChartCard title="💰 Monthly Fee Collection" subtitle="Collected vs target">
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={financeMonthlyCollection} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${fmt(v)}`} />
                <Tooltip {...tooltipStyle} formatter={v => `₹${fmt(v)}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="target"    name="Target"    fill="#e5e7eb"  radius={[6,6,0,0]} />
                <Bar dataKey="collected" name="Collected" fill={C.blue}   radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="📊 Paid vs Pending" subtitle="Overall fee payment status">
            <ResponsiveContainer width="100%" height={chartH}>
              <PieChart>
                <Pie data={financePaidPending} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value">
                  {financePaidPending.map((_, i) => <Cell key={i} fill={[C.green, C.orange, C.red][i]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="🏫 Department-wise Fee Payment" subtitle="Paid vs pending vs overdue per department">
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={financeDeptWise} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="paid"    name="Paid"    stackId="a" fill={C.green}  radius={[0,0,0,0]} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill={C.orange} radius={[0,0,0,0]} />
              <Bar dataKey="overdue" name="Overdue" stackId="a" fill={C.red}    radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Insights */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span className="section-title">Detailed Insights</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 20 }}>

            <InsightCard title="Students with Pending Fees" icon="⏳">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={tH}>Student</th>
                  <th style={tH}>Dept</th>
                  <th style={tH}>Amount</th>
                  <th style={tH}>Due</th>
                </tr></thead>
                <tbody>
                  {financeInsights.pendingStudents.map((s, i) => (
                    <tr key={i}>
                      <td style={tD}><div style={{ fontWeight: 600, fontSize: 12 }}>{s.name}</div><div style={{ fontSize: 10, color: '#9ca3af' }}>{s.rollNo}</div></td>
                      <td style={{ ...tD, fontSize: 11 }}><span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 7px', borderRadius: 999, fontWeight: 700, fontSize: 11 }}>{s.dept}</span></td>
                      <td style={{ ...tD, fontWeight: 700, color: '#c2410c', fontSize: 12 }}>{s.amount}</td>
                      <td style={{ ...tD, fontSize: 11, color: '#9ca3af' }}>{s.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </InsightCard>

            <InsightCard title="Top Collecting Departments" icon="🏆">
              {financeInsights.topDepts.map((d, i) => (
                <InsightRow key={i} accent={i === 0 ? '#fffbeb' : undefined}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span>{['🥇','🥈','🥉'][i]}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{d.dept}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Rate: {d.rate}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#16a34a' }}>{d.collected}</span>
                </InsightRow>
              ))}
            </InsightCard>

            <InsightCard title="Overdue Payments" icon="🔴">
              {financeInsights.overdue.map((o, i) => (
                <InsightRow key={i} accent="#fff5f5">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{o.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{o.rollNo}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 12, color: '#b91c1c' }}>{o.amount}</div>
                    <div style={{ fontSize: 10, color: '#ef4444' }}>{o.overdueDays}d overdue</div>
                  </div>
                </InsightRow>
              ))}
            </InsightCard>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

      <div className="dashboard-wrapper role-layout">
        {/* Sidebar */}
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark"><GraduationIcon /></div>
            <div className="logo-text-wrap">
              <div className="logo-title">MIT Connect</div>
              <div className="logo-sub">{data.label} Portal</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            {menuGroups.map((group, gi) => (
              <div key={group.title}>
                <div className="nav-section-label">{group.title}</div>
                <ul>
                  {group.items.map((item, ii) => (
                    <li key={item}>
                      <a href="#" className={gi === 0 && ii === 0 ? 'active' : ''} onClick={(e) => e.preventDefault()}>{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              <LogoutIcon /> Logout
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">

          {/* Topbar */}
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Toggle menu"><MenuIcon /></button>
              <button type="button" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px', height: 36, fontSize: 13, fontWeight: 500, color: '#6b7280', cursor: 'pointer' }}>
                <BackIcon /> Back
              </button>
              <div className="topbar-left">
                <h2>Analytics Dashboard</h2>
                <p>
                  {role === 'student' && 'Your personal performance overview'}
                  {role === 'faculty' && 'Class performance & engagement metrics'}
                  {role === 'admin'   && 'College-wide statistics and insights'}
                  {role === 'finance' && 'Fee collection and financial insights'}
                </p>
              </div>
            </div>
            <div className="topbar-right">
              <span className="badge badge-info">{data.label}</span>
            </div>
          </div>

          {/* ── 1. FILTERS ── */}
          <FilterBar />

          {/* ── 2 + 3 + 4. Summary Cards → Charts → Insights ── */}
          {role === 'student' && <StudentAnalytics />}
          {role === 'faculty' && <FacultyAnalytics />}
          {role === 'admin'   && <AdminAnalytics   />}
          {role === 'finance' && <FinanceAnalytics  />}

        </main>
      </div>
    </>
  );
}