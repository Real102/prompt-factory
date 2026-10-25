import { useState, useEffect, useRef } from 'react';
import { useTemplateStore, getTagColor } from '@/stores/templateStore';
import { useUIStore } from '@/stores/uiStore';
import { useAssemblyStore } from '@/stores/assemblyStore';
import styles from './TemplateList.module.css';

function TemplateList() {
  const templates = useTemplateStore((s) => s.templates);
  const addTag = useTemplateStore((s) => s.addTag);
  const removeTag = useTemplateStore((s) => s.removeTag);
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate);
  const selectedTemplateId = useUIStore((s) => s.selectedTemplateId);
  const startEditTemplate = useUIStore((s) => s.startEditTemplate);
  const toggleTemplateEditor = useUIStore((s) => s.toggleTemplateEditor);
  const showToast = useUIStore((s) => s.showToast);
  const selectTemplate = useAssemblyStore((s) => s.selectTemplate);
  const clearTemplateSelection = useAssemblyStore((s) => s.clearTemplateSelection);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [tagInputId, setTagInputId] = useState<string | null>(null);
  const [tagInputValue, setTagInputValue] = useState('');
  const [expandedTagsId, setExpandedTagsId] = useState<string | null>(null);
  const popconfirmRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagCommittedRef = useRef(false);

  useEffect(() => {
    if (!confirmId) return;
    const handler = (e: MouseEvent) => {
      if (popconfirmRef.current && !popconfirmRef.current.contains(e.target as Node)) {
        setConfirmId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [confirmId]);

  useEffect(() => {
    if (tagInputId && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [tagInputId]);

  const sortedTemplates = Object.values(templates).sort(
    (a, b) => b.usage_count - a.usage_count
  );

  function startTagInput(id: string) {
    tagCommittedRef.current = false;
    setTagInputId(id);
    setTagInputValue('');
  }

  function commitTagInput(id: string) {
    if (tagCommittedRef.current) return;
    tagCommittedRef.current = true;
    const tag = tagInputValue.trim();
    if (tag) {
      void addTag(id, tag);
    }
    setTagInputId(null);
    setTagInputValue('');
  }

  function cancelTagInput() {
    tagCommittedRef.current = true;
    setTagInputId(null);
    setTagInputValue('');
  }

  function handleConfirmDelete(id: string) {
    void deleteTemplate(id);
    setConfirmId(null);
    if (selectedTemplateId === id) {
      clearTemplateSelection();
    }
    showToast('模板已删除', 'info');
  }

  if (sortedTemplates.length === 0) {
    return (
      <div className={styles.list}>
        <div className={styles.empty} onClick={toggleTemplateEditor}>
          点击 +模板 创建第一个模板
        </div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {sortedTemplates.map((tpl) => {
        const isSelected = selectedTemplateId === tpl.id;
        const tags = tpl.tags ?? [];
        const isExpanded = expandedTagsId === tpl.id;
        const visibleTags = isExpanded ? tags : tags.slice(0, 2);
        const hiddenCount = tags.length - visibleTags.length;
        const isTagInput = tagInputId === tpl.id;
        const isConfirming = confirmId === tpl.id;
        const desc = tpl.description || tpl.content;

        return (
          <div
            key={tpl.id}
            className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
            onClick={() => selectTemplate(tpl.id)}
          >
            <div className={styles.row1}>
              <span className={styles.name}>{tpl.name}</span>
              <span
                className={styles.tags}
                title={tags.length > 0 ? tags.join('、') : undefined}
              >
                {visibleTags.map((tag) => {
                  const color = getTagColor(tag);
                  return (
                    <span key={tag} className={styles.tagWrap} onClick={(e) => e.stopPropagation()}>
                      <span
                        className={styles.tag}
                      style={{
                        background: `color-mix(in srgb, ${color} 15%, transparent)`,
                        color,
                      }}
                      >
                        {tag}
                      </span>
                      <button
                        type="button"
                        className={styles.tagRemove}
                        title="移除标签"
                        onClick={() => void removeTag(tpl.id, tag)}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    className={styles.tagMore}
                    onClick={(e) => { e.stopPropagation(); setExpandedTagsId(isExpanded ? null : tpl.id); }}
                  >
                    {isExpanded ? '收起' : `+${hiddenCount}`}
                  </button>
                )}
                {isTagInput ? (
                  <input
                    ref={tagInputRef}
                    className={styles.tagInput}
                    type="text"
                    placeholder="标签名"
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitTagInput(tpl.id);
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelTagInput();
                      }
                    }}
                    onBlur={() => commitTagInput(tpl.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  tags.length < 5 && (
                    <button
                      type="button"
                      className={styles.tagAddBtn}
                      onClick={(e) => { e.stopPropagation(); startTagInput(tpl.id); }}
                    >
                      {tags.length === 0 ? '+标签' : '+'}
                    </button>
                  )
                )}
              </span>
              <span className={styles.usage}>已宠幸 {tpl.usage_count} 次</span>
              <span className={styles.actions} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  title="编辑模板"
                  onClick={() => startEditTemplate(tpl.id)}
                >
                  ✎
                </button>
                <span className={styles.deleteWrap}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    title="删除模板"
                    onClick={() => setConfirmId(tpl.id)}
                  >
                    ✕
                  </button>
                  {isConfirming && (
                    <div className={styles.popconfirm} ref={popconfirmRef}>
                      <span className={styles.popconfirmMsg}>
                        {`删除模板「${tpl.name}」？`}
                      </span>
                      <div className={styles.popconfirmBtns}>
                        <button
                          type="button"
                          className={styles.popconfirmCancel}
                          onClick={() => setConfirmId(null)}
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          className={styles.popconfirmOk}
                          onClick={() => handleConfirmDelete(tpl.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </span>
              </span>
            </div>
            <div className={styles.row2}>{desc}</div>
          </div>
        );
      })}
    </div>
  );
}

export default TemplateList;
