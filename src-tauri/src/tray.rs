use tauri::{
    menu::{CheckMenuItem, IsMenuItem, Menu, MenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_autostart::ManagerExt;

use crate::commands::{read_ui_scale, write_ui_scale, UI_SCALES};

/// 创建系统托盘图标及菜单
pub fn create_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    // 菜单项（使用 with_id 确保可控的 ID）
    let show_item = MenuItem::with_id(app, "show", "显示浮层", true, None::<&str>)?;
    let autostart_item = CheckMenuItem::with_id(
        app,
        "toggle_autostart",
        "开机自启",
        true,
        app.autolaunch().is_enabled().unwrap_or(false),
        None::<&str>,
    )?;
    let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

    // 界面缩放子菜单（档位来自 commands::UI_SCALES），插在"开机自启"上方
    let current_scale = read_ui_scale();
    let scale_items = UI_SCALES
        .iter()
        .map(|&s| {
            let pct = (s * 100.0).round() as i32;
            let id = format!("scale_{}", pct);
            let label = format!("{}%", pct);
            CheckMenuItem::with_id(app, id, label, true, (s - current_scale).abs() < 0.001, None::<&str>)
                .expect("failed to build scale menu item")
        })
        .collect::<Vec<_>>();
    let scale_refs: Vec<&dyn IsMenuItem<tauri::Wry>> = scale_items
        .iter()
        .map(|i| i as &dyn IsMenuItem<tauri::Wry>)
        .collect();
    let scale_submenu = Submenu::with_items(app, "界面缩放", true, &scale_refs)?;
    // 克隆句柄供菜单事件闭包更新选中态
    let scale_handlers = scale_items.clone();

    let menu = Menu::new(app)?;
    menu.append(&show_item)?;
    menu.append(&scale_submenu)?; // 界面缩放（位于"开机自启"上方）
    menu.append(&autostart_item)?;
    menu.append(&quit_item)?;

    // 获取默认窗口图标作为托盘图标
    let icon = app
        .default_window_icon()
        .cloned()
        .expect("default window icon should be available");

    let autostart_handler = autostart_item.clone();

    // 托盘 tooltip 按平台显示唤起快捷键
    let tooltip_text = if cfg!(target_os = "macos") {
        "Prompt Factory · Option+Space 唤起"
    } else {
        "Prompt Factory · Ctrl+Space 唤起"
    };

    TrayIconBuilder::with_id("main-tray")
        .tooltip(tooltip_text)
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
        .on_menu_event(move |app, event| {
            let id = event.id().as_ref();
            // 界面缩放档位：scale_80 / scale_90 / scale_100 / scale_110 / scale_125 / scale_150
            if let Some(rest) = id.strip_prefix("scale_") {
                if let Ok(pct) = rest.parse::<i32>() {
                    let scale = pct as f64 / 100.0;
                    write_ui_scale(scale, app);
                    for h in &scale_handlers {
                        let h_pct = h
                            .id()
                            .as_ref()
                            .strip_prefix("scale_")
                            .and_then(|s| s.parse::<i32>().ok())
                            .unwrap_or(0);
                        let _ = h.set_checked((h_pct as f64 / 100.0 - scale).abs() < 0.001);
                    }
                }
                return;
            }
            match event.id().as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        crate::window::toggle_overlay_impl(window);
                    }
                }
                "toggle_autostart" => {
                    // 以 autolaunch 实际启用状态为准，不依赖 CheckMenuItem 的翻转时序
                    let current = app.autolaunch().is_enabled().unwrap_or(false);
                    let result = if current {
                        app.autolaunch().disable()
                    } else {
                        app.autolaunch().enable()
                    };
                    let final_state = if result.is_err() { current } else { !current };
                    let _ = autostart_handler.set_checked(final_state);
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
