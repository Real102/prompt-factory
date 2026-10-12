import { useState } from 'react';
import { useSnippetStore } from '@/stores/snippetStore';
import { useUIStore } from '@/stores/uiStore';
import type { Category } from '@/types';
import styles from './SnippetEditor.module.css';

function SnippetEditor() {
  const addSnippet = useSnippetStore((s) => s.addSnippet);
  const updateSnippet = useSnippetStore((s) => s.updateSnippet);
  const snippets = useSnippetStore((s) => s.snippets);
  const categories = useSnippetStore((s) => s.categories);
  const editingSnippetId = useUIStore((s) => s.editingSnippetId);
  const toggleSnippetEditor = useUIStore((s) => s.toggleSnippetEditor);

  const editingSnippet = editingSnippetId ? snippets[editingSnippetId] : null;

  const [category, setCategory] = useState<Category>(editingSnippet?.category || categories[0]?.id || '');
  const [name, setName] = useState(editingSnippet?.name || '');
  const [content, setContent] = useState(editingSnippet?.content || '');
  const [catQuery, setCatQuery] = useState('');

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(catQuery.trim().toLowerCase())
  );

  function handleSave() {
    if (!name.trim() || !content.trim()) return;
    if (editingSnippetId) {
      void updateSnippet(editingSnippetId, { name: name.trim(), content: content.trim(), category });
    } else {
      void addSnippet({ name: name.trim(), content: content.trim(), category });
    }
    toggleSnippetEditor();
  }

  function handleCancel() {
    toggleSnippetEditor();
  }

  return (
    <div className={styles.editor}>
      <div className={styles.catRow}>
        <input
          className={styles.catSearch}
          type="text"
          placeholder="搜索分类…"
          value={catQuery}
          onChange={(e) => setCatQuery(e.target.value)}
        />
        <div className={styles.catChips}>
          {filteredCategories.map((catMeta) => {
            const cat = catMeta.id;
            const color = catMeta.color;
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
          {filteredCategories.length === 0 && (
            <span className={styles.catEmpty}>无匹配分类</span>
          )}
        </div>
      </div>
      <input
        className={styles.nameInput}
        type="text"
        placeholder="片段名称…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <textarea
        className={styles.contentInput}
        placeholder="输入片段内容…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <div className={styles.actions}>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          {editingSnippetId ? '更新' : '保存'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </button>
      </div>
    </div>
  );
}

export default SnippetEditor;
