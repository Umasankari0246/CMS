import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cmsRoles, getValidRole, roleMenuGroups } from '../data/roleConfig';

// ─── Icons ────────────────────────────────────────────────────────────────────
function GraduationIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 2.26L19.02 9 12 12.74 4.98 9 12 5.26zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#6b7280">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="#9ca3af">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

// ─── Role-Tab Access Matrix ───────────────────────────────────────────────────
// 'full' | 'limited' | 'readonly' | 'admin' | 'view' | 'payslip'
const ROLE_TAB_ACCESS = {
  student: { Profile: 'readonly', Security: 'full',  Appearance: 'full', Privacy: 'limited', Finance: 'view'    },
  faculty: { Profile: 'full',     Security: 'full',  Appearance: 'full', Privacy: 'full',    Finance: 'payslip' },
  admin:   { Profile: 'admin',    Security: 'admin', Appearance: 'full', Privacy: 'admin',   Finance: 'admin'   },
  finance: { Profile: 'limited',  Security: 'full',  Appearance: 'full', Privacy: 'view',    Finance: 'full'    },
};

const ALL_TABS = ['Profile', 'Security', 'Appearance', 'Privacy', 'Finance'];

const TAB_ICONS = {
  Profile:    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>,
  Security:   <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>,
  Appearance: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" /></svg>,
  Privacy:    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>,
  Finance:    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg>,
};

// ─── Access badge config ──────────────────────────────────────────────────────
const ACCESS_BADGE = {
  readonly: { label: 'Read Only',      bg: '#f3f4f6', color: '#6b7280' },
  limited:  { label: 'Limited Access', bg: '#fff7ed', color: '#c2410c' },
  full:     { label: 'Full Access',    bg: '#f0fdf4', color: '#15803d' },
  admin:    { label: 'Admin Access',   bg: '#eef2ff', color: '#6d28d9' },
  view:     { label: 'View Only',      bg: '#eff6ff', color: '#1d4ed8' },
  payslip:  { label: 'Pay Slips Only', bg: '#eff6ff', color: '#1d4ed8' },
};

// ─── Tab badge labels (short) ────────────────────────────────────────────────
const TAB_BADGE = {
  readonly: 'RO', limited: '~', full: '✓', admin: 'ADM', view: 'VIEW', payslip: 'PAY',
};
const TAB_BADGE_STYLES = {
  readonly: { bg: '#f3f4f6', color: '#9ca3af' },
  limited:  { bg: '#fff7ed', color: '#ea580c' },
  full:     { bg: '#f0fdf4', color: '#16a34a' },
  admin:    { bg: '#eef2ff', color: '#7c3aed' },
  view:     { bg: '#eff6ff', color: '#1d4ed8' },
  payslip:  { bg: '#eff6ff', color: '#1d4ed8' },
};

