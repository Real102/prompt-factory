import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTemplateStore } from '@/stores/templateStore';
import { useUIStore } from '@/stores/uiStore';
import type { TemplateType } from '@/types';
import styles from './SaveAsTemplateDialog.module.css';

interface SaveAsTemplateDialogProps {
  /** 另存类型：引用型（拼装台组合快照）/ 固化型（编辑文本快照） */
  type: TemplateType;
  /** 引用型：片段 ID 有序快照 */
  steps?: string[];
  /** 固化型：文本快照 */
  content?: string;
  onClose: () => void;
}

/**
 * 另存为模板弹窗（PRD §4.5.8）
 * 名称必填、描述可选；确认后按入口类型创建引用型/固化型模板并立即持久化，
 * Toast 反馈「模板已保存：xxx」。
 */
function SaveAsTemplateDialog({ type, steps, content, onClose }: SaveAsTemplateDialogProps) {
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const showToast = useUIStore((s) => s.showToast);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const isReference = type === 'reference';
  const typeHint = isReference
    ? '引用型 · 保存当前片段组合，片段修改自动生效'
    : '固化型 · 保存当前文本快照，独立于片段';

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    void addTemplate({
      name: trimmed,
      description: description.trim() || undefined,
      type,
      ...(isReference ? { steps: steps ?? [] } : { content: content ?? '' }),
    })
      .then(() => {
        showToast(`模板已保存：${trimmed}`, 'success');
        onClose();
      })
      .finally(() => setSaving(false));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
  }

  return createPortal(
    <div
      className={styles.mask}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog} onKeyDown={handleKeyDown}>
        <div className={styles.header}>
          <span className={styles.title}>另存为模板</span>
          <span className={`${styles.typeBadge} ${isReference ? styles.typeRef : ''}`}>
            {isReference ? '引用型' : '固化型'}
          </span>
        </div>
        <span className={styles.typeHint}>{typeHint}</span>
        <input
          ref={nameRef}
          className={styles.input}
          type="text"
          placeholder="模板名称（必填）…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={styles.input}
          type="text"
          placeholder="模板描述（可选）…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!name.trim() || saving}
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SaveAsTemplateDialog;
