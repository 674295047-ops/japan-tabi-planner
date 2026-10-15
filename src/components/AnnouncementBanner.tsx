import React, { useState } from 'react';
import { Pin, X, ChevronDown, ChevronUp, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AnnouncementBanner: React.FC = () => {
  const { announcements } = useAuth();
  const pinned = announcements.filter(a => a.pinned);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (pinned.length === 0) return null;

  const visible = pinned.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2 mb-4">
      {visible.map((ann) => {
        const isExpanded = expanded.has(ann.id);
        const isLong = ann.content.length > 80;
        return (
          <div
            key={ann.id}
            className="relative flex items-start gap-3 bg-gradient-to-r from-indigo-50 to-indigo-50/60 border border-indigo-200/80 rounded-2xl px-4 py-3 shadow-sm"
          >
            {/* Pin Icon */}
            <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <Pin className="w-3.5 h-3.5 text-indigo-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <Megaphone className="w-2.5 h-2.5" />
                  ประกาศ
                </span>
                <p className="text-xs font-bold text-indigo-900">{ann.title}</p>
              </div>
              <p className={`text-[11px] text-indigo-700 mt-1 leading-relaxed transition-all ${!isExpanded && isLong ? 'line-clamp-1' : ''}`}>
                {ann.content}
              </p>
              {isLong && (
                <button
                  onClick={() => toggleExpand(ann.id)}
                  className="flex items-center gap-0.5 mt-0.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-3 h-3" />ย่อ</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" />อ่านเพิ่มเติม</>
                  )}
                </button>
              )}
              <p className="text-[10px] text-indigo-400 mt-1 font-mono">
                โดย {ann.authorName}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setDismissed(prev => new Set([...prev, ann.id]))}
              className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-500 hover:text-indigo-700 flex items-center justify-center transition-colors"
              title="ปิดประกาศนี้"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
