import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEMO_CREDENTIALS = {
  name: "Shaurya Gupta",
  email: "shaurya.demo@notespace.app",
  password: "Password@123",
  role: "USER",
};

export default function Login(props) {
  const navigate = useNavigate();
  const auth = typeof useAuth === "function" ? useAuth() : null;

  const {
    isRegister: propIsRegister,
    onToggleMode,
    name: propName,
    onNameChange,
    email: propEmail,
    onEmailChange,
    password: propPassword,
    onPasswordChange,
    role: propRole,
    onRoleChange,
    error: propError = "",
    onSubmit,
    onLoggedIn,
  } = props;

  const [localIsRegister, setLocalIsRegister] = useState(false);
  const [localName, setLocalName] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [localRole, setLocalRole] = useState("USER");
  const [localError, setLocalError] = useState("");

  const isRegister =
    propIsRegister !== undefined ? propIsRegister : localIsRegister;
  const name = propName ?? localName;
  const email = propEmail ?? localEmail;
  const password = propPassword ?? localPassword;
  const role = propRole ?? localRole;
  const displayError = propError || localError;

  useEffect(() => {
    if (propName !== undefined) setLocalName(propName);
  }, [propName]);

  useEffect(() => {
    if (propEmail !== undefined) setLocalEmail(propEmail);
  }, [propEmail]);

  useEffect(() => {
    if (propPassword !== undefined) setLocalPassword(propPassword);
  }, [propPassword]);

  useEffect(() => {
    if (propRole !== undefined) setLocalRole(propRole);
  }, [propRole]);

  const applyDemoCredentials = () => {
    setLocalError("");
    setLocalName(DEMO_CREDENTIALS.name);
    setLocalEmail(DEMO_CREDENTIALS.email);
    setLocalPassword(DEMO_CREDENTIALS.password);
    setLocalRole(DEMO_CREDENTIALS.role);

    onNameChange?.(DEMO_CREDENTIALS.name);
    onEmailChange?.(DEMO_CREDENTIALS.email);
    onPasswordChange?.(DEMO_CREDENTIALS.password);
    onRoleChange?.(DEMO_CREDENTIALS.role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    const cleanName = name.trim() || "Shaurya Gupta";
    const cleanEmail = email.trim();
    const cleanPassword = password;
    const cleanRole = role;

    if (!cleanEmail || !cleanPassword) {
      setLocalError("Please enter both email and password.");
      return;
    }

    if (isRegister && !cleanName) {
      setLocalError("Please enter your name.");
      return;
    }

    if (typeof onSubmit === "function") {
      await onSubmit(e, {
        isRegister,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: cleanRole,
      });
      return;
    }

    try {
      if (isRegister && typeof auth?.register === "function") {
        // Call with positional args first (matches most AuthContext implementations)
        if (auth.register.length <= 1) {
          await auth.register({
            name: cleanName,
            email: cleanEmail,
            password: cleanPassword,
            role: cleanRole,
          });
        } else {
          await auth.register(cleanName, cleanEmail, cleanPassword, cleanRole);
        }
      } else if (!isRegister && typeof auth?.login === "function") {
        if (auth.login.length <= 1) {
          await auth.login({ email: cleanEmail, password: cleanPassword });
        } else {
          await auth.login(cleanEmail, cleanPassword);
        }
      } else {
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            role: cleanRole,
          })
        );
        localStorage.setItem("token", "local-session-token");
        if (typeof auth?.setUser === "function") {
          auth.setUser({
            name: cleanName,
            email: cleanEmail,
            role: cleanRole,
          });
        }
      }

      onLoggedIn?.();
      navigate("/", { replace: true });
    } catch (err) {
      setLocalError(
        err?.message || "Authentication failed. Check your credentials."
      );
    }
  };

  return (
    <div className="ns-auth-page">
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div className="ns-auth-card">
          <div>
            <p className="ns-auth-eyebrow">Editorial Workspace</p>
            <h1 className="ns-auth-title">NoteSpace</h1>
            <p className="ns-auth-subtitle">
              {isRegister
                ? "Create your workspace"
                : "Sign in to your workspace"}
            </p>
          </div>

          {displayError && <div className="ns-auth-error">{displayError}</div>}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {isRegister && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--ink-secondary)",
                    marginBottom: "4px",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setLocalName(e.target.value);
                    onNameChange?.(e.target.value);
                  }}
                  placeholder="Enter your name"
                  className="ns-input"
                />
              </div>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--ink-secondary)",
                  marginBottom: "4px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setLocalEmail(e.target.value);
                  onEmailChange?.(e.target.value);
                }}
                placeholder="you@example.com"
                className="ns-input"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--ink-secondary)",
                  marginBottom: "4px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setLocalPassword(e.target.value);
                  onPasswordChange?.(e.target.value);
                }}
                placeholder="••••••••••••"
                className="ns-input"
              />
            </div>

            {isRegister && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--ink-secondary)",
                    marginBottom: "4px",
                  }}
                >
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => {
                    setLocalRole(e.target.value);
                    onRoleChange?.(e.target.value);
                  }}
                  className="ns-select"
                >
                  <option value="USER">Role: Student / User</option>
                  <option value="ADMIN">Role: Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="ns-btn-primary"
              style={{ marginTop: "6px" }}
            >
              {isRegister ? "Register" : "Login"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setLocalIsRegister((r) => !r);
              setLocalError("");
              onToggleMode?.();
            }}
            className="ns-auth-toggle"
          >
            {isRegister
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>
        </div>

        {/* Dummy / Demo Credentials Box Below Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-strong)",
            borderRadius: "12px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--ink-muted)",
              }}
            >
              Demo Credentials
            </span>
            <button
              type="button"
              onClick={applyDemoCredentials}
              className="ns-btn-secondary"
              style={{ width: "auto", padding: "5px 10px", fontSize: "11.5px" }}
            >
              Fill Credentials
            </button>
          </div>

          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "11.5px",
              color: "var(--ink-secondary)",
              lineHeight: 1.55,
            }}
          >
            <div>Email: {DEMO_CREDENTIALS.email}</div>
            <div>Password: {DEMO_CREDENTIALS.password}</div>
          </div>
        </div>
      </div>
    </div>
  );
}