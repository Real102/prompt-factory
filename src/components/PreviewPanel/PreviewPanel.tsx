import { useEffect } from 'react';
import { useAssemblyStore } from '@/stores/assemblyStore';
import { useUIStore } from '@/stores/uiStore';
import styles from './PreviewPanel.module.css';

/**
 * 合成预览区 —— 648×208, 填充 var(--bg-preview), 描边 var(--stroke), 圆角 6。
 * 拼装模式：只读 <pre> 显示自动合成文本。
 * 编辑模式：可编辑 <textarea>，边框高亮，用户修改不回写片段库。
 * 快捷键：编辑模式下 Escape 取消编辑（等同「取消」按钮），丢弃 editedText 还原。
 */
function PreviewPanel() {
  const mode = useAssemblyStore((s) => s.mode);
  const composedText = useAssemblyStore((s) => s.composedText);
  const editedText = useAssemblyStore((s) => s.editedText);
  const setEditedText = useAssemblyStore((s) => s.setEditedText);
  const resetEditing = useAssemblyStore((s) => s.resetEditing);

  useEffect(() => {
    if (mode !== 'editing') return;
    function handler(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (useUIStore.getState().searchPanelOpen) return;
      e.preventDefault();
      e.stopPropagation();
      resetEditing();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, resetEditing]);

  const output = editedText ?? composedText;
  const isEditing = mode === 'editing';

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.panel} ${isEditing ? styles.editing : ''}`}>
        <span className={styles.label}>
          {isEditing ? '// EDITING…' : '// COMPOSED OUTPUT'}
        </span>
        {isEditing ? (
          <textarea
            className={styles.textarea}
            value={output}
            onChange={(e) => setEditedText(e.target.value)}
            autoFocus
          />
        ) : output ? (
          <pre className={styles.content}>{output}</pre>
        ) : (
          <div className={styles.empty}>拼装结果将在此实时预览</div>
        )}
      </div>
    </div>
  );
}

export default PreviewPanel;
