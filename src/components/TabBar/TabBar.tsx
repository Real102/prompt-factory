import { useUIStore } from '@/stores/uiStore';
import styles from './TabBar.module.css';

function TabBar() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const toggleTemplateEditor = useUIStore((s) => s.toggleTemplateEditor);
  const toggleSnippetEditor = useUIStore((s) => s.toggleSnippetEditor);
  const setShowCategoryEditor = useUIStore((s) => s.setShowCategoryEditor);

  const isTemplate = activeTab === 'template';

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={`${styles.tab} ${isTemplate ? styles.tabActive : ''}`}
        onClick={() => setActiveTab('template')}
      >
        模板
      </button>
      <button
        type="button"
        className={`${styles.tab} ${!isTemplate ? styles.tabActive : ''}`}
        onClick={() => setActiveTab('snippet')}
      >
        片段库
      </button>
      <div className={styles.addBtns}>
        {isTemplate ? (
          <button type="button" className={styles.addBtn} onClick={toggleTemplateEditor}>
            +模板
          </button>
        ) : (
          <>
            <button type="button" className={styles.addBtn} onClick={() => setShowCategoryEditor(true)}>
              +分类
            </button>
            <button type="button" className={styles.addBtn} onClick={toggleSnippetEditor}>
              +片段
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TabBar;
