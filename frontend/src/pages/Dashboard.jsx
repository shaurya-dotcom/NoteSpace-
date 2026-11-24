import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard(props) {
  const navigate = useNavigate();
  const auth = typeof useAuth === "function" ? useAuth() : null;

  const {
    userName = auth?.user?.name || "Shaurya",
    userRole = (auth?.user?.role || "USER").toUpperCase(),
    notes: propNotes,
    folders: propFolders,
    activeNoteId: propActiveNoteId,
    activeView: propActiveView,
    activeFolderId: propActiveFolderId,
    searchQuery: propSearchQuery,
    onSearchChange,
    onSelectView,
    onSelectFolderView,
    onCreateNote,
    onSelectNote,
    onCreateFolder,
    newFolderName: propNewFolderName,
    onNewFolderNameChange,
    parentFolderId: propParentFolderId,
    onParentFolderIdChange,
    title: propTitle,
    onTitleChange,
    content: propContent,
    onContentChange,
    tags: propTags,
    onAddTag,
    onRemoveTag,
    isPinned: propIsPinned,
    onTogglePin,
    selectedFolderId: propSelectedFolderId,
    onChangeNoteFolder,
    onShareReadOnly,
    onSaveNote,
    onTrashNote,
    onLogout,
    statusMessage = "",
  } = props;

  const [localNotes, setLocalNotes] = useState([
    {
      _id: "welcome-1",
      title: "Welcome to NoteSpace",
      content:
        "Use folders on the left to group notes, pick a folder in the top toolbar to file this note, and use Trash to remove notes.",
      tags: ["guide"],
      isPinned: true,
      needsRevision: true,
      isTrashed: false,
      folderId: "",
    },
  ]);
  const [localFolders, setLocalFolders] = useState([]);
  const [localActiveNoteId, setLocalActiveNoteId] = useState("welcome-1");
  const [localActiveView, setLocalActiveView] = useState("all");
  const [localActiveFolderId, setLocalActiveFolderId] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [localNewFolder, setLocalNewFolder] = useState("");
  const [localParentFolder, setLocalParentFolder] = useState("");
  const [localTitle, setLocalTitle] = useState("Welcome to NoteSpace");
  const [localContent, setLocalContent] = useState(
    "Use folders on the left to group notes, pick a folder in the top toolbar to file this note, and use Trash to remove notes."
  );
  const [localTags, setLocalTags] = useState(["guide"]);
  const [localPinned, setLocalPinned] = useState(true);
  const [localSelectedFolder, setLocalSelectedFolder] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const [tagInput, setTagInput] = useState("");

  const allNotes = propNotes ?? localNotes;
  const folders = propFolders ?? localFolders;
  const activeNoteId =
    propActiveNoteId !== undefined ? propActiveNoteId : localActiveNoteId;
  const activeView = propActiveView ?? localActiveView;
  const activeFolderId = propActiveFolderId ?? localActiveFolderId;
  const searchQuery = propSearchQuery ?? localSearch;
  const newFolderName = propNewFolderName ?? localNewFolder;
  const parentFolderId = propParentFolderId ?? localParentFolder;
  const title = propTitle ?? localTitle;
  const content = propContent ?? localContent;
  const tags = propTags ?? localTags;
  const isPinned = propIsPinned !== undefined ? propIsPinned : localPinned;
  const selectedFolderId = propSelectedFolderId ?? localSelectedFolder;

  useEffect(() => {
    if (propTitle !== undefined) setLocalTitle(propTitle);
  }, [propTitle]);

  useEffect(() => {
    if (propContent !== undefined) setLocalContent(propContent);
  }, [propContent]);

  useEffect(() => {
    if (propTags !== undefined) setLocalTags(propTags);
  }, [propTags]);

  useEffect(() => {
    if (propSelectedFolderId !== undefined) {
      setLocalSelectedFolder(propSelectedFolderId);
    }
  }, [propSelectedFolderId]);

  const loadNoteIntoEditor = (note) => {
    const id = note._id || note.id;
    setLocalActiveNoteId(id);
    setLocalTitle(note.title || "");
    setLocalContent(note.content || "");
    setLocalTags(note.tags || []);
    setLocalPinned(Boolean(note.isPinned));
    setLocalSelectedFolder(note.folderId || note.folder || "");
    onSelectNote?.(note);
  };

  const handleCreateNote = () => {
    const id = Date.now().toString();
    const targetFolder =
      activeView === "folder" && activeFolderId ? activeFolderId : selectedFolderId || "";

    const newNote = {
      _id: id,
      title: "",
      content: "",
      tags: [],
      isPinned: false,
      needsRevision: false,
      isTrashed: false,
      folderId: targetFolder,
    };

    setLocalNotes((prev) => [newNote, ...prev]);
    setLocalActiveNoteId(id);
    setLocalTitle("");
    setLocalContent("");
    setLocalTags([]);
    setLocalPinned(false);
    setLocalSelectedFolder(targetFolder);
    setLocalStatus(
      targetFolder ? "New note created in selected folder" : "New note created"
    );
    onCreateNote?.();
  };

  const handleSave = () => {
    const id = activeNoteId || Date.now().toString();
    const updatedNote = {
      _id: id,
      title: title.trim() || "Untitled Note",
      content,
      tags,
      isPinned,
      needsRevision: false,
      isTrashed: activeView === "trash",
      folderId: selectedFolderId || "",
    };

    setLocalNotes((prev) => {
      const exists = prev.some((n) => (n._id || n.id) === id);
      if (exists) {
        return prev.map((n) => ((n._id || n.id) === id ? { ...n, ...updatedNote } : n));
      }
      return [updatedNote, ...prev];
    });
    setLocalActiveNoteId(id);
    setLocalStatus("Saved");
    onSaveNote?.();
  };

  const handleChangeNoteFolder = (newFolderVal) => {
    setLocalSelectedFolder(newFolderVal);
    if (activeNoteId) {
      setLocalNotes((prev) =>
        prev.map((n) =>
          (n._id || n.id) === activeNoteId ? { ...n, folderId: newFolderVal } : n
        )
      );
      setLocalStatus("Folder updated");
    }
    onChangeNoteFolder?.(newFolderVal);
  };

  const handleTrash = () => {
    if (!activeNoteId) {
      setLocalStatus("Select a note first");
      return;
    }

    setLocalNotes((prev) =>
      prev.map((n) => {
        if ((n._id || n.id) !== activeNoteId) return n;
        const nextTrashed = !n.isTrashed;
        setLocalStatus(nextTrashed ? "Moved to Trash" : "Restored from Trash");
        return { ...n, isTrashed: nextTrashed };
      })
    );
    onTrashNote?.();
  };

  const handleCreateFolder = () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const created = {
      _id: Date.now().toString(),
      name: trimmed,
      parentId: parentFolderId || "",
    };

    setLocalFolders((prev) => [...prev, created]);
    setLocalNewFolder("");
    setLocalStatus(`Folder "${trimmed}" created`);
    onCreateFolder?.();
  };

  const handleSelectFolder = (folderId) => {
    setLocalActiveView("folder");
    setLocalActiveFolderId(folderId);
    setLocalSelectedFolder(folderId);
    onSelectFolderView?.(folderId);
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

    if (typeof onLogout === "function") {
      onLogout();
    } else if (typeof auth?.logout === "function") {
      auth.logout();
    } else if (typeof auth?.setUser === "function") {
      auth.setUser(null);
    }

    window.dispatchEvent(new Event("notespace:logout"));
    navigate("/login", { replace: true });
  };

  const handleAddTag = (newTag) => {
    if (onAddTag) {
      onAddTag(newTag);
    } else if (!localTags.includes(newTag)) {
      setLocalTags((prev) => [...prev, newTag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    if (onRemoveTag) {
      onRemoveTag(tagToRemove);
    } else {
      setLocalTags((prev) => prev.filter((t) => t !== tagToRemove));
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput.trim());
      setTagInput("");
    }
  };

  const filteredNotes = allNotes.filter((note) => {
    const isTrashed = Boolean(note.isTrashed);
    const noteFolder = note.folderId || note.folder || "";

    if (activeView === "trash" && !isTrashed) return false;
    if (activeView !== "trash" && isTrashed) return false;
    if (activeView === "revise" && !note.needsRevision) return false;
    if (activeView === "folder" && activeFolderId && noteFolder !== activeFolderId) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (note.title || "").toLowerCase().includes(q);
      const matchContent = (note.content || "").toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }

    return true;
  });

  const activeNotesCount = allNotes.filter((n) => !n.isTrashed).length;
  const reviseCount = allNotes.filter((n) => n.needsRevision && !n.isTrashed).length;
  const trashCount = allNotes.filter((n) => n.isTrashed).length;
  const activeFolderObj = folders.find((f) => (f._id || f.id) === activeFolderId);
  const displayedStatus = statusMessage || localStatus;

  const currentNoteObj = allNotes.find((n) => (n._id || n.id) === activeNoteId);
  const isCurrentNoteTrashed = Boolean(currentNoteObj?.isTrashed);

  return (
    <div className="ns-app">
      {/* LEFT SIDEBAR */}
      <aside className="ns-sidebar">
        <div>
          <div className="ns-brand-row">
            <h1 className="ns-brand-title">NoteSpace</h1>
            <span className="ns-role-badge">{userRole}</span>
          </div>

          <p className="ns-empty-sub" style={{ marginBottom: "12px" }}>
            Notes, folders &amp; revision log
          </p>

          <button type="button" onClick={handleCreateNote} className="ns-btn-primary">
            + New Note
          </button>

          <nav className="ns-nav-list">
            <button
              type="button"
              onClick={() => {
                setLocalActiveView("all");
                setLocalActiveFolderId("");
                onSelectView?.("all");
              }}
              className={`ns-nav-btn ${activeView === "all" ? "is-active" : ""}`}
            >
              <span>All Notes</span>
              <span>{activeNotesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLocalActiveView("revise");
                setLocalActiveFolderId("");
                onSelectView?.("revise");
              }}
              className={`ns-nav-btn ${activeView === "revise" ? "is-active" : ""}`}
            >
              <span>Revise Today</span>
              <span className="ns-revise-count">({reviseCount})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLocalActiveView("trash");
                setLocalActiveFolderId("");
                onSelectView?.("trash");
              }}
              className={`ns-nav-btn ${activeView === "trash" ? "is-active" : ""}`}
            >
              <span>Trash</span>
              <span>{trashCount}</span>
            </button>
          </nav>

          <div className="ns-folders-section">
            <div className="ns-section-label">Folders</div>

            {folders.length > 0 && (
              <div className="ns-nav-list" style={{ marginTop: 0, marginBottom: "10px" }}>
                {folders.map((folder) => {
                  const folderId = folder._id || folder.id || folder.name;
                  const countInFolder = allNotes.filter(
                    (n) => !n.isTrashed && (n.folderId || n.folder || "") === folderId
                  ).length;

                  return (
                    <button
                      key={folderId}
                      type="button"
                      onClick={() => handleSelectFolder(folderId)}
                      className={`ns-nav-btn ${
                        activeView === "folder" && activeFolderId === folderId
                          ? "is-active"
                          : ""
                      }`}
                    >
                      <span>{folder.name}</span>
                      <span>{countInFolder}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="ns-folder-card">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => {
                  setLocalNewFolder(e.target.value);
                  onNewFolderNameChange?.(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateFolder();
                  }
                }}
                placeholder="New folder name..."
                className="ns-input"
              />

              <select
                value={parentFolderId}
                onChange={(e) => {
                  setLocalParentFolder(e.target.value);
                  onParentFolderIdChange?.(e.target.value);
                }}
                className="ns-select"
              >
                <option value="">Root Level</option>
                {folders.map((f) => (
                  <option key={f._id || f.id} value={f._id || f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleCreateFolder}
                className="ns-btn-secondary"
              >
                Add Folder
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleLogoutClick}
            className="ns-logout-btn"
          >
            Logout ({userName})
          </button>
        </div>
      </aside>

      {/* MIDDLE COLUMN: Search & Filtered Notes */}
      <section className="ns-stream">
        <div className="ns-stream-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            placeholder="Search title & content..."
            className="ns-input"
          />
        </div>

        <div className="ns-stream-body">
          <h2 className="ns-stream-heading">
            {activeView === "trash"
              ? "Trash Bin"
              : activeView === "revise"
              ? "Revise Today"
              : activeView === "folder" && activeFolderObj
              ? activeFolderObj.name
              : "Notes"}
          </h2>
          <div className="ns-stream-count">{filteredNotes.length} notes</div>

          {filteredNotes.length === 0 ? (
            <div className="ns-empty-state">
              <p className="ns-empty-title">No notes in this view.</p>
              <p className="ns-empty-sub">
                Click &ldquo;+ New Note&rdquo; or assign a note&apos;s folder in the top toolbar.
              </p>
            </div>
          ) : (
            <div>
              {filteredNotes.map((note) => {
                const id = note._id || note.id;
                const isSelected = id === activeNoteId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => loadNoteIntoEditor(note)}
                    className={`ns-note-item ${isSelected ? "is-selected" : ""}`}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--ink-primary)",
                      }}
                    >
                      {note.title || "Untitled Note"}
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--ink-secondary)",
                        margin: "4px 0 0 0",
                        lineHeight: 1.45,
                      }}
                    >
                      {note.content || "Empty note..."}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* RIGHT PANE: Toolbar & Writing Canvas */}
      <main className="ns-editor-pane">
        <header className="ns-toolbar">
          <div className="ns-toolbar-group">
            <button
              type="button"
              onClick={() => {
                setLocalPinned((p) => !p);
                onTogglePin?.();
              }}
              className="ns-tool-btn"
            >
              {isPinned ? "Pinned" : "Pin Note"}
            </button>

            <select
              value={selectedFolderId}
              onChange={(e) => handleChangeNoteFolder(e.target.value)}
              className="ns-select"
              style={{ width: "auto" }}
              title="Assign note to folder"
            >
              <option value="">No Folder</option>
              {folders.map((f) => (
                <option key={f._id || f.id} value={f._id || f.id}>
                  Folder: {f.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setLocalStatus("Read-only link ready");
                onShareReadOnly?.();
              }}
              className="ns-tool-btn"
            >
              Share Read-Only
            </button>
          </div>

          <div className="ns-toolbar-group">
            {displayedStatus && (
              <span style={{ fontSize: "11.5px", color: "var(--ink-secondary)" }}>
                {displayedStatus}
              </span>
            )}
            <button type="button" onClick={handleSave} className="ns-save-btn">
              Save
            </button>
            <button type="button" onClick={handleTrash} className="ns-trash-btn">
              {isCurrentNoteTrashed ? "Restore" : "Trash"}
            </button>
          </div>
        </header>

        <div className="ns-canvas">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setLocalTitle(e.target.value);
              onTitleChange?.(e.target.value);
            }}
            placeholder="Untitled Note"
            className="ns-title-input"
          />

          <div className="ns-tag-row">
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11.5px",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--bg-canvas)",
                }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove ${tag}`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-muted)",
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </span>
            ))}

            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag + Enter"
              className="ns-tag-input"
            />
          </div>

          <textarea
            value={content}
            onChange={(e) => {
              setLocalContent(e.target.value);
              onContentChange?.(e.target.value);
            }}
            placeholder="Start typing your notes here..."
            className="ns-body-textarea"
          />
        </div>
      </main>
    </div>
  );
}