import { useState } from 'react';
import { useSnippetStore } from '@/stores/snippetStore';
import { useAssemblyStore } from '@/stores/assemblyStore';
import { useUIStore } from '@/stores/uiStore';
import { CATEGORIES, CATEGORY_CSS_VARS } from '@/types';
import type { Category } from '@/types';
import styles from './SnippetLibrary.module.css';

/**
 * 片段库面板 —— flex:1, 填充 var(--bg-panel), 顶部描边。
 * 按分类分组展示片段, 每项有 checkbox 用于加入/移出拼装台。
 * 底部「+ 新增片段」按钮打开 SnippetEditor。
 */
function SnippetLibrary() {
  const snippets = useSnippetStore((s) => s.snippets);
  const assemblyItems = useAssemblyStore((s) => s.assemblyItems);
  const addToAssembly = useAssemblyStore((s) => s.addToAssembly);
  const removeFromAssembly = useAssemblyStore((s) => s.removeFromAssembly);
  const toggleSnippetEditor = useUIStore((s) => s.toggleSnippetEditor);

  // 折叠状态：默认仅展开第一个分类
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    role: false,
    perm: true,
    avoid: true,
    fmt: true,
    ctx: true,
  });

  const isInAssembly = (id: string) => assemblyItems.includes(id);

  function toggleAssembly(id: string) {
    if (isInAssembly(id)) {
      removeFromAssembly(id);
    } else {
      addToAssembly(id);
    }
  }

  function toggleCollapse(cat: string) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  return (
    <div className={styles.library}>
      <div className={styles.header}>
        <span className={styles.title}>SNIPPET LIBRARY · 片段库</span>
        <button type="button" className={styles.addBtn} onClick={toggleSnippetEditor}>
          + 新增片段
        </button>
      </div>
      <div className={styles.list}>
        {CATEGORIES.map((catMeta) => {
          const cat = catMeta.id as Category;
          const catSnippets = Object.values(snippets).filter(
            (s) => s.category === cat
          );
          if (catSnippets.length === 0) return null;
          const isCollapsed = collapsed[cat];
          const color = CATEGORY_CSS_VARS[cat];
          return (
            <div key={cat} className={styles.group}>
              <div
                className={styles.groupHeader}
                onClick={() => toggleCollapse(cat)}
              >
                <span className={styles.groupDot} style={{ background: color }} />
                <span className={styles.groupName} style={{ color }}>
                  {catMeta.name}
                </span>
                <span className={styles.groupCount}>{catSnippets.length}</span>
                <span className={styles.collapseIcon}>
                  {isCollapsed ? '▸' : '▾'}
                </span>
              </div>
              {!isCollapsed && (
                <div className={styles.items}>
                  {catSnippets.map((snippet) => {
                    const checked = isInAssembly(snippet.id);
                    const catColor = CATEGORY_CSS_VARS[snippet.category];
                    return (
                      <div
                        key={snippet.id}
                        className={`${styles.item} ${checked ? styles.itemSelected : ''}`}
                        style={checked ? { borderLeftColor: catColor } : undefined}
                        onClick={() => toggleAssembly(snippet.id)}
                      >
                        <span
                          className={styles.itemDot}
                          style={{ background: catColor }}
                        />
                        <span className={styles.itemName}>{snippet.name}</span>
                        <span
                          className={`${styles.checkbox} ${checked ? styles.checked : ''}`}
                          style={
                            checked
                              ? { background: catColor, borderColor: catColor }
                              : undefined
                          }
                        >
                          {checked && <span className={styles.checkmark}>✓</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SnippetLibrary;
