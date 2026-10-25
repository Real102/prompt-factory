import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSnippetStore } from '@/stores/snippetStore';
import { useAssemblyStore } from '@/stores/assemblyStore';
import type { Snippet } from '@/types';
import SortableChip from './SortableChip';
import styles from './AssemblyTrack.module.css';

/**
 * 拼装台 —— 高 84, 填充 var(--bg-panel)。
 * 横向排列可拖拽排序的 chip, 空态提示引导用户从片段库加入。
 */
function AssemblyTrack() {
  const snippets = useSnippetStore((s) => s.snippets);
  const assemblyItems = useAssemblyStore((s) => s.assemblyItems);
  const reorderAssembly = useAssemblyStore((s) => s.reorderAssembly);
  const removeFromAssembly = useAssemblyStore((s) => s.removeFromAssembly);
  const isLocked = useAssemblyStore((s) => s.isLocked);
  const selectedTemplateId = useAssemblyStore((s) => s.selectedTemplateId);

  if (selectedTemplateId) return null;

  const assemblySnippets = assemblyItems
    .map((id) => snippets[id])
    .filter((s): s is Snippet => s != null);

  function handleDragEnd(event: DragEndEvent) {
    if (isLocked) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = assemblyItems.indexOf(String(active.id));
      const newIndex = assemblyItems.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderAssembly(oldIndex, newIndex);
      }
    }
  }

  return (
    <div className={`${styles.track} ${isLocked ? styles.locked : ''}`}>
      <span className={styles.label}>
        ASSEMBLY · {isLocked ? '已锁定' : '拖拽排序'}
      </span>
      <div className={styles.chips}>
        {assemblySnippets.length === 0 ? (
          <div className={styles.empty}>从下方片段库勾选片段加入拼装台 →</div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={assemblyItems}
              strategy={horizontalListSortingStrategy}
            >
              {assemblySnippets.map((snippet, index) => (
                <SortableChip
                  key={snippet.id}
                  snippet={snippet}
                  index={index}
                  onRemove={removeFromAssembly}
                  isLocked={isLocked}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

export default AssemblyTrack;
