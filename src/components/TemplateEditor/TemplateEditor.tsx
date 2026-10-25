import { useState } from 'react';
import { useTemplateStore } from '@/stores/templateStore';
import { useUIStore } from '@/stores/uiStore';
import styles from './TemplateEditor.module.css';

function TemplateEditor() {
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const updateTemplate = useTemplateStore((s) => s.updateTemplate);
  const templates = useTemplateStore((s) => s.templates);
  const editingTemplateId = useUIStore((s) => s.editingTemplateId);
  const toggleTemplateEditor = useUIStore((s) => s.toggleTemplateEditor);

  const editingTemplate = editingTemplateId ? templates[editingTemplateId] : null;

  const [name, setName] = useState(editingTemplate?.name || '');
  const [description, setDescription] = useState(editingTemplate?.description || '');
  const [content, setContent] = useState(editingTemplate?.content || '');

  function handleSave() {
    if (!name.trim() || !content.trim()) return;
    if (editingTemplateId) {
      void updateTemplate(editingTemplateId, {
        name: name.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
      });
    } else {
      void addTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
      });
    }
    toggleTemplateEditor();
  }

  function handleCancel() {
    toggleTemplateEditor();
  }

  return (
    <div className={styles.editor}>
      <input
        className={styles.nameInput}
        type="text"
        placeholder="模板名称…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <input
        className={styles.nameInput}
        type="text"
        placeholder="模板描述（可选）…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <textarea
        className={styles.contentInput}
        placeholder="输入模板内容，可用 {{变量名}} 插入变量…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />
      <div className={styles.actions}>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          {editingTemplateId ? '更新' : '保存'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </button>
      </div>
    </div>
  );
}

export default TemplateEditor;
