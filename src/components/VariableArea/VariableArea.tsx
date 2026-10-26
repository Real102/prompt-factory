import { useEffect, useRef } from 'react';
import { useAssemblyStore } from '@/stores/assemblyStore';
import { getTagColor } from '@/stores/templateStore';
import styles from './VariableArea.module.css';

function VariableArea() {
  const variables = useAssemblyStore((s) => s.variables);
  const setVariable = useAssemblyStore((s) => s.setVariable);
  const selectedTemplateId = useAssemblyStore((s) => s.selectedTemplateId);
  const clearTemplateSelection = useAssemblyStore((s) => s.clearTemplateSelection);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const varEntries = Object.entries(variables);

  useEffect(() => {
    if (selectedTemplateId && varEntries.length > 0 && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [selectedTemplateId, varEntries.length]);

  if (!selectedTemplateId || varEntries.length === 0) {
    return null;
  }

  return (
    <div className={styles.area}>
      <span className={styles.label}>◆ VARIABLES · 变量插槽</span>
      <div className={styles.list}>
        {varEntries.map(([name, value], index) => (
          <div className={styles.varItem} key={name}>
            <span className={styles.varName} style={{ color: getTagColor(name) }}>{`{{${name}}}`}</span>
            <span className={styles.varEquals}>=</span>
            <input
              ref={index === 0 ? firstInputRef : undefined}
              className={styles.varInput}
              value={value}
              onChange={(e) => setVariable(name, e.target.value)}
              placeholder={name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default VariableArea;
