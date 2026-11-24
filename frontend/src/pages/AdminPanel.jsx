import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const INITIAL_DEMO_USERS = [
  {
    _id: "u-1",
    name: "Shaurya Gupta",
    email: "shaurya.demo@notespace.app",
    role: "USER",
    notesCount: 4,
    joinedAt: "2026-11-20",
  },
  {
    _id: "u-2",
    name: "Admin Workspace",
    email: "admin@notespace.app",
    role: "ADMIN",
    notesCount: 2,
    joinedAt: "2026-11-18",
  },
  {
    _id: "u-3",
    name: "Rohan Verma",
    email: "rohan.v@notespace.app",
    role: "USER",
    notesCount: 7,
    joinedAt: "2026-11-22",
  },
];

const INITIAL_DEMO_NOTES = [
  {
    _id: "an-1",
    title: "System Architecture & API Routes",
    author: "Shaurya Gupta",
    folder: "Engineering",
    isTrashed: false,
    updatedAt: "Today",
  },
  {
    _id: "an-2",
    title: "Spaced Repetition Schedule",
    author: "Rohan Verma",
    folder: "Study",
    isTrashed: false,
    updatedAt: "Yesterday",
  },
  {
    _id: "an-3",
    title: "Archived Draft Entry",
    author: "Shaurya Gupta",
    folder: "General",
    isTrashed: true,
    updatedAt: "3 days ago",
  },
];

