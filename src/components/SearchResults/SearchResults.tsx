import { useState, useEffect, useRef, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useSnippetStore } from '@/stores/snippetStore';
import { useTemplateStore, getTagColor } from '@/stores/templateStore';
import { useAssemblyStore } from '@/stores/assemblyStore';
import { extractVars } from '@/services/variableEngine';
import type { Snippet, Template } from '@/types';
import styles from './SearchResults.module.css';

type ResultEntry =
  | { type: 'template'; item: Template }
  | { type: 'snippet'; item: Snippet };

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
  const selectTemplate = useAssemblyStore((s) => s.selectTemplate);
  const isLocked = useAssemblyStore((s) => s.isLocked);
  const templates = useTemplateStore((s) => s.templates);

  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const q = searchQuery.trim().toLowerCase();

  const results = useMemo<ResultEntry[]>(() => {
    if (!q) return [];
    const tplResults: ResultEntry[] = Object.values(templates)
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false) ||
          t.content.toLowerCase().includes(q),
      )
      .sort((a, b) => b.usage_count - a.usage_count)
      .map((t) => ({ type: 'template', item: t }));
    const snpResults: ResultEntry[] = Object.values(snippets)
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q),
      )
      .sort((a, b) => b.usage_count - a.usage_count)
      .map((s) => ({ type: 'snippet', item: s }));
    return [...tplResults, ...snpResults];
  }, [templates, snippets, q]);

  useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  const latestRef = useRef({ results, activeIndex, assemblyItems, isLocked });
  useEffect(() => {
    latestRef.current = { results, activeIndex, assemblyItems, isLocked };
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
      const { results: r, activeIndex: ai, assemblyItems: items, isLocked: locked } = latestRef.current;
      if (!r.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.min(i + 1, r.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const entry = r[ai];
        if (!entry || locked) return;
        if (entry.type === 'template') {
          selectTemplate(entry.item.id);
          showToast(`已加载模板：${entry.item.name}`, 'success');
        } else {
          if (items.includes(entry.item.id)) {
            removeFromAssembly(entry.item.id);
            showToast(`已从拼装台移除：${entry.item.name}`, 'info');
          } else {
            addToAssembly(entry.item.id);
            showToast(`已加入拼装台：${entry.item.name}`, 'success');
          }
        }
        setSearchPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [panelOpen, setSearchQuery, setSearchPanelOpen, addToAssembly, removeFromAssembly, selectTemplate, showToast]);

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

  function handleRowClick(entry: ResultEntry) {
    if (isLocked) return;
    if (entry.type === 'template') {
      selectTemplate(entry.item.id);
      showToast(`已加载模板：${entry.item.name}`, 'success');
    } else {
      if (assemblyItems.includes(entry.item.id)) {
        removeFromAssembly(entry.item.id);
        showToast(`已从拼装台移除：${entry.item.name}`, 'info');
      } else {
        addToAssembly(entry.item.id);
        showToast(`已加入拼装台：${entry.item.name}`, 'success');
      }
    }
    setSearchPanelOpen(false);
  }

  const tplCount = results.filter((r) => r.type === 'template').length;
  const snpCount = results.length - tplCount;

  return (
    <div ref={panelRef} className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.count}>
          {results.length ? (
            <>
              <b>{tplCount}</b> 模板 · <b>{snpCount}</b> 片段
            </>
          ) : (
            '无匹配结果'
          )}
        </span>
        <span className={styles.kbd}>
          <span>
            <kbd>↑↓</kbd> 选择
          </span>
          <span>
            <kbd>⏎</kbd> 确认
          </span>
        </span>
      </div>
      <div ref={listRef} className={styles.list}>
        {results.length === 0 ? (
          <div className={styles.empty}>无匹配结果 · 试试其他关键词</div>
        ) : (
          results.map((entry, i) => {
            const isActive = i === activeIndex;
            if (entry.type === 'template') {
              const t = entry.item;
              const tagList = t.tags ?? [];
              const varCount = extractVars(t.content).length;
              return (
                <div
                  key={`tpl-${t.id}`}
                  data-result-row
                  className={`${styles.row} ${styles.tplRow} ${isActive ? styles.active : ''} ${isLocked ? styles.lockedRow : ''}`}
                  style={{ '--cat-color': '#c9f73d' } as CSSProperties}
                  onClick={() => handleRowClick(entry)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <span className={styles.tplIcon}>📋</span>
                  <span className={styles.name}>{highlight(t.name)}</span>
                  {tagList.slice(0, 2).map((tag) => {
                    const color = getTagColor(tag);
                    return (
                      <span key={tag} className={styles.tag} style={{ borderColor: color, color }}>
                        {tag}
                      </span>
                    );
                  })}
                  {varCount > 0 && <span className={styles.varCount}>{varCount}变量</span>}
                  <span className={styles.usageCount}>已宠幸{t.usage_count}</span>
                </div>
              );
            } else {
              const s = entry.item;
              const color = getCatColor(s.category);
              const added = assemblyItems.includes(s.id);
              return (
                <div
                  key={`snp-${s.id}`}
                  data-result-row
                  className={`${styles.row} ${isActive ? styles.active : ''} ${added ? styles.added : ''} ${isLocked ? styles.lockedRow : ''}`}
                  style={{ '--cat-color': color } as CSSProperties}
                  onClick={() => handleRowClick(entry)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <span className={styles.dot} style={{ background: color }} />
                  <span className={styles.name}>{highlight(s.name)}</span>
                  <span className={styles.cat}>{getCatName(s.category)}</span>
                  <span className={styles.preview}>{s.content}</span>
                  <span className={styles.check}>✓</span>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
}

export default SearchResults;
