use std::path::PathBuf;
use tauri::Emitter;

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

/// 获取设置文件路径：exe 同目录下 data/prompt-factory-settings.json
/// UI 偏好独立存档，不随数据导入导出被覆盖
fn get_settings_file_path() -> PathBuf {
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));
    exe_dir.join("data").join("prompt-factory-settings.json")
}

/// 界面缩放可选档位
pub const UI_SCALES: [f64; 6] = [0.8, 0.9, 1.0, 1.1, 1.25, 1.5];

/// 读取 ui_scale；文件缺失或字段非法时返回 1.0
pub fn read_ui_scale() -> f64 {
    let path = get_settings_file_path();
    match std::fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str::<serde_json::Value>(&content)
            .ok()
            .and_then(|v| v.get("ui_scale").and_then(|s| s.as_f64()))
            .filter(|&x| x >= 0.5 && x <= 2.0)
            .unwrap_or(1.0),
        Err(_) => 1.0,
    }
}

/// 写入 ui_scale（保留 settings 其他字段），并向前端 emit ui-scale-changed 事件
pub fn write_ui_scale(scale: f64, app: &tauri::AppHandle) -> bool {
    let clamped = if scale < 0.5 {
        0.5
    } else if scale > 2.0 {
        2.0
    } else {
        scale
    };
    let path = get_settings_file_path();
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let mut root: serde_json::Value = std::fs::read_to_string(&path)
        .ok()
        .and_then(|c| serde_json::from_str(&c).ok())
        .unwrap_or_else(|| serde_json::json!({}));
    if let Some(obj) = root.as_object_mut() {
        obj.insert("ui_scale".to_string(), serde_json::json!(clamped));
    } else {
        root = serde_json::json!({ "ui_scale": clamped });
    }
    let ok = std::fs::write(&path, serde_json::to_string_pretty(&root).unwrap_or_default()).is_ok();
    let _ = app.emit("ui-scale-changed", clamped);
    ok
}

/// IPC command: 读取界面缩放
#[tauri::command]
pub fn get_ui_scale() -> f64 {
    read_ui_scale()
}

/// IPC command: 设置界面缩放
#[tauri::command]
pub fn set_ui_scale(scale: f64, app: tauri::AppHandle) -> bool {
    write_ui_scale(scale, &app)
}
