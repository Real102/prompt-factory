import type { ReactNode } from 'react';
import styles from './Overlay.module.css';

interface OverlayProps {
  children: ReactNode;
  visible?: boolean;
}

function Overlay({ children, visible = true }: OverlayProps) {
  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : styles.hidden}`}>
      {children}
    </div>
  );
}

export default Overlay;
