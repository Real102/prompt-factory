use tauri::Manager;

/// IPC command: 复制文本到剪贴板
#[tauri::command]
pub fn copy_to_clipboard(text: String, app: tauri::AppHandle) -> bool {
    use tauri_plugin_clipboard_manager::ClipboardExt;
    let _ = app.clipboard().write_text(text);
    true
}

/// IPC command: 读取数据文件
/// 读取 app_data_dir/prompt-factory-data.json，不存在返回 "{}"
#[tauri::command]
pub fn read_data_file(app: tauri::AppHandle) -> String {
    let app_data_dir = match app.path().app_data_dir() {
        Ok(dir) => dir,
        Err(_) => return "{}".to_string(),
    };
    let data_file = app_data_dir.join("prompt-factory-data.json");
    match std::fs::read_to_string(&data_file) {
        Ok(content) => content,
        Err(_) => "{}".to_string(),
    }
}

/// IPC command: 写入数据文件
/// 写入 app_data_dir/prompt-factory-data.json
#[tauri::command]
pub fn write_data_file(content: String, app: tauri::AppHandle) {
    if let Ok(app_data_dir) = app.path().app_data_dir() {
        let _ = std::fs::create_dir_all(&app_data_dir);
        let data_file = app_data_dir.join("prompt-factory-data.json");
        let _ = std::fs::write(&data_file, content);
    }
}
