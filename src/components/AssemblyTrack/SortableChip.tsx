import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Snippet } from '@/types';
import { CATEGORY_CSS_VARS } from '@/types';
import styles from './AssemblyTrack.module.css';

interface SortableChipProps {
  snippet: Snippet;
  index: number;
  onRemove: (id: string) => void;
  isLocked: boolean;
}

/**
 * 拼装台中可拖拽排序的 chip。
 * 高 38, 圆角 6, 填充 var(--bg-overlay), 描边为分类色 CSS 变量。
 * 内含 8×8 色点 + "N 片段名" + × 删除按钮。
 * isLocked 时隐藏 × 按钮、禁用拖拽。
 */
function SortableChip({ snippet, index, onRemove, isLocked }: SortableChipProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: snippet.id, disabled: isLocked });

  const color = CATEGORY_CSS_VARS[snippet.category];

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderColor: color,
  };

  return (
    <div
      ref={setNodeRef}
      className={`${styles.chip} ${isDragging ? styles.dragging : ''} ${isLocked ? styles.chipLocked : ''}`}
      style={style}
      {...attributes}
      {...(isLocked ? {} : listeners)}
    >
      <span className={styles.dot} style={{ background: color }} />
      <span className={styles.text}>
        {index + 1} {snippet.name}
      </span>
      {!isLocked && (
        <button
          type="button"
          className={styles.remove}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(snippet.id);
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SortableChip;
