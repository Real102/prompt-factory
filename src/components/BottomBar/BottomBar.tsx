import { useAssemblyStore } from '@/stores/assemblyStore';
import styles from './BottomBar.module.css';

/**
 * 底部按钮区 —— 高 56, 填充 var(--bg-panel)。
 * 主按钮「复制到剪贴板」+ 次按钮「注入当前光标」, 居中排列。
 * canAction 为 false 时两按钮禁用 (opacity 0.4)。
 */
function BottomBar() {
  const canAction = useAssemblyStore((s) => s.canAction);
  const copyToClipboard = useAssemblyStore((s) => s.copyToClipboard);
  const injectToCursor = useAssemblyStore((s) => s.injectToCursor);

  return (
    <div className={styles.bar}>
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
