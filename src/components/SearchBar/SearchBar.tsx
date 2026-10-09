import { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <div className={styles.bar} data-tauri-drag-region>
      <div className={styles.brandRow} data-tauri-drag-region>
        <span className={styles.logoGroup}>
          <span className={styles.pf}>PF</span>
          <span className={styles.full}>Prompt-Factory</span>
        </span>
        <span className={styles.sepSlogan}>
          <span className={styles.sep} />
          <span className={styles.slogan}>片段成串，注入即用</span>
        </span>
      </div>
      <div className={styles.searchRow} data-tauri-drag-region>
        <div className={styles.left}>
          <svg className={styles.icon} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M9.5 9.5L12 12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <input
            className={styles.input}
            type="text"
            placeholder="搜索片段…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className={styles.hint}>Ctrl Space</span>
      </div>
    </div>
  );
}

export default SearchBar;
