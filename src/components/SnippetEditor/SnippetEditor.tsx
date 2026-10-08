import { useState } from 'react';
import { useSnippetStore } from '@/stores/snippetStore';
import { useUIStore } from '@/stores/uiStore';
import { CATEGORIES, CATEGORY_CSS_VARS } from '@/types';
import type { Category } from '@/types';
import styles from './SnippetEditor.module.css';

/**
 * 片段新增表单 —— 内联展开, 约 680×120。
 * 分类选择 chips + 名称输入 + 内容文本域 + 保存/取消。
 * 替换 SnippetLibrary 位置显示。
 */
function SnippetEditor() {
  const addSnippet = useSnippetStore((s) => s.addSnippet);
  const toggleSnippetEditor = useUIStore((s) => s.toggleSnippetEditor);

  const [category, setCategory] = useState<Category>('role');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  function handleSave() {
    if (!name.trim() || !content.trim()) return;
    void addSnippet({ name: name.trim(), content: content.trim(), category });
    setName('');
    setContent('');
    setCategory('role');
  }

  function handleCancel() {
    toggleSnippetEditor();
    setName('');
    setContent('');
    setCategory('role');
  }

  return (
    <div className={styles.editor}>
      <div className={styles.catRow}>
        {CATEGORIES.map((catMeta) => {
          const cat = catMeta.id;
          const color = CATEGORY_CSS_VARS[cat];
          const selected = category === cat;
          return (
            <button
              key={cat}
              type="button"
              className={styles.catChip}
              style={
                selected
                  ? {
                      background: `color-mix(in srgb, ${color} 15%, transparent)`,
                      borderColor: color,
                      color,
                    }
                  : undefined
              }
              onClick={() => setCategory(cat)}
            >
              {catMeta.name}
            </button>
          );
        })}
      </div>
      <input
        className={styles.nameInput}
        type="text"
        placeholder="片段名称…"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className={styles.contentInput}
        placeholder="输入片段内容…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
      />
      <div className={styles.actions}>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          保存
        </button>
        <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </button>
      </div>
    </div>
  );
}

export default SnippetEditor;
