// ============================================================
// Prompt Factory - 本地存储服务
// 通过 Tauri IPC 读写 exe 同目录下 data/prompt-factory-data.json
// 浏览器环境回退 localStorage
// ============================================================

import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import type { AppData } from '@/types';
// 复用子 Agent 2 提供的种子数据
import { getSeedData as getSeedDataFromData } from '@/data/seedSnippets';

/** 重新导出 getSeedData，供 snippetStore 使用 */
export { getSeedDataFromData as getSeedData };

/** localStorage 键名（浏览器开发环境回退用） */
const STORAGE_KEY = 'prompt-factory-data';

/** 校验 AppData 结构完整性 */
function isValidData(data: unknown): data is AppData {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.snippets !== null &&
    typeof obj.snippets === 'object' &&
    Array.isArray(obj.categories)
  );
}

/**
 * 本地存储服务。
 *
 * 通过 Tauri invoke 调用 Rust 侧的 read_data_file / write_data_file
 * 命令读写 JSON 文件。在浏览器开发环境（invoke 不可用）下
 * 自动回退到 localStorage。
 */
export class StorageService {
  /** 加载数据；文件不存在或为空时返回种子数据 */
  async load(): Promise<AppData> {
    try {
      const raw = await invoke<string>('read_data_file');
      if (!raw || raw.trim() === '') {
        return getSeedDataFromData();
      }
      const parsed = JSON.parse(raw);
      if (!isValidData(parsed)) {
        return getSeedDataFromData();
      }
      return parsed;
    } catch {
      // invoke 不可用（浏览器环境），回退 localStorage
      return this.loadFromLocal();
    }
  }

  /** 保存数据到本地文件 */
  async save(data: AppData): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    try {
      await invoke('write_data_file', { content });
    } catch {
      // invoke 不可用，回退 localStorage
      this.saveToLocal(data);
    }
  }

  /** 从 localStorage 加载（浏览器回退） */
  private loadFromLocal(): AppData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getSeedDataFromData();
      const parsed = JSON.parse(raw);
      if (!isValidData(parsed)) {
        return getSeedDataFromData();
      }
      return parsed;
    } catch {
      return getSeedDataFromData();
    }
  }

  /** 保存到 localStorage（浏览器回退） */
  private saveToLocal(data: AppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 忽略存储配额错误
    }
  }

  /** 导出数据到用户选择的文件 */
  async exportData(): Promise<boolean> {
    try {
      const filePath = await save({
        title: '导出数据',
        defaultPath: 'prompt-factory-data.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });
      if (!filePath) return false;
      return await invoke<boolean>('export_data', { targetPath: filePath });
    } catch {
      return false;
    }
  }

  /** 从用户选择的文件导入数据 */
  async importData(): Promise<boolean> {
    try {
      const filePath = await open({
        title: '导入数据',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        multiple: false,
      });
      if (!filePath || typeof filePath !== 'string') return false;
      return await invoke<boolean>('import_data', { sourcePath: filePath });
    } catch {
      return false;
    }
  }
}

/** 单例实例 */
export const storageService = new StorageService();
