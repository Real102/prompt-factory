mod commands;
mod inject;
mod shortcut;
mod tray;
mod window;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            window::toggle_overlay,
            window::start_drag,
            inject::inject_text,
            commands::copy_to_clipboard,
            commands::read_data_file,
            commands::write_data_file,
            commands::export_data,
            commands::import_data,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.open_devtools();
                }
            }

            // 初始化系统托盘
            tray::create_tray(app.handle())?;

            // 注册全局快捷键
            shortcut::register_shortcut(app.handle())?;

            // 注册窗口失焦自动收起（仅 release，debug 模式保留窗口方便调试）
            // #[cfg(not(debug_assertions))]
            window::setup_auto_hide(app.handle());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
