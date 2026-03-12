import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cmsRoles, getValidRole, roleMenuGroups } from "../data/roleConfig";

function GraduationIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM12 5.26L19.02 9 12 12.74 4.98 9 12 5.26zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storedRole = localStorage.getItem("cmsRole") || "student";
  const role = getValidRole(searchParams.get("role") || storedRole);
  const data = cmsRoles[role];
  const menuGroups = roleMenuGroups[role] || roleMenuGroups.student;
  const userId = localStorage.getItem("cmsUserId") || "N/A";

  useEffect(() => {
    document.title = `MIT Connect - ${data.label} Dashboard`;
    localStorage.setItem("cmsRole", role);
  }, [data.label, role]);

  function handleLogout() {
    localStorage.removeItem("cmsRole");
    localStorage.removeItem("cmsUserId");
    navigate("/");
  }

  /* ROUTES */
  const routes = {
    Dashboard: "/dashboard",
    Analytics: "/analytics",
    Notifications: "/notifications",
    Settings: "/settings"
  };

  /* CURRENT PAGE */
  const currentPath = window.location.pathname; // ignore query params

  /* NOTIFICATIONS */
  const unreadCount = Number(localStorage.getItem("cmsUnreadCount")) || 0;

  return (
    <>
      <div
        className={`sidebar-overlay${sidebarOpen ? " active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="dashboard-wrapper role-layout">

        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>

          <div className="sidebar-logo">
            <div className="logo-mark">
              <GraduationIcon />
            </div>
            <div>
              <div className="logo-title">MIT Connect</div>
              <div className="logo-sub">MIT Connect Portal</div>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="sidebar-nav">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <div className="nav-section-label">{group.title}</div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className={currentPath.startsWith(routes[item]) ? "active" : ""}
                        onClick={(event) => {
                          event.preventDefault();
                          if (routes[item]) {
                            navigate(routes[item]); // navigate without query params
                          }
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        {item}
                        {item === "Notifications" && unreadCount > 0 && (
                          <span
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "2px 7px",
                              borderRadius: "50%"
                            }}
                          >
                            {unreadCount}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* LOGOUT */}
          <div className="sidebar-footer">
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                handleLogout();
              }}
            >
              <LogoutIcon />
              Logout
            </a>
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">

          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <MenuIcon />
              </button>
              <div>
                <h2>Dashboard</h2>
                <p>{data.subtitle}</p>
              </div>
            </div>
            <div></div>
          </div>

          {/* PROFILE */}
          <div className="profile-header">
            <div className="profile-left">
              <div className="avatar-initials">{data.label.slice(0, 2).toUpperCase()}</div>
              <div>
                <div className="student-name">{data.name}</div>
                <div className="profile-meta">
                  <span>ID: {userId}</span>
                  <span>Team: {data.team}</span>
                  <span>Focus: {data.focus}</span>
                </div>
              </div>
            </div>
            <div>
              <button className="btn-primary-sm">{data.primaryAction}</button>
              <button className="btn-secondary-sm">{data.secondaryAction}</button>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            {data.stats.map((entry) => (
              <div key={entry.label} className="stat-card">
                <div className="stat-value">{entry.value}</div>
                <div className="stat-label">{entry.label}</div>
                <div className="stat-sub">{entry.sub}</div>
              </div>
            ))}
          </div>

        </main>

      </div>
    </>
  );
}