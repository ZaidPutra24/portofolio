'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { confirmDelete } from '@/hooks/useAdminForm';
import { Loader2 } from 'lucide-react';

interface Message {
  id: number;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMessages = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${apiUrl}/api/v1/contact/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async (id: number, subject: string, sender: string) => {
    if (!confirmDelete(`message "${subject}" from ${sender}`)) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`${apiUrl}/api/v1/contact/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete message');
      setStatusMsg({ type: 'success', text: 'Message deleted successfully!' });
      fetchMessages();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting message';
      setStatusMsg({ type: 'error', text: errorMessage });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading messages...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Actions */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Contact Messages</h1>
            <p className="text-xs text-slate-500">View messages and inquiries submitted through your portfolio contact form</p>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`p-4 rounded-lg text-sm flex items-center gap-3 border ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="material-symbols-outlined">{statusMsg.type === 'success' ? 'check_circle' : 'error'}</span>
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400 text-sm shadow-sm">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-40">mail</span>
              <p>No contact messages received yet.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">{msg.subject}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">From: {msg.sender_name} ({msg.sender_email}) • {msg.created_at}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(msg.id, msg.subject, msg.sender_name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete message"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800 whitespace-pre-wrap">
                  {msg.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
