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

    // 高度上限：固定 800px，超出时内容在内部滚动，而非无限撑大窗口
    const maxH = 850;
    el.style.maxHeight = `${maxH}px`;

    let lastHeight = 0;

    const updateSize = async (height: number) => {
      const finalHeight = Math.max(height, 600);
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
      void updateSize(el.offsetHeight);
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