// ─── Finance data ─────────────────────────────────────────────────────────────
const STUDENT_FINANCE = [
  { id: 'F-2025-001', label: 'Spring 2025 Tuition', amount: '$18,400', status: 'Paid',    date: 'Jan 15 2025' },
  { id: 'F-2024-002', label: 'Fall 2024 Tuition',   amount: '$18,400', status: 'Paid',    date: 'Aug 20 2024' },
  { id: 'F-2025-003', label: 'Lab Fee – Physics',   amount: '$220',    status: 'Pending', date: 'Mar 01 2025' },
  { id: 'F-2025-004', label: 'Library Fine',        amount: '$12',     status: 'Overdue', date: 'Feb 10 2025' },
];
const FACULTY_PAYSLIPS = [
  { id: 'PS-MAR-25', label: 'March 2025 Pay Slip',    amount: '$5,200', status: 'Issued', date: 'Mar 01 2025' },
  { id: 'PS-FEB-25', label: 'February 2025 Pay Slip', amount: '$5,200', status: 'Issued', date: 'Feb 01 2025' },
  { id: 'PS-JAN-25', label: 'January 2025 Pay Slip',  amount: '$5,200', status: 'Issued', date: 'Jan 01 2025' },
];
const ALL_FINANCE = [
  { id: 'ADM-001', role: 'Student',  label: 'Alex Chen – Spring Tuition',   amount: '$18,400', status: 'Paid',     date: 'Jan 15 2025' },
  { id: 'ADM-002', role: 'Faculty',  label: 'Dr. Lin – March Salary',       amount: '$8,500',  status: 'Issued',   date: 'Mar 01 2025' },
  { id: 'ADM-003', role: 'Student',  label: 'Maria Gomez – Lab Fee',        amount: '$220',    status: 'Pending',  date: 'Mar 05 2025' },
  { id: 'ADM-004', role: 'Finance',  label: 'FO Team – Dept Budget Q1',     amount: '$42,000', status: 'Approved', date: 'Feb 28 2025' },
  { id: 'ADM-005', role: 'Student',  label: 'James Kim – Library Fine',     amount: '$12',     status: 'Overdue',  date: 'Feb 10 2025' },
  { id: 'ADM-006', role: 'Faculty',  label: 'Prof. Anand – Feb Salary',     amount: '$8,500',  status: 'Issued',   date: 'Feb 01 2025' },
];

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = { Paid: ['#f0fdf4','#15803d'], Issued: ['#eff6ff','#1d4ed8'], Pending: ['#fff7ed','#c2410c'], Overdue: ['#fef2f2','#b91c1c'], Approved: ['#eef2ff','#6d28d9'] };
  const [bg, color] = map[status] || ['#f3f4f6','#6b7280'];
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: bg, color }}>{status}</span>;
}

// ─── Access pill ──────────────────────────────────────────────────────────────
function AccessPill({ level }) {
  const { label, bg, color } = ACCESS_BADGE[level] || ACCESS_BADGE.view;
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: bg, color, letterSpacing: 0.2 }}>{label}</span>;
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ id, checked, onChange, disabled }) {
  return (
    <label htmlFor={id} style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: disabled ? 0.5 : 1 }}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
      <span style={{ position: 'absolute', inset: 0, background: checked ? 'linear-gradient(90deg,#2563eb,#06b6d4)' : '#e5e7eb', borderRadius: 999, transition: 'background 0.25s' }} />
      <span style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
    </label>
  );
}