export default function AdminPanel(props) {
  const navigate = useNavigate();
  const auth = typeof useAuth === "function" ? useAuth() : null;

  const {
    users: propUsers,
    notes: propNotes,
    onDeleteUser,
    onToggleUserRole,
    onDeleteNote,
    onLogout,
  } = props;

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "users" | "notes"
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(propUsers || INITIAL_DEMO_USERS);
  const [notes, setNotes] = useState(propNotes || INITIAL_DEMO_NOTES);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (propUsers) setUsers(propUsers);
  }, [propUsers]);

  useEffect(() => {
    if (propNotes) setNotes(propNotes);
  }, [propNotes]);

  // Optional live fetch if backend /api/admin endpoints exist
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || propUsers) return;

    fetch("http://localhost:5000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setUsers(data);
        else if (Array.isArray(data?.users) && data.users.length > 0)
          setUsers(data.users);
      })
      .catch(() => {
        // Keep demo fallback data if backend route isn't active
      });
  }, [propUsers]);

  const handleToggleRole = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if ((u._id || u.id) !== userId) return u;
        const nextRole =
          String(u.role).toUpperCase() === "ADMIN" ? "USER" : "ADMIN";
        setStatusMessage(`Updated ${u.name}'s role to ${nextRole}`);
        return { ...u, role: nextRole };
      })
    );
    onToggleUserRole?.(userId);
  };

  const handleRemoveUser = (userId, userName) => {
    setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
    setStatusMessage(`Removed user ${userName}`);
    onDeleteUser?.(userId);
  };

  const handleDeleteNote = (noteId, noteTitle) => {
    setNotes((prev) => prev.filter((n) => (n._id || n.id) !== noteId));
    setStatusMessage(`Deleted "${noteTitle}"`);
    onDeleteNote?.(noteId);
  };

  const handleLogoutClick = () => {
    try {
      ["token", "user", "authToken", "ns_token", "ns_user"].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch {
      // ignore storage errors
    }

    if (typeof onLogout === "function") onLogout();
    else if (typeof auth?.logout === "function") auth.logout();
    else if (typeof auth?.setUser === "function") auth.setUser(null);

    window.dispatchEvent(new Event("notespace:logout"));
    navigate("/login", { replace: true });
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.title || "").toLowerCase().includes(q) ||
      (n.author || "").toLowerCase().includes(q) ||
      (n.folder || "").toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter(
    (u) => String(u.role).toUpperCase() === "ADMIN"
  ).length;
  const activeNotesCount = notes.filter((n) => !n.isTrashed).length;
  const trashedNotesCount = notes.filter((n) => n.isTrashed).length;

  const adminName = auth?.user?.name || "Admin";

  return (
    <div className="ns-app">
      {/* LEFT SIDEBAR */}
      <aside className="ns-sidebar">
        <div>
          <div className="ns-brand-row">
            <h1 className="ns-brand-title">NoteSpace</h1>
            <span
              className="ns-role-badge"
              style={{
                color: "var(--accent-warm)",
                borderColor: "rgba(158, 71, 42, 0.35)",
              }}
            >
              ADMIN
            </span>
          </div>

          <p className="ns-empty-sub" style={{ marginBottom: "14px" }}>
            Workspace governance &amp; audit
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="ns-btn-secondary"
            style={{ marginBottom: "12px" }}
          >
            ← Switch to User Workspace
          </button>

          <nav className="ns-nav-list">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`ns-nav-btn ${
                activeTab === "overview" ? "is-active" : ""
              }`}
            >
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`ns-nav-btn ${activeTab === "users" ? "is-active" : ""}`}
            >
              <span>Manage Users</span>
              <span>{users.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`ns-nav-btn ${activeTab === "notes" ? "is-active" : ""}`}
            >
              <span>All Workspace Notes</span>
              <span>{notes.length}</span>
            </button>
          </nav>
        </div>

        <div>
          <button
            type="button"
            onClick={handleLogoutClick}
            className="ns-logout-btn"
          >
            Logout ({adminName})
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="ns-editor-pane" style={{ overflowY: "auto" }}>
        <header className="ns-toolbar">
          <div className="ns-toolbar-group" style={{ flex: 1, maxWidth: "360px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter users, emails, or notes..."
              className="ns-input"
            />
          </div>

          <div className="ns-toolbar-group">
            {statusMessage && (
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "11px",
                  color: "var(--accent-warm)",
                }}
              >
                {statusMessage}
              </span>
            )}
            <span className="ns-role-badge">Control Console</span>
          </div>
        </header>

        <div
          style={{
            maxWidth: "960px",
            width: "100%",
            margin: "0 auto",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <div>
            <p className="ns-auth-eyebrow">System Administration</p>
            <h2
              className="ns-brand-title"
              style={{ fontSize: "38px", marginTop: "4px" }}
            >
              {activeTab === "users"
                ? "Registered Accounts"
                : activeTab === "notes"
                ? "Workspace Content Audit"
                : "Platform Overview"}
            </h2>
          </div>

          {/* KPI STAT CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
            }}
          >
            <div className="ns-admin-card">
              <div className="ns-section-label">Total Users</div>
              <div className="ns-admin-stat">{users.length}</div>
              <div className="ns-empty-sub">{adminCount} Admin(s)</div>
            </div>

            <div className="ns-admin-card">
              <div className="ns-section-label">Active Notes</div>
              <div className="ns-admin-stat">{activeNotesCount}</div>
              <div className="ns-empty-sub">Published across folders</div>
            </div>

            <div className="ns-admin-card">
              <div className="ns-section-label">In Trash</div>
              <div
                className="ns-admin-stat"
                style={{ color: "var(--accent-warm)" }}
              >
                {trashedNotesCount}
              </div>
              <div className="ns-empty-sub">Awaiting permanent purge</div>
            </div>
          </div>

          {/* USERS TABLE SECTION */}
          {(activeTab === "overview" || activeTab === "users") && (
            <section className="ns-admin-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <h3 className="ns-stream-heading" style={{ fontSize: "22px" }}>
                  Users &amp; Permissions
                </h3>
                <span className="ns-stream-count" style={{ margin: 0 }}>
                  {filteredUsers.length} accounts
                </span>
              </div>

              <div className="ns-table-wrap">
                <table className="ns-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Notes</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const uid = u._id || u.id;
                      const isAdmin =
                        String(u.role).toUpperCase() === "ADMIN";
                      return (
                        <tr key={uid}>
                          <td style={{ fontWeight: 500 }}>{u.name}</td>
                          <td
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "12px",
                              color: "var(--ink-secondary)",
                            }}
                          >
                            {u.email}
                          </td>
                          <td>
                            <span
                              className="ns-role-badge"
                              style={
                                isAdmin
                                  ? {
                                      color: "var(--accent-warm)",
                                      borderColor: "rgba(158, 71, 42, 0.35)",
                                    }
                                  : undefined
                              }
                            >
                              {u.role}
                            </span>
                          </td>
                          <td>{u.notesCount ?? 0}</td>
                          <td style={{ textAlign: "right" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                gap: "6px",
                                justifyContent: "flex-end",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleRole(uid)}
                                className="ns-tool-btn"
                              >
                                {isAdmin ? "Demote to User" : "Make Admin"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(uid, u.name)}
                                className="ns-trash-btn"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* NOTES AUDIT SECTION */}
          {(activeTab === "overview" || activeTab === "notes") && (
            <section className="ns-admin-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <h3 className="ns-stream-heading" style={{ fontSize: "22px" }}>
                  Workspace Notes Audit
                </h3>
                <span className="ns-stream-count" style={{ margin: 0 }}>
                  {filteredNotes.length} entries
                </span>
              </div>

              <div className="ns-table-wrap">
                <table className="ns-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Folder</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.map((note) => {
                      const nid = note._id || note.id;
                      return (
                        <tr key={nid}>
                          <td style={{ fontWeight: 500 }}>
                            {note.title || "Untitled Note"}
                          </td>
                          <td style={{ color: "var(--ink-secondary)" }}>
                            {note.author || "User"}
                          </td>
                          <td>
                            <span className="ns-role-badge">
                              {note.folder || "Root"}
                            </span>
                          </td>
                          <td
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "11px",
                              color: note.isTrashed
                                ? "var(--accent-warm)"
                                : "var(--ink-secondary)",
                            }}
                          >
                            {note.isTrashed ? "TRASHED" : "ACTIVE"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(nid, note.title)}
                              className="ns-trash-btn"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}