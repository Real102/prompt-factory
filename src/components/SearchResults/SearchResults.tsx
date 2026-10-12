import { useState, useEffect, useRef, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useSnippetStore } from '@/stores/snippetStore';
import { useAssemblyStore } from '@/stores/assemblyStore';
import type { Snippet } from '@/types';
import styles from './SearchResults.module.css';

function SearchResults() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const panelOpen = useUIStore((s) => s.searchPanelOpen);
  const setSearchPanelOpen = useUIStore((s) => s.setSearchPanelOpen);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const showToast = useUIStore((s) => s.showToast);
  const snippets = useSnippetStore((s) => s.snippets);
  const categories = useSnippetStore((s) => s.categories);
  const assemblyItems = useAssemblyStore((s) => s.assemblyItems);
  const addToAssembly = useAssemblyStore((s) => s.addToAssembly);
  const removeFromAssembly = useAssemblyStore((s) => s.removeFromAssembly);
  const isLocked = useAssemblyStore((s) => s.isLocked);

  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const q = searchQuery.trim().toLowerCase();
  const filtered = useMemo<Snippet[]>(() => {
    if (!q) return [];
    return Object.values(snippets).filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q),
    );
  }, [snippets, q]);

  useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  const latestRef = useRef({ filtered, activeIndex, assemblyItems, isLocked });
  useEffect(() => {
    latestRef.current = { filtered, activeIndex, assemblyItems, isLocked };
  });

  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setSearchQuery('');
        setSearchPanelOpen(false);
        return;
      }
      const { filtered: f, activeIndex: ai, assemblyItems: items, isLocked: locked } = latestRef.current;
      if (!f.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.min(i + 1, f.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const s = f[ai];
        if (!s || locked) return;
        if (items.includes(s.id)) {
          removeFromAssembly(s.id);
          showToast(`已从拼装台移除：${s.name}`, 'info');
        } else {
          addToAssembly(s.id);
          showToast(`已加入拼装台：${s.name}`, 'success');
        }
        setSearchPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [panelOpen, setSearchQuery, setSearchPanelOpen, addToAssembly, removeFromAssembly, showToast]);

  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      const searchRow = document.querySelector('[data-search-row]');
      if (searchRow?.contains(target)) return;
      setSearchPanelOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen, setSearchPanelOpen]);

  useEffect(() => {
    if (!panelOpen) return;
    const rows = listRef.current?.querySelectorAll('[data-result-row]');
    const row = rows?.[activeIndex] as HTMLElement | undefined;
    row?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, panelOpen]);

  if (!panelOpen || !q) return null;

  const getCatMeta = (catId: string) => categories.find((c) => c.id === catId);
  const getCatColor = (catId: string) => getCatMeta(catId)?.color || '#c9f73d';
  const getCatName = (catId: string) => getCatMeta(catId)?.name || catId;

  function highlight(text: string): ReactNode {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className={styles.highlight}>{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  function handleRowClick(id: string, name: string) {
    if (isLocked) return;
    if (assemblyItems.includes(id)) {
      removeFromAssembly(id);
      showToast(`已从拼装台移除：${name}`, 'info');
    } else {
      addToAssembly(id);
      showToast(`已加入拼装台：${name}`, 'success');
    }
    setSearchPanelOpen(false);
  }

  return (
    <div ref={panelRef} className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.count}>
          {filtered.length ? (
            <>
              <b>{filtered.length}</b> 个匹配片段
            </>
          ) : (
            '无匹配片段'
          )}
        </span>
        <span className={styles.kbd}>
          <span>
            <kbd>↑↓</kbd> 选择
          </span>
          <span>
            <kbd>⏎</kbd> 加入拼装台
          </span>
        </span>
      </div>
      <div ref={listRef} className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>无匹配片段 · 试试其他关键词</div>
        ) : (
          filtered.map((s, i) => {
            const color = getCatColor(s.category);
            const added = assemblyItems.includes(s.id);
            return (
              <div
                key={s.id}
                data-result-row
                className={`${styles.row} ${i === activeIndex ? styles.active : ''} ${added ? styles.added : ''} ${isLocked ? styles.lockedRow : ''}`}
                style={{ '--cat-color': color } as CSSProperties}
                onClick={() => handleRowClick(s.id, s.name)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className={styles.dot} style={{ background: color }} />
                <span className={styles.name}>{highlight(s.name)}</span>
                <span className={styles.cat}>{getCatName(s.category)}</span>
                <span className={styles.preview}>{s.content}</span>
                <span className={styles.check}>✓</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SearchResults;
