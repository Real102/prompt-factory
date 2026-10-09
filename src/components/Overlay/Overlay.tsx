import { useEffect, useRef, type ReactNode } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalSize } from '@tauri-apps/api/dpi';
import styles from './Overlay.module.css';

interface OverlayProps {
  children: ReactNode;
  visible?: boolean;
}

function Overlay({ children, visible = true }: OverlayProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let lastHeight = 0;

    const updateSize = async (height: number) => {
      const minHeight = 400;
      const maxHeight = window.screen.height - 80;
      const finalHeight = Math.min(Math.max(height, minHeight), maxHeight);
      if (finalHeight === lastHeight) return;
      lastHeight = finalHeight;
      try {
        const win = getCurrentWindow();
        await win.setSize(new LogicalSize(680, finalHeight));
      } catch {
        // 浏览器开发环境忽略
      }
    };

    const observer = new ResizeObserver(() => {
      const height = el.offsetHeight;
      void updateSize(height);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.overlay} ${visible ? styles.visible : styles.hidden}`}>
      {children}
    </div>
  );
}

export default Overlay;
