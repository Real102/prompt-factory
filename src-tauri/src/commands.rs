use std::path::PathBuf;
use tauri::{Emitter, Manager};

/// IPC command: 复制文本到剪贴板
#[tauri::command]
pub fn copy_to_clipboard(text: String, app: tauri::AppHandle) -> bool {
    use tauri_plugin_clipboard_manager::ClipboardExt;
    let _ = app.clipboard().write_text(text);
    true
}

/// 获取数据根目录：AppData 下（Windows: %APPDATA%\com.prompt-factory.app\data）
fn get_data_dir(app: &tauri::AppHandle) -> PathBuf {
    let base = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."));
    // dev 调试（npm run tauri dev）数据存独立 dev/data 子目录，
    // 与安装版正式数据彻底隔离，互不覆盖
    if cfg!(debug_assertions) {
        base.join("dev").join("data")
    } else {
        base.join("data")
    }
}

/// 获取数据文件路径：AppData 下 data/prompt-factory-data.json
fn get_data_file_path(app: &tauri::AppHandle) -> PathBuf {
    get_data_dir(app).join("prompt-factory-data.json")
}

/// IPC command: 读取数据文件
/// 读取 AppData 下 data/prompt-factory-data.json，不存在返回 "{}"
#[tauri::command]
pub fn read_data_file(app: tauri::AppHandle) -> String {
    let data_file = get_data_file_path(&app);
    match std::fs::read_to_string(&data_file) {
        Ok(content) => content,
        Err(_) => "{}".to_string(),
    }
}

/// IPC command: 写入数据文件
/// 写入 AppData 下 data/prompt-factory-data.json
#[tauri::command]
pub fn write_data_file(content: String, app: tauri::AppHandle) {
    let data_file = get_data_file_path(&app);
    if let Some(parent) = data_file.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let _ = std::fs::write(&data_file, content);
}

/// IPC command: 导出数据到指定路径
#[tauri::command]
pub fn export_data(target_path: String, app: tauri::AppHandle) -> bool {
    let data_file = get_data_file_path(&app);
    match std::fs::read_to_string(&data_file) {
        Ok(content) => std::fs::write(&target_path, content).is_ok(),
        Err(_) => false,
    }
}

/// IPC command: 从指定路径导入数据
#[tauri::command]
pub fn import_data(source_path: String, app: tauri::AppHandle) -> bool {
    match std::fs::read_to_string(&source_path) {
        Ok(content) => {
            let data_file = get_data_file_path(&app);
            if let Some(parent) = data_file.parent() {
                let _ = std::fs::create_dir_all(parent);
            }
            std::fs::write(&data_file, content).is_ok()
        }
        Err(_) => false,
    }
}

/// 获取设置文件路径：AppData 下 data/prompt-factory-settings.json
/// UI 偏好独立存档，不随数据导入导出被覆盖
fn get_settings_file_path(app: &tauri::AppHandle) -> PathBuf {
    get_data_dir(app).join("prompt-factory-settings.json")
}

/// 首次启动迁移：把旧版 exe 同目录 data/ 下的数据搬到 AppData（只复制不删除）
/// 仅当 AppData 下对应文件不存在且旧文件存在时复制，不覆盖新数据；失败静默（旧文件仍在）
pub fn migrate_legacy_data(app: &tauri::AppHandle) {
    let new_dir = get_data_dir(app);
    let legacy_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."))
        .join("data");

    const FILES: [&str; 2] = ["prompt-factory-data.json", "prompt-factory-settings.json"];
    for name in FILES {
        let new_file = new_dir.join(name);
        if new_file.exists() {
            continue; // AppData 已有数据，不覆盖
        }
        let legacy_file = legacy_dir.join(name);
        if !legacy_file.exists() {
            continue;
        }
        if let Some(parent) = new_file.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let _ = std::fs::copy(&legacy_file, &new_file);
    }
}

/// 界面大小可选档位
pub const UI_SCALES: [f64; 3] = [1.0, 1.25, 1.5];

/// 浮层窗口基准尺寸（逻辑像素，与 tauri.conf.json 保持一致）
pub const BASE_W: f64 = 680.0;
pub const BASE_H: f64 = 800.0;

/// 读取 ui_scale（吸附到最近合法档位，兼容旧档 0.8/0.9/1.1）；文件缺失或字段非法时返回 1.0
pub fn read_ui_scale(app: &tauri::AppHandle) -> f64 {
    let path = get_settings_file_path(app);
    let raw = match std::fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str::<serde_json::Value>(&content)
            .ok()
            .and_then(|v| v.get("ui_scale").and_then(|s| s.as_f64()))
            .filter(|&x| x >= 0.5 && x <= 2.0)
            .unwrap_or(1.0),
        Err(_) => 1.0,
    };
    snap_to_scale(raw)
}

/// 把存储的任意值吸附到最近的合法档位
fn snap_to_scale(value: f64) -> f64 {
    UI_SCALES
        .iter()
        .copied()
        .min_by(|a, b| {
            (a - value)
                .abs()
                .partial_cmp(&(b - value).abs())
                .unwrap_or(std::cmp::Ordering::Equal)
        })
        .unwrap_or(1.0)
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
    let path = get_settings_file_path(app);
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
    // 窗口尺寸跟随档位等比放大
    if let Some(window) = app.get_webview_window("main") {
        crate::window::apply_scale(&window, clamped);
    }
    ok
}

/// IPC command: 读取界面缩放
#[tauri::command]
pub fn get_ui_scale(app: tauri::AppHandle) -> f64 {
    read_ui_scale(&app)
}

/// IPC command: 设置界面缩放
#[tauri::command]
pub fn set_ui_scale(scale: f64, app: tauri::AppHandle) -> bool {
    write_ui_scale(scale, &app)
}
