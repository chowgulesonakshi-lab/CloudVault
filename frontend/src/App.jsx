import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function App() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const checkHealth = async () => {
    try {
      await axios.get(`${API_URL}/health`);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
      setMessage("Unable to connect to CloudVault API.");
    }
  };

  useEffect(() => {
    fetchDocuments();
    checkHealth();
  }, []);

  const handleFile = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
    }
  };

  const uploadDocument = async () => {
    if (!file) {
      setMessage("Select a document before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");

      await axios.post(`${API_URL}/documents/upload`, formData);

      setMessage("Document uploaded successfully.");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchDocuments();
    } catch {
      setMessage("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id) => {
    try {
      await axios.delete(`${API_URL}/documents/${id}`);
      setMessage("Document deleted successfully.");
      fetchDocuments();
    } catch {
      setMessage("Delete failed.");
    }
  };

  const downloadDocument = (id) => {
    window.open(`${API_URL}/documents/${id}/download`, "_blank");
  };

  const totalStorage = documents.reduce(
    (total, doc) => total + (doc.file_size || 0),
    0
  );

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  const getFileIcon = (type) => {
    if (type?.includes("pdf")) return "PDF";
    if (type?.includes("image")) return "IMG";
    if (type?.includes("word")) return "DOC";
    if (type?.includes("text")) return "TXT";
    return "FILE";
  };

  return (
    <div className="app">

      {/* HEADER */}

      <header className="hero">
        <div className="hero-glow"></div>

        <div className="navbar">
          <div className="brand">
            <div className="brand-icon">☁</div>

            <div>
              <h1>CloudVault</h1>
              <span>Campus Document Platform</span>
            </div>
          </div>

          <div className={`api-status ${apiOnline ? "online" : "offline"}`}>
            <span className="status-dot"></span>
            {apiOnline ? "API Online" : "API Offline"}
          </div>
        </div>

        <div className="hero-content">
          <div>
            <p className="eyebrow">SECURE DOCUMENT MANAGEMENT</p>

            <h2>
              Your documents.
              <br />
              <span>Securely stored.</span>
            </h2>

            <p className="hero-description">
              Upload, manage and access your campus documents
              through one simple cloud-ready platform.
            </p>
          </div>

          <div className="hero-decoration">
            <div className="floating-card card-one">PDF</div>
            <div className="floating-card card-two">DOC</div>
            <div className="floating-card card-three">TXT</div>

            <div className="cloud-symbol">☁</div>
          </div>
        </div>
      </header>

      <main>

        {/* STATISTICS */}

        <section className="stats">

          <div className="stat-card">
            <div className="stat-icon purple">▦</div>

            <div>
              <p>Total Documents</p>
              <h3>{documents.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon violet">◈</div>

            <div>
              <p>Storage Used</p>
              <h3>{formatBytes(totalStorage)}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <p>System Status</p>
              <h3>{apiOnline ? "Healthy" : "Offline"}</h3>
            </div>
          </div>

        </section>

        {/* UPLOAD */}

        <section className="upload-section">

          <div className="section-title">
            <div>
              <p className="section-label">DOCUMENT UPLOAD</p>
              <h2>Store a new document</h2>
              <p>
                Upload your files securely to CloudVault.
              </p>
            </div>
          </div>

          <div
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">↑</div>

            <h3>
              {file ? file.name : "Drop your file here"}
            </h3>

            <p>
              {file
                ? `${formatBytes(file.size)} • Ready to upload`
                : "or click to browse from your computer"}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          <div className="upload-footer">

            {message && (
              <div className="message">
                <span>●</span>
                {message}
              </div>
            )}

            <button
              className="primary-button"
              onClick={uploadDocument}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Document →"}
            </button>

          </div>

        </section>

        {/* DOCUMENTS */}

        <section className="documents-section">

          <div className="section-heading">

            <div>
              <p className="section-label">YOUR FILES</p>
              <h2>Document Library</h2>
              <p>Manage your uploaded documents.</p>
            </div>

            <button
              className="refresh-button"
              onClick={fetchDocuments}
            >
              ↻ Refresh
            </button>

          </div>

          {documents.length === 0 ? (

            <div className="empty">
              <div className="empty-icon">☁</div>
              <h3>Your library is empty</h3>
              <p>Upload your first document above.</p>
            </div>

          ) : (

            <div className="document-list">

              {documents.map((doc) => (

                <div className="document-row" key={doc.id}>

                  <div className="document-info">

                    <div className="file-icon">
                      {getFileIcon(doc.content_type)}
                    </div>

                    <div>
                      <h3>{doc.filename}</h3>

                      <p>
                        {formatBytes(doc.file_size)}
                        <span>•</span>
                        {doc.content_type || "Unknown"}
                        <span>•</span>
                        {formatDate(doc.uploaded_at)}
                      </p>
                    </div>

                  </div>

                  <div className="document-right">

                    <span className="available">
                      <span></span>
                      {doc.status}
                    </span>

                    <div className="actions">

                      <button
                        className="download"
                        onClick={() => downloadDocument(doc.id)}
                      >
                        Download
                      </button>

                      <button
                        className="delete"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

      <footer>
        <span>CloudVault</span>
        <span>Secure Campus File Management</span>
      </footer>

    </div>
  );
}

export default App;