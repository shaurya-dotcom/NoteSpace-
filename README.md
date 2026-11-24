# NoteSpace

NoteSpace is a personal notes, revision tracking, and workspace management web application built with React, Vite, Node.js, Express, and MongoDB. Designed with a warm, editorial-inspired interface, it separates day-to-day note-taking and folder organization from administrative oversight.

## Key Features

### User Workspace
* **Three-Pane Writing Environment:** Browse filtered notes in a dedicated stream column while drafting titles, tags, and long-form notes in a clean writing canvas.
* **Views & Filtering:** Switch between **All Notes**, **Revise Today**, **Trash**, and custom **Folders** (with root-level and nested folder support) plus real-time title/content search.
* **Note Actions:** Pin important notes, assign notes to folders, add/remove tags, share read-only links, save updates, and move notes to or restore them from Trash.
* **Authentication & Demo Access:** Register or sign in with role selection (`USER` or `ADMIN`), including one-click demo credentials for quick local testing.

### Admin Panel (`/admin`)
* **Platform Overview:** View summary metrics across total users, active notes, and trashed entries.
* **User & Role Management:** Search registered accounts, toggle roles between `USER` and `ADMIN`, or remove accounts.
* **Content Audit:** Inspect workspace notes across users, filter by author/title/folder, and delete notes when needed.

## Tech Stack
* **Frontend:** React, Vite, React Router, custom editorial CSS (`ns-*` design system with `Instrument Serif`, `Plus Jakarta Sans`, and `JetBrains Mono`)
* **Backend:** Node.js, Express.js, MongoDB (Mongoose)

## Getting Started

1. **Install dependencies** in the backend and `frontend` directories:
   ```bash
   npm install
   cd frontend && npm install
