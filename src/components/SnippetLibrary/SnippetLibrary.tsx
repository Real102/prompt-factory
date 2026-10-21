import { useState, useEffect, useRef } from 'react';
import { useSnippetStore } from '@/stores/snippetStore';
import { useAssemblyStore } from '@/stores/assemblyStore';
import { useUIStore } from '@/stores/uiStore';
import { CATEGORY_COLOR_POOL } from '@/types';
import type { CategoryMeta } from '@/types';
import styles from './SnippetLibrary.module.css';

function SnippetLibrary() {
  const snippets = useSnippetStore((s) => s.snippets);
  const categories = useSnippetStore((s) => s.categories);
  const addCategory = useSnippetStore((s) => s.addCategory);
  const updateCategory = useSnippetStore((s) => s.updateCategory);
  const deleteCategory = useSnippetStore((s) => s.deleteCategory);
  const assemblyItems = useAssemblyStore((s) => s.assemblyItems);
  const addToAssembly = useAssemblyStore((s) => s.addToAssembly);
  const removeFromAssembly = useAssemblyStore((s) => s.removeFromAssembly);
  const isLocked = useAssemblyStore((s) => s.isLocked);
  const toggleSnippetEditor = useUIStore((s) => s.toggleSnippetEditor);
  const startEditSnippet = useUIStore((s) => s.startEditSnippet);
  const deleteSnippet = useSnippetStore((s) => s.deleteSnippet);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [newCatMode, setNewCatMode] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLOR_POOL[0]);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState('');
  const [confirmCatId, setConfirmCatId] = useState<string | null>(null);
  const [confirmSnippetId, setConfirmSnippetId] = useState<string | null>(null);
  const popconfirmRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!confirmCatId && !confirmSnippetId) return;
    const handler = (e: MouseEvent) => {
      if (popconfirmRef.current && !popconfirmRef.current.contains(e.target as Node)) {
        setConfirmCatId(null);
        setConfirmSnippetId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [confirmCatId, confirmSnippetId]);

  useEffect(() => {
    if (initializedRef.current || categories.length === 0) return;
    initializedRef.current = true;
    const initial: Record<string, boolean> = {};
    categories.forEach((c) => {
      initial[c.id] = true;
    });
    setCollapsed(initial);
  }, [categories]);

  const isInAssembly = (id: string) => assemblyItems.includes(id);
  const getCatColor = (catId: string): string => {
    const cat = categories.find((c) => c.id === catId);
    return cat?.color || '#c9f73d';
  };

  // 从色池中分配未被现有分类使用的颜色（PRD 6.6：避免重复）
  const nextColor = (): string => {
    const used = new Set(categories.map((c) => c.color));
    return (
      CATEGORY_COLOR_POOL.find((c) => !used.has(c)) ||
      CATEGORY_COLOR_POOL[categories.length % CATEGORY_COLOR_POOL.length]
    );
  };

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

  function handleAddCategory() {
    if (!newCatName.trim()) return;
    void addCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
    setNewCatColor(nextColor());
    setNewCatMode(false);
  }

  function startEditCategory(cat: CategoryMeta) {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatColor(cat.color);
  }

  function handleUpdateCategory() {
    if (!editingCatId || !editCatName.trim()) return;
    void updateCategory(editingCatId, editCatName.trim(), editCatColor);
    setEditingCatId(null);
  }

  function confirmDeleteCategory(catId: string) {
    void deleteCategory(catId);
    setConfirmCatId(null);
  }

  function confirmDeleteSnippet(id: string) {
    void deleteSnippet(id);
    setConfirmSnippetId(null);
  }

  return (
    <div className={`${styles.library} ${isLocked ? styles.locked : ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>SNIPPET LIBRARY · 片段库</span>
        <div className={styles.headerBtns}>
          <button type="button" className={styles.addBtn} onClick={() => { setNewCatMode(true); setNewCatColor(nextColor()); }}>
            + 分类
          </button>
          <button type="button" className={styles.addBtn} onClick={toggleSnippetEditor}>
            + 片段
          </button>
        </div>
      </div>
      <div className={styles.list}>
        {newCatMode && (
          <div className={styles.catEditRow}>
            <input
              className={styles.catNameInput}
              type="text"
              placeholder="分类名称…"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              autoFocus
            />
            <input
              className={styles.catColorInput}
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
            />
            <button type="button" className={styles.catConfirmBtn} onClick={handleAddCategory}>
              ✓
            </button>
            <button
              type="button"
              className={styles.catCancelBtn}
              onClick={() => { setNewCatMode(false); setNewCatName(''); }}
            >
              ✕
            </button>
          </div>
        )}
        {categories.map((catMeta) => {
          const cat = catMeta.id;
          const catSnippets = Object.values(snippets).filter(
            (s) => s.category === cat
          );
          const isCollapsed = collapsed[cat];
          const color = catMeta.color;
          const isEditing = editingCatId === cat;
          const isConfirming = confirmCatId === cat;
          const confirmMsg = catSnippets.length > 0
            ? `删除分类「${catMeta.name}」？该分类下 ${catSnippets.length} 个片段也将被删除。`
            : `删除分类「${catMeta.name}」？`;
          return (
            <div key={cat} className={styles.group}>
              {isEditing ? (
                <div className={styles.catEditRow}>
                  <input
                    className={styles.catNameInput}
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    autoFocus
                  />
                  <input
                    className={styles.catColorInput}
                    type="color"
                    value={editCatColor}
                    onChange={(e) => setEditCatColor(e.target.value)}
                  />
                  <button type="button" className={styles.catConfirmBtn} onClick={handleUpdateCategory}>
                    ✓
                  </button>
                  <button
                    type="button"
                    className={styles.catCancelBtn}
                    onClick={() => setEditingCatId(null)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
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
                  <span className={styles.catActions} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={styles.catActionBtn}
                      title="编辑分类"
                      onClick={() => startEditCategory(catMeta)}
                    >
                      ✎
                    </button>
                    <span className={styles.deleteWrap}>
                      <button
                        type="button"
                        className={styles.catActionBtn}
                        title="删除分类"
                        onClick={() => setConfirmCatId(cat)}
                      >
                        ✕
                      </button>
                      {isConfirming && (
                        <div className={styles.popconfirm} ref={popconfirmRef}>
                          <span className={styles.popconfirmMsg}>{confirmMsg}</span>
                          <div className={styles.popconfirmBtns}>
                            <button
                              type="button"
                              className={styles.popconfirmCancel}
                              onClick={() => setConfirmCatId(null)}
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              className={styles.popconfirmOk}
                              onClick={() => confirmDeleteCategory(cat)}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      )}
                    </span>
                  </span>
                </div>
              )}
              {!isCollapsed && !isEditing && (
                <div className={styles.items}>
                  {catSnippets.length === 0 ? (
                    <div className={styles.emptyCat}>暂无片段</div>
                  ) : (
                    catSnippets.map((snippet) => {
                      const checked = isInAssembly(snippet.id);
                      const catColor = getCatColor(snippet.category);
                      const isSnippetConfirming = confirmSnippetId === snippet.id;
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
                          <span className={styles.itemPreview}>
                            {snippet.content.length > 60
                              ? snippet.content.substring(0, 60) + '…'
                              : snippet.content}
                          </span>
                          <span className={styles.snippetActions} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className={styles.catActionBtn}
                              title="编辑片段"
                              onClick={() => startEditSnippet(snippet.id)}
                            >
                              ✎
                            </button>
                            <span className={styles.deleteWrap}>
                              <button
                                type="button"
                                className={styles.catActionBtn}
                                title="删除片段"
                                onClick={() => setConfirmSnippetId(snippet.id)}
                              >
                                ✕
                              </button>
                              {isSnippetConfirming && (
                                <div className={styles.popconfirm} ref={popconfirmRef}>
                                  <span className={styles.popconfirmMsg}>{`删除片段「${snippet.name}」？`}</span>
                                  <div className={styles.popconfirmBtns}>
                                    <button
                                      type="button"
                                      className={styles.popconfirmCancel}
                                      onClick={() => setConfirmSnippetId(null)}
                                    >
                                      取消
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.popconfirmOk}
                                      onClick={() => confirmDeleteSnippet(snippet.id)}
                                    >
                                      删除
                                    </button>
                                  </div>
                                </div>
                              )}
                            </span>
                          </span>
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
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
        {categories.length === 0 && !newCatMode && (
          <div className={styles.emptyCat}>点击「+ 分类」创建第一个分类</div>
        )}
      </div>
    </div>
  );
}

export default SnippetLibrary;
