import { useUIStore } from '@/stores/uiStore';
import styles from './Toast.module.css';

/**
 * Toast 通知 —— 成功复制 / 成功注入两种变体。
 * 根据消息内容自动匹配样式：
 *   - 包含「注入」→ 描边 var(--cat-fmt)
 *   - 包含「复制」→ 描边 var(--accent)
 * 自动消失 2s（由 uiStore 管理）, 带 fade-out 动画。
 */
function Toast() {
  const toast = useUIStore((s) => s.toast);

  if (!toast) return null;

  const isInject = toast.msg.includes('注入');
  const isCopy = toast.msg.includes('复制');
  const variantClass = isInject ? styles.inject : styles.copy;
  const prefix = isInject || isCopy ? '✓ ' : '';

  return (
    <div className={`${styles.toast} ${variantClass}`}>
      {prefix}
      {toast.msg}
    </div>
  );
}

export default Toast;
