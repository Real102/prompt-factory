import { useAssemblyStore } from '@/stores/assemblyStore';
import styles from './BottomBar.module.css';

/**
 * 底部按钮区 —— 高 56, 填充 var(--bg-panel)。
 * 拼装模式：[✎ 编辑] + [复制] + [注入]
 * 编辑模式：[✓ 完成] + [复制] + [注入]
 * 锁定模式：[✎ 编辑] + [↺ 重置] + [复制] + [注入]
 * canAction 为 false 时复制/注入按钮禁用。
 */
function BottomBar() {
  const canAction = useAssemblyStore((s) => s.canAction);
  const mode = useAssemblyStore((s) => s.mode);
  const isLocked = useAssemblyStore((s) => s.isLocked);
  const composedText = useAssemblyStore((s) => s.composedText);
  const editedText = useAssemblyStore((s) => s.editedText);
  const enterEditing = useAssemblyStore((s) => s.enterEditing);
  const exitEditing = useAssemblyStore((s) => s.exitEditing);
  const resetEditing = useAssemblyStore((s) => s.resetEditing);
  const copyToClipboard = useAssemblyStore((s) => s.copyToClipboard);
  const injectToCursor = useAssemblyStore((s) => s.injectToCursor);

  const isEditing = mode === 'editing';
  const hasContent = (editedText ?? composedText).length > 0;

  return (
    <div className={styles.bar}>
      {isEditing ? (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnDone}`}
          onClick={exitEditing}
        >
          ✓ 完成
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnEdit}`}
          onClick={enterEditing}
          disabled={!hasContent}
        >
          ✎ 编辑
        </button>
      )}
      {isLocked && !isEditing && (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnReset}`}
          onClick={resetEditing}
        >
          ↺ 重置
        </button>
      )}
      <button
        type="button"
        className={`${styles.btn} ${styles.primary} ${!canAction ? styles.disabled : ''}`}
        onClick={() => void copyToClipboard()}
        disabled={!canAction}
      >
        ⏎ 复制到剪贴板
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.secondary} ${!canAction ? styles.disabled : ''}`}
        onClick={() => void injectToCursor()}
        disabled={!canAction}
      >
        ⇧ 注入当前光标
      </button>
    </div>
  );
}

export default BottomBar;
