use std::path::PathBuf;

/// IPC command: 复制文本到剪贴板
#[tauri::command]
pub fn copy_to_clipboard(text: String, app: tauri::AppHandle) -> bool {
    use tauri_plugin_clipboard_manager::ClipboardExt;
    let _ = app.clipboard().write_text(text);
    true
}

/// 获取数据文件路径：exe 同目录下的 data/prompt-factory-data.json
fn get_data_file_path() -> PathBuf {
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));
    exe_dir.join("data").join("prompt-factory-data.json")
}

/// IPC command: 读取数据文件
/// 读取 exe 同目录下 data/prompt-factory-data.json，不存在返回 "{}"
#[tauri::command]
pub fn read_data_file() -> String {
    let data_file = get_data_file_path();
    match std::fs::read_to_string(&data_file) {
        Ok(content) => content,
        Err(_) => "{}".to_string(),
    }
}

/// IPC command: 写入数据文件
/// 写入 exe 同目录下 data/prompt-factory-data.json
#[tauri::command]
pub fn write_data_file(content: String) {
    let data_file = get_data_file_path();
    if let Some(parent) = data_file.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let _ = std::fs::write(&data_file, content);
}

/// IPC command: 导出数据到指定路径
#[tauri::command]
pub fn export_data(target_path: String) -> bool {
    let data_file = get_data_file_path();
    match std::fs::read_to_string(&data_file) {
        Ok(content) => std::fs::write(&target_path, content).is_ok(),
        Err(_) => false,
    }
}

/// IPC command: 从指定路径导入数据
#[tauri::command]
pub fn import_data(source_path: String) -> bool {
    match std::fs::read_to_string(&source_path) {
        Ok(content) => {
            let data_file = get_data_file_path();
            if let Some(parent) = data_file.parent() {
                let _ = std::fs::create_dir_all(parent);
            }
            std::fs::write(&data_file, content).is_ok()
        }
        Err(_) => false,
    }
}