// ─── Read-only input ──────────────────────────────────────────────────────────
function ReadOnlyField({ label, value }) {
  return (
    <div className="form-group">
      <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{label} <LockIcon /></label>
      <div style={{ height: 52, border: '1px solid #e5e7eb', borderRadius: 14, padding: '0 16px', display: 'flex', alignItems: 'center', background: '#f9fafb', color: '#9ca3af', fontSize: 14 }}>
        {value}
      </div>
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ToggleRow({ id, label, desc, val, set, disabled, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: accent ? '#faf5ff' : '#f9fafb', borderRadius: 10, border: `1px solid ${accent ? '#e9d5ff' : '#f3f4f6'}`, opacity: disabled ? 0.7 : 1 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
          {label} {disabled && <LockIcon />}
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{desc}</div>
      </div>
      <Toggle id={id} checked={val} onChange={(e) => set(e.target.checked)} disabled={disabled} />
    </div>
  );
}

// ─── Finance table ────────────────────────────────────────────────────────────
const thS = { textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' };
const tdS = { padding: '12px', verticalAlign: 'middle' };

function FinanceTable({ records, canManage, showRole }) {
  if (!records.length) return <p style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No records found.</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
            <th style={thS}>ID</th>
            {showRole && <th style={thS}>Role</th>}
            <th style={thS}>Description</th>
            <th style={thS}>Amount</th>
            <th style={thS}>Date</th>
            <th style={thS}>Status</th>
            {canManage && <th style={thS}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #f9fafb' }}>
              <td style={tdS}><span style={{ fontFamily: 'monospace', color: '#9ca3af', fontSize: 11 }}>{r.id}</span></td>
              {showRole && <td style={tdS}><span className="badge badge-gray">{r.role}</span></td>}
              <td style={{ ...tdS, fontWeight: 500, color: '#1f2937' }}>{r.label}</td>
              <td style={{ ...tdS, fontWeight: 700, color: '#1d4ed8' }}>{r.amount}</td>
              <td style={{ ...tdS, color: '#6b7280' }}>{r.date}</td>
              <td style={tdS}><StatusBadge status={r.status} /></td>
              {canManage && (
                <td style={tdS}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn-secondary-sm" style={{ height: 28, fontSize: 11, padding: '0 10px' }}>Edit</button>
                    <button type="button" className="btn-secondary-sm" style={{ height: 28, fontSize: 11, padding: '0 10px', color: '#b91c1c', borderColor: '#fca5a5' }}>Delete</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function SettingsPage({ role: propRole }) {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState('Profile');
  const [saveMsg, setSaveMsg]         = useState('');

  const storedRole = localStorage.getItem('cmsRole') || 'student';
  const role       = getValidRole(propRole || searchParams.get('role') || storedRole);
  const data       = cmsRoles[role];
  const menuGroups = roleMenuGroups[role] || roleMenuGroups.student;
  const userId     = localStorage.getItem('cmsUserId') || 'N/A';
  const access     = ROLE_TAB_ACCESS[role] || ROLE_TAB_ACCESS.student;

  useEffect(() => {
    document.title = `MIT Connect – ${data.label} Settings`;
    localStorage.setItem('cmsRole', role);
  }, [data.label, role]);

  function handleLogout() {
    localStorage.removeItem('cmsRole');
    localStorage.removeItem('cmsUserId');
    navigate('/');
  }
  function showSaved() {
    setSaveMsg('Changes saved successfully!');
    setTimeout(() => setSaveMsg(''), 2500);
  }

  // ── State: Profile
  const [displayName, setDisplayName]   = useState(data.name);
  const [email, setEmail]               = useState(`${role}@mit.edu`);
  const [bio, setBio]                   = useState(data.focus || '');
  const [department, setDepartment]     = useState(data.team || '');
  const [assignedRole, setAssignedRole] = useState(role);

  // ── State: Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [twoFA, setTwoFA]         = useState(false);
  const [pwError, setPwError]     = useState('');
  const sessions = role === 'admin'
    ? ['Chrome · Windows · Active now', 'Safari · iPad · 2 hrs ago', 'Firefox · Mac · Yesterday', 'Edge · Linux · 3 days ago']
    : ['Chrome · Windows · Active now', 'Safari · iPad · 2 hrs ago'];

  function handlePasswordSave() {
    if (newPw && newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    setPwError('');
    showSaved();
  }

  // ── State: Appearance
  const [theme, setTheme]                       = useState('system');
  const [fontSize, setFontSize]                 = useState('medium');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [compactMode, setCompactMode]           = useState(false);

  // ── State: Privacy
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [analyticsShare, setAnalyticsShare] = useState(false);
  const [marketingShare, setMarketingShare] = useState(false);
  const [showAllUsers, setShowAllUsers]     = useState(false);
  const [dataRetention, setDataRetention]   = useState(false);

  // ── State: Finance (admin search)
  const [financeSearch, setFinanceSearch] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB: Profile
  // ─────────────────────────────────────────────────────────────────────────────
  function ProfileTab() {
    const lvl        = access.Profile;
    const isReadOnly = lvl === 'readonly';
    const isLimited  = lvl === 'limited';  // finance: name + email only
    const isAdmin    = lvl === 'admin';

    return (
      <div className="content-card">
        <div className="section-header" style={{ marginBottom: 20 }}>
          <span className="section-title">Profile Settings</span>
          <AccessPill level={lvl} />
        </div>

        {isReadOnly && (
          <div className="login-message login-hint" style={{ marginBottom: 18 }}>
            ℹ️ Your profile is managed by your institution. Contact an administrator to request changes.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>

          {/* Display Name */}
          {isReadOnly
            ? <ReadOnlyField label="Display Name" value={displayName} />
            : (
              <div className="form-group">
                <label>Display Name</label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" />
                </div>
              </div>
            )
          }

          {/* Email */}
          {isReadOnly
            ? <ReadOnlyField label="Email Address" value={email} />
            : (
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                  <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mit.edu" />
                </div>
              </div>
            )
          }

          {/* Department – hidden for finance (limited) */}
          {!isLimited && (
            isReadOnly
              ? <ReadOnlyField label="Department / Team" value={department} />
              : (
                <div className="form-group">
                  <label>Department / Team</label>
                  <div className="input-wrap">
                    <svg className="input-icon" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12z" /></svg>
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department or team" />
                  </div>
                </div>
              )
          )}

          {/* Focus – hidden for finance (limited) */}
          {!isLimited && (
            isReadOnly
              ? <ReadOnlyField label="Focus / Specialization" value={bio} />
              : (
                <div className="form-group">
                  <label>Focus / Specialization</label>
                  <div className="input-wrap">
                    <svg className="input-icon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
                    <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Your area of focus" />
                  </div>
                </div>
              )
          )}

          {/* Role Assignment – admin only */}
          {isAdmin && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Assign Role</label>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
                <select value={assignedRole} onChange={(e) => setAssignedRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                Changing a user's role will affect their portal access immediately.
              </p>
            </div>
          )}
        </div>

        {!isReadOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-primary-sm" onClick={showSaved}>Save Profile</button>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB: Security
  // ─────────────────────────────────────────────────────────────────────────────
  function SecurityTab() {
    const lvl            = access.Security;
    const showAllSessions = lvl === 'admin';

    return (
      <>
        {/* Change Password */}
        <div className="content-card">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <span className="section-title">Change Password</span>
            <AccessPill level={lvl} />
          </div>
          {pwError && <div className="login-message login-error" style={{ marginBottom: 16 }}>{pwError}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Current Password</label>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" /></svg>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current password" />
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" /></svg>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-wrap">
                <svg className="input-icon" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" /></svg>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-primary-sm" onClick={handlePasswordSave}>Update Password</button>
          </div>
        </div>

        {/* 2FA */}
        <div className="content-card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">Two-Factor Authentication</span>
            <Toggle id="twofa" checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />
          </div>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65 }}>
            Add an extra layer of security. When enabled, you'll need a verification code from your authenticator app at each login.
          </p>
          {twoFA && (
            <div className="login-message login-hint" style={{ marginTop: 14, marginBottom: 0 }}>
              ✓ Two-factor authentication is <strong>active</strong>.
            </div>
          )}
        </div>

        {/* Sessions */}
        <div className="content-card">
          <div className="section-header" style={{ marginBottom: 18 }}>
            <span className="section-title">
              {showAllSessions ? 'All Active Sessions (Admin View)' : 'Active Sessions'}
            </span>
            {showAllSessions && <AccessPill level="admin" />}
          </div>
          <div className="notice-list">
            {sessions.map((s, i) => (
              <div key={i} className="notice-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className={`notice-dot ${i === 0 ? 'dot-blue' : 'dot-orange'}`} style={{ marginTop: 0 }} />
                  <div className="notice-text">
                    <div className="notice-title">{s.split('·')[0].trim()}</div>
                    <div className="notice-desc">{s.split('·').slice(1).join('·').trim()}</div>
                  </div>
                </div>
                {i === 0
                  ? <span className="badge badge-info">Current</span>
                  : <button type="button" className="btn-secondary-sm" style={{ height: 30, fontSize: 12 }}>Revoke</button>
                }
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary-sm" style={{ color: '#b91c1c', borderColor: '#fca5a5' }}>
              {showAllSessions ? 'Revoke All Sessions (All Users)' : 'Logout All Other Devices'}
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB: Appearance  (all roles: full)
  // ─────────────────────────────────────────────────────────────────────────────
  function AppearanceTab() {
    return (
      <div className="content-card">
        <div className="section-header" style={{ marginBottom: 22 }}>
          <span className="section-title">Appearance</span>
          <AccessPill level="full" />
        </div>

        <div className="form-group">
          <label>Theme</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 4 }}>
            {[{ val: 'light', label: 'Light', icon: '☀️' }, { val: 'dark', label: 'Dark', icon: '🌙' }, { val: 'system', label: 'System', icon: '💻' }].map(({ val, label, icon }) => (
              <button key={val} type="button" onClick={() => setTheme(val)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, height: 84, borderRadius: 12, border: '2px solid',
                borderColor: theme === val ? '#2563eb' : '#e5e7eb',
                background: theme === val ? '#eff6ff' : '#f9fafb',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: theme === val ? '#2563eb' : '#6b7280', transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 24 }}>{icon}</span>{label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Font Size</label>
          <div className="input-wrap">
            <svg className="input-icon" viewBox="0 0 24 24"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z" /></svg>
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium (Default)</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ToggleRow id="sb-col"  label="Collapse Sidebar by Default" desc="Keep sidebar minimized when you open the portal" val={sidebarCollapsed} set={setSidebarCollapsed} />
          <ToggleRow id="compact" label="Compact Mode"                desc="Reduce spacing and padding for a denser layout"  val={compactMode}       set={setCompactMode} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className="btn-primary-sm" onClick={showSaved}>Save Preferences</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB: Privacy
  // ─────────────────────────────────────────────────────────────────────────────
  function PrivacyTab() {
    const lvl        = access.Privacy;
    const isViewOnly = lvl === 'view';     // finance
    const isLimited  = lvl === 'limited';  // student
    const isAdmin    = lvl === 'admin';

    const baseToggles = [
      { id: 'pv', label: 'Profile Visibility',        desc: 'Allow other users to view your profile',              val: profileVisible, set: setProfileVisible },
      { id: 'as', label: 'Show Activity Status',      desc: 'Let others see when you were last active',            val: activityStatus, set: setActivityStatus },
      { id: 'al', label: 'Share Analytics Data',      desc: 'Help improve MIT Connect with anonymous usage data',  val: analyticsShare, set: setAnalyticsShare },
      { id: 'mk', label: 'Marketing Communications',  desc: 'Receive updates about new features and events',       val: marketingShare, set: setMarketingShare },
    ];
    // Student sees only first 2; finance sees all 4 but read-only
    const visibleToggles = isLimited ? baseToggles.slice(0, 2) : baseToggles;

    return (
      <div className="content-card">
        <div className="section-header" style={{ marginBottom: 20 }}>
          <span className="section-title">Privacy Settings</span>
          <AccessPill level={lvl} />
        </div>

        {(isViewOnly || isLimited) && (
          <div className="login-message login-hint" style={{ marginBottom: 18 }}>
            {isLimited
              ? 'ℹ️ As a student, only basic privacy settings are configurable. Contact an administrator for additional changes.'
              : '🔒 Privacy settings are managed by your administrator. Contact them to request changes.'}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleToggles.map(({ id, label, desc, val, set }) => (
            <ToggleRow key={id} id={id} label={label} desc={desc} val={val} set={set} disabled={isViewOnly} />
          ))}

          {/* Admin-only controls */}
          {isAdmin && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.8, padding: '12px 0 10px' }}>
                Admin Management Controls
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ToggleRow id="su" label="Make All User Profiles Public"   desc="Allow all portal profiles to be discoverable site-wide"            val={showAllUsers}  set={setShowAllUsers}  accent />
                <ToggleRow id="dr" label="Extended Data Retention (2 yrs)" desc="Retain user activity logs for 2 years instead of 6 months"          val={dataRetention} set={setDataRetention} accent />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 20, padding: '14px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 500 }}>
            🔒 All data is protected under MIT's privacy policy. Personal information is never sold to third parties.
          </div>
        </div>

        {!isViewOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn-primary-sm" onClick={showSaved}>Save Privacy Settings</button>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB: Finance
  // ─────────────────────────────────────────────────────────────────────────────
  function FinanceTab() {
    const lvl = access.Finance;

    // Student: view own tuition
    if (lvl === 'view') {
      return (
        <div className="content-card">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <span className="section-title">My Tuition & Payments</span>
            <AccessPill level="view" />
          </div>
          <FinanceTable records={STUDENT_FINANCE} canManage={false} />
        </div>
      );
    }

    // Faculty: view own pay slips
    if (lvl === 'payslip') {
      return (
        <div className="content-card">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <span className="section-title">My Pay Slips</span>
            <AccessPill level="payslip" />
          </div>
          <FinanceTable records={FACULTY_PAYSLIPS} canManage={false} />
        </div>
      );
    }

    // Admin & Finance role: full management view
    const filtered = ALL_FINANCE.filter((r) =>
      !financeSearch ||
      r.label.toLowerCase().includes(financeSearch.toLowerCase()) ||
      r.id.toLowerCase().includes(financeSearch.toLowerCase()) ||
      r.role.toLowerCase().includes(financeSearch.toLowerCase())
    );
    const stats = [
      { label: 'Total Records', value: ALL_FINANCE.length,                                              sub: 'All roles',       tone: 'blue'   },
      { label: 'Pending',       value: ALL_FINANCE.filter(r => r.status === 'Pending').length,           sub: 'Awaiting action', tone: 'orange' },
      { label: 'Paid / Issued', value: ALL_FINANCE.filter(r => ['Paid','Issued','Approved'].includes(r.status)).length, sub: 'Completed', tone: 'green' },
      { label: 'Overdue',       value: ALL_FINANCE.filter(r => r.status === 'Overdue').length,           sub: 'Needs attention', tone: 'purple' },
    ];

    return (
      <>
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {stats.map((s) => (
            <div key={s.label} className={`stat-card stat-card-${s.tone}`}>
              <div className="stat-body">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="content-card">
          <div className="section-header" style={{ marginBottom: 18 }}>
            <span className="section-title">All Financial Records</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <AccessPill level={lvl === 'admin' ? 'admin' : 'full'} />
              <button type="button" className="btn-primary-sm" style={{ height: 34, fontSize: 12 }}>+ New Record</button>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
              <input type="text" value={financeSearch} onChange={(e) => setFinanceSearch(e.target.value)} placeholder="Search by name, ID, or role…" />
            </div>
          </div>
          <FinanceTable records={filtered} canManage showRole />
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

        {/* Main content */}
        <main className="main-content">

          {/* Topbar */}
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Toggle menu"><MenuIcon /></button>
              <button type="button" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px', height: 36, fontSize: 13, fontWeight: 500, color: '#6b7280', cursor: 'pointer' }}>
                <BackIcon /> Back
              </button>
              <div className="topbar-left">
                <h2>Settings</h2>
                <p>Manage your account preferences</p>
              </div>
            </div>
            <div className="topbar-right">
              <span className="badge badge-info">{data.label}</span>
            </div>
          </div>

          {/* Profile header */}
          <div className="profile-header">
            <div className="profile-left">
              <div className="profile-avatar-wrap">
                <div className="avatar-initials">{data.label.slice(0, 2).toUpperCase()}</div>
                <span className="avatar-status" />
              </div>
              <div className="profile-info">
                <div className="student-name">{displayName}</div>
                <div className="profile-meta">
                  <span className="meta-item">ID: {userId}</span>
                  <span className="meta-item">{email}</span>
                  <span className="meta-item">{department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save banner */}
          {saveMsg && (
            <div className="login-message login-hint" style={{ marginBottom: 20 }}>✓ {saveMsg}</div>
          )}

          {/* Tab navigation */}
          <div className="content-card" style={{ padding: '6px 8px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {ALL_TABS.map((tab) => {
                const isActive = activeTab === tab;
                const lvl = access[tab];
                const bs = TAB_BADGE_STYLES[lvl] || {};
                return (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    height: 38, padding: '0 14px', borderRadius: 8,
                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    transition: 'all 0.15s',
                    background: isActive ? 'linear-gradient(90deg,#2563eb,#06b6d4)' : 'transparent',
                    color: isActive ? '#fff' : '#6b7280',
                    boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.2)' : 'none',
                  }}>
                    <span style={{ color: isActive ? '#fff' : '#9ca3af' }}>{TAB_ICONS[tab]}</span>
                    {tab}
                    {!isActive && lvl && (
                      <span style={{ fontSize: 10, fontWeight: 700, marginLeft: 2, padding: '1px 6px', borderRadius: 999, background: bs.bg, color: bs.color }}>
                        {TAB_BADGE[lvl] || '?'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'Profile'    && <ProfileTab />}
          {activeTab === 'Security'   && <SecurityTab />}
          {activeTab === 'Appearance' && <AppearanceTab />}
          {activeTab === 'Privacy'    && <PrivacyTab />}
          {activeTab === 'Finance'    && <FinanceTab />}
        </main>
      </div>
    </>
  );
}