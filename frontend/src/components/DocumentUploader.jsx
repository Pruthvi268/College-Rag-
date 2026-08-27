import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { documentApi } from '../services/api';

const CATEGORIES = [
  'General',
  'Admissions',
  'Academics',
  'Fees',
  'Examinations',
  'Hostel',
  'Library',
  'Placements',
  'Scholarships',
  'Clubs',
  'Events',
  'Policies',
];

const DocumentUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Admissions');
  const [department, setDepartment] = useState('All');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [version, setVersion] = useState('1.0');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF, DOCX, or TXT file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('department', department);
      formData.append('academic_year', academicYear);
      formData.append('version', version);

      const res = await documentApi.upload(formData);
      setSuccess(`Document "${res.data.title}" successfully processed and ${res.data.chunk_count} chunks indexed into Qdrant.`);
      setFile(null);
      setTitle('');

      if (onUploadSuccess) {
        onUploadSuccess(res.data);
      }
    } catch (err) {
      console.error('Upload failed', err);
      setError(err.response?.data?.detail || 'Failed to upload and process document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-blue-400" />
        Upload College Knowledge Document
      </h3>
      <p className="text-xs text-gray-400 mb-6">
        Upload PDF notices, brochures, or syllabus files. They will be automatically parsed, chunked, embedded, and indexed into Qdrant.
      </p>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : file
              ? 'border-emerald-500/60 bg-emerald-500/5'
              : 'border-gray-700 hover:border-gray-600 bg-gray-950/40'
          }`}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <input
            id="file-upload-input"
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-emerald-400" />
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB • Click to change file
                </p>
              </div>
            </div>
          ) : (
            <div>
              <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-200">
                Drag & drop document here, or <span className="text-blue-400 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports PDF (with page numbering), DOCX, TXT (up to 50MB)
              </p>
            </div>
          )}
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Document Display Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MCA Admission Guidelines 2026-27"
              className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Department / Office
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Applications or All"
              className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026-27"
              className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
              className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={uploading || !file}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting & Indexing Chunks...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Ingest to Knowledge Base</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploader;
