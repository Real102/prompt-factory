import { useAssemblyStore } from '@/stores/assemblyStore';
import styles from './PreviewPanel.module.css';

/**
 * 合成预览区 —— 648×208, 填充 var(--bg-preview), 描边 var(--stroke), 圆角 6。
 * 实时显示拼装台中片段按序合成的文本（来自 assemblyStore.composedText）。
 */
function PreviewPanel() {
  const composedText = useAssemblyStore((s) => s.composedText);

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <span className={styles.label}>// COMPOSED OUTPUT</span>
        {composedText ? (
          <pre className={styles.content}>{composedText}</pre>
        ) : (
          <div className={styles.empty}>拼装结果将在此实时预览</div>
        )}
      </div>
    </div>
  );
}

export default PreviewPanel;
