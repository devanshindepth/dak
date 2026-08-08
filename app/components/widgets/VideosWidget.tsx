'use client';

import React, { useEffect, useState } from 'react';
import { VideosWidgetConfig, YouTubeVideo } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';
import { TimeAgo } from '@/app/components/ui/TimeAgo';

export default function VideosWidget({ config }: { config: VideosWidgetConfig }) {
  const [channels, setChannels] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-yt-channels-${config.id || 'default'}`);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return config.channels || ['UCsBjURrPoezykLs9EqgamOA', 'UCXuqSBlHAE6Xw-yeJA0Tunw'];
  });

  const [newChannel, setNewChannel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-yt-channels-${config.id || 'default'}`, JSON.stringify(channels));
    }
  }, [channels, config.id]);

  useEffect(() => {
    async function fetchVideos() {
      if (channels.length === 0) {
        setVideos([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/youtube?channels=${encodeURIComponent(channels.join(','))}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, [channels]);

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.trim()) return;
    if (!channels.includes(newChannel.trim())) {
      setChannels([...channels, newChannel.trim()]);
    }
    setNewChannel('');
    setShowAddForm(false);
  };

  const handleRemoveChannel = (ch: string) => {
    setChannels(channels.filter((c) => c !== ch));
  };

  return (
    <WidgetShell
      title={config.title || 'YouTube Videos'}
      titleUrl={config.titleUrl || 'https://youtube.com'}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-tertiary">
          <span>Channels: {channels.length}</span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>{showAddForm ? '✕ Close' : '＋ Add Channel'}</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddChannel} className="flex gap-2 p-2 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="Channel ID (e.g. UCXuq...)"
              className="flex-1 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
            />
            <button type="submit" className="px-2.5 py-1 text-xs font-semibold bg-primary text-background rounded">
              Add
            </button>
          </form>
        )}

        {channels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-subtle">
            {channels.map((ch) => (
              <span
                key={ch}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-subtle text-secondary border border-subtle"
              >
                <span>{ch.slice(0, 10)}...</span>
                <button
                  onClick={() => handleRemoveChannel(ch)}
                  className="hover:text-negative font-bold"
                  title="Remove channel"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.slice(0, config.limit || 6).map((video) => (
            <a
              key={video.id}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-1.5 p-1.5 rounded border border-subtle hover:border-text-secondary transition-all bg-subtle/50"
            >
              <div className="relative aspect-video rounded overflow-hidden bg-black">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-primary line-clamp-2 leading-snug group-hover:underline">
                  {video.title}
                </span>
                <div className="flex items-center justify-between text-[10px] text-tertiary mt-0.5">
                  <span className="font-semibold text-secondary">{video.author}</span>
                  <TimeAgo date={video.pubDate} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}
