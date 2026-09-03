'use client';

import React, { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface FileUploadProps {
  label: string;
  type: 'project' | 'certificate' | 'cv';
  value?: string;
  onChange: (url: string) => void;
}

export default function FileUpload({ label, type, value, onChange }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const endpointMap = {
    project: '/api/v1/upload/project',
    certificate: '/api/v1/upload/certificate',
    cv: '/api/v1/upload/cv',
  };

  const isPdf = (url?: string) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf') || type === 'cv';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMsg(null);
    setUploading(true);
    setProgress(20);

    try {
      setProgress(50);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setProgress(80);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setProgress(100);
      onChange(data.url);
      setSuccessMsg('File uploaded successfully to Vercel Blob!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error uploading file';
      setError(errorMessage);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  const handleRemove = () => {
    onChange('');
    setSuccessMsg(null);
  };

  const acceptTypes = type === 'cv' ? '.pdf' : 'image/jpeg,image/png,image/webp,.pdf';

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </label>

      {value ? (
        <div className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            {isPdf(value) ? (
              <div className="w-12 h-12 rounded bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold text-xs flex-shrink-0">
                PDF
              </div>
            ) : (
              <img src={getImageUrl(value)} alt="Preview" className="w-12 h-12 object-cover rounded border border-slate-200 flex-shrink-0" />
            )}
            <div className="text-xs text-slate-600 truncate">
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
              </span>
              <span className="truncate block max-w-xs text-slate-500">{value}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer transition-colors" title="Replace file">
              <RefreshCw className="w-4 h-4" />
              <input type="file" className="hidden" onChange={handleFileChange} accept={acceptTypes} />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-600 rounded p-6 text-center bg-white transition-colors">
          <input
            type="file"
            onChange={handleFileChange}
            accept={acceptTypes}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs text-slate-600">Uploading... {progress}%</p>
                <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="text-xs text-slate-700 font-medium">Click to upload or drag & drop</p>
                <p className="text-[10px] text-slate-500">
                  {type === 'cv' ? 'PDF (Max 5MB)' : 'PNG, JPG, WebP, PDF (Max 5MB)'}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {successMsg && !error && (
        <p className="text-xs text-emerald-600 flex items-center gap-1.5 mt-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> {successMsg}
        </p>
      )}

      {/* Manual URL Fallback Input for Serverless Hosting */}
      <div className="pt-1">
        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-[11px] text-blue-600 hover:underline inline-block font-medium"
          >
            + Or enter Image/PDF direct URL (Recommended for Vercel)
          </button>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or https://i.imgur.com/..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            />
            <button
              type="button"
              onClick={() => {
                if (manualUrl.trim()) {
                  onChange(manualUrl.trim());
                  setShowUrlInput(false);
                  setManualUrl('');
                }
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="p-1.5 text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
