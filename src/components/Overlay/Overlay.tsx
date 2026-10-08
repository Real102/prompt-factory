import type { ReactNode } from 'react';
import styles from './Overlay.module.css';

interface OverlayProps {
  children: ReactNode;
  /** 是否可见，控制收起/展开动画 */
  visible?: boolean;
}

/**
 * 浮层容器 —— Prompt Factory 主面板根容器。
 * 680×560, 圆角 12, 描边 var(--accent)。
 */
function Overlay({ children, visible = true }: OverlayProps) {
  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : styles.hidden}`}>
      {children}
    </div>
  );
}

export default Overlay;
