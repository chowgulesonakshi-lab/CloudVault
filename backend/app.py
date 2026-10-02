import os

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL"
).replace(
    "postgresql://",
    "postgresql+psycopg2://"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "storage",
    "documents"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    filename = db.Column(
        db.String(255),
        nullable=False
    )

    file_path = db.Column(
        db.String(500),
        nullable=False
    )

    file_size = db.Column(
        db.Integer,
        nullable=False
    )

    content_type = db.Column(
        db.String(100)
    )

    status = db.Column(
        db.String(50),
        default="AVAILABLE"
    )

    uploaded_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )


# -------------------------
# Home
# -------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to CloudVault API"
    })


# -------------------------
# Health Check
# -------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "UP",
        "service": "CloudVault API"
    })


# -------------------------
# Upload Document
# -------------------------

@app.route("/api/documents/upload", methods=["POST"])
def upload_document():

    if "file" not in request.files:
        return jsonify({
            "error": "No file provided"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "error": "No file selected"
        }), 400

    filename = secure_filename(file.filename)

    file_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    file.save(file_path)

    file_size = os.path.getsize(file_path)

    document = Document(
        filename=filename,
        file_path=file_path,
        file_size=file_size,
        content_type=file.content_type,
        status="AVAILABLE"
    )

    db.session.add(document)
    db.session.commit()

    return jsonify({
        "message": "Document uploaded successfully",
        "document": {
            "id": document.id,
            "filename": document.filename,
            "file_size": document.file_size,
            "content_type": document.content_type,
            "status": document.status
        }
    }), 201


# -------------------------
# Get All Documents
# -------------------------

@app.route("/api/documents", methods=["GET"])
def get_documents():

    documents = Document.query.order_by(
        Document.uploaded_at.desc()
    ).all()

    return jsonify([
        {
            "id": document.id,
            "filename": document.filename,
            "file_size": document.file_size,
            "content_type": document.content_type,
            "status": document.status,
            "uploaded_at": document.uploaded_at
        }
        for document in documents
    ])

@app.route("/api/documents/<int:document_id>/download", methods=["GET"])
def download_document(document_id):
    document = Document.query.get_or_404(document_id)

    if not os.path.exists(document.file_path):
        return jsonify({
            "error": "File not found"
        }), 404

    return send_file(
        document.file_path,
        as_attachment=True,
        download_name=document.filename,
        mimetype=document.content_type
    )

@app.route("/api/documents/<int:document_id>", methods=["DELETE"])
def delete_document(document_id):
    document = Document.query.get_or_404(document_id)

    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    db.session.delete(document)
    db.session.commit()

    return jsonify({
        "message": "Document deleted successfully",
        "document_id": document_id
    })

# -------------------------
# Start Application
# -------------------------

if __name__ == "__main__":

    with app.app_context():
        db.create_all()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )