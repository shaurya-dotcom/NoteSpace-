import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/fetchClient';

export default function SharedNote() {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/notes/public/${token}`)
      .then(setNote)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <div className="shared-container"><h2>{error}</h2></div>;
  if (!note) return <div className="shared-container">Loading shared note...</div>;

  return (
    <div className="shared-container">
      <div className="shared-card">
        <span className="badge">Read-Only Shared Note</span>
        <h1>{note.title}</h1>
        <p className="meta">By {note.author} • Updated {new Date(note.updatedAt).toLocaleDateString()}</p>
        <div className="tag-row">
          {note.tags.map((t) => <span key={t} className="tag-chip">#{t}</span>)}
        </div>
        <hr />
        <pre className="shared-content">{note.content}</pre>
      </div>
    </div>
  );
}