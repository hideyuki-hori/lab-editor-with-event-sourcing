mod commands;
mod db;
mod models;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let db_path = if cfg!(debug_assertions) {
                std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                    .parent()
                    .expect("failed to resolve project root")
                    .join("data.db")
            } else {
                let app_data_dir = app
                    .path()
                    .app_data_dir()
                    .expect("failed to resolve app data dir");
                std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
                app_data_dir.join("data.db")
            };

            let pool = tauri::async_runtime::block_on(async { db::init(&db_path).await })
                .expect("failed to init database");
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::append_events::append_events,
            commands::create_branch::create_branch,
            commands::create_page::create_page,
            commands::list_branches::list_branches,
            commands::list_pages::list_pages,
            commands::load_page::load_page,
            commands::restore_to_version::restore_to_version,
            commands::save_snapshot::save_snapshot,
            commands::switch_branch::switch_branch,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
