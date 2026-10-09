import { useState } from 'react';
import { useSnippetStore } from '@/stores/snippetStore';
import { useUIStore } from '@/stores/uiStore';
import type { Category } from '@/types';
import styles from './SnippetEditor.module.css';

function SnippetEditor() {
  const addSnippet = useSnippetStore((s) => s.addSnippet);
  const categories = useSnippetStore((s) => s.categories);
  const toggleSnippetEditor = useUIStore((s) => s.toggleSnippetEditor);

  const [category, setCategory] = useState<Category>(categories[0]?.id || '');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  function handleSave() {
    if (!name.trim() || !content.trim()) return;
    void addSnippet({ name: name.trim(), content: content.trim(), category });
    setName('');
    setContent('');
    setCategory(categories[0]?.id || '');
  }

  function handleCancel() {
    toggleSnippetEditor();
    setName('');
    setContent('');
    setCategory(categories[0]?.id || '');
  }

  return (
    <div className={styles.editor}>
      <div className={styles.catRow}>
        {categories.map((catMeta) => {
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
