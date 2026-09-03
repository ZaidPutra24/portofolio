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

    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const token = localStorage.getItem('admin_token');

    try {
      setProgress(50);
      const res = await fetch(`${apiUrl}${endpointMap[type]}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setProgress(90);
      let data;
      const textResponse = await res.text();
      try {
        data = JSON.parse(textResponse);
      } catch (parseErr) {
        throw new Error(`Server returned non-JSON response (${res.status}): ${textResponse.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setProgress(100);
      onChange(data.url);
      setSuccessMsg(data.message || 'File uploaded successfully!');
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
    </div>
  );
}
