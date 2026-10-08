use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

/// 创建系统托盘图标及菜单
pub fn create_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    // 菜单项（使用 with_id 确保可控的 ID）
    let show_item = MenuItem::with_id(app, "show", "显示浮层", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::new(app)?;
    menu.append(&show_item)?;
    menu.append(&quit_item)?;

    // 获取默认窗口图标作为托盘图标
    let icon = app
        .default_window_icon()
        .cloned()
        .expect("default window icon should be available");

    TrayIconBuilder::with_id("main-tray")
        .tooltip("Prompt Factory · Ctrl+Space 唤起")
        .icon(icon)
        .menu(&menu)
        .on_tray_icon_event(|tray, event| {
            // 左键点击 → toggle_overlay
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    crate::window::toggle_overlay_impl(window);
                }
            }
        })
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        crate::window::toggle_overlay_impl(window);
                    }
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(())
}
