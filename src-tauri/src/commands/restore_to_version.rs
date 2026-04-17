use super::common::fetch_branch;
use crate::db::DbPool;
use crate::models::{RestoreResult, StoredEvent, StoredSnapshot};
use tauri::State;

fn collect_restore(
    pool: DbPool,
    branch_id: String,
    target_version: i64,
) -> std::pin::Pin<
    Box<
        dyn std::future::Future<Output = Result<(Option<StoredSnapshot>, Vec<StoredEvent>), String>>
            + Send,
    >,
> {
    Box::pin(async move {
        let snapshot = sqlx::query_as::<_, StoredSnapshot>(
            "SELECT branch_id, version, state, created_at FROM snapshots WHERE branch_id = ? AND version <= ? ORDER BY version DESC LIMIT 1",
        )
        .bind(&branch_id)
        .bind(target_version)
        .fetch_optional(&pool)
        .await
        .map_err(|e| e.to_string())?;

        if let Some(snap) = snapshot {
            let events = sqlx::query_as::<_, StoredEvent>(
                "SELECT sequence_id, stream_id, branch_id, kind, payload, version, created_at FROM events WHERE branch_id = ? AND version > ? AND version <= ? ORDER BY version ASC",
            )
            .bind(&branch_id)
            .bind(snap.version)
            .bind(target_version)
            .fetch_all(&pool)
            .await
            .map_err(|e| e.to_string())?;
            return Ok((Some(snap), events));
        }

        let branch = fetch_branch(&pool, &branch_id).await?;

        match (branch.parent_branch_id, branch.fork_version) {
            (Some(parent_id), Some(fork_version)) => {
                let (parent_snap, mut events) =
                    collect_restore(pool.clone(), parent_id, fork_version).await?;
                let own_events = sqlx::query_as::<_, StoredEvent>(
                    "SELECT sequence_id, stream_id, branch_id, kind, payload, version, created_at FROM events WHERE branch_id = ? AND version <= ? ORDER BY version ASC",
                )
                .bind(&branch_id)
                .bind(target_version)
                .fetch_all(&pool)
                .await
                .map_err(|e| e.to_string())?;
                events.extend(own_events);
                Ok((parent_snap, events))
            }
            _ => {
                let events = sqlx::query_as::<_, StoredEvent>(
                    "SELECT sequence_id, stream_id, branch_id, kind, payload, version, created_at FROM events WHERE branch_id = ? AND version <= ? ORDER BY version ASC",
                )
                .bind(&branch_id)
                .bind(target_version)
                .fetch_all(&pool)
                .await
                .map_err(|e| e.to_string())?;
                Ok((None, events))
            }
        }
    })
}

#[tauri::command]
pub async fn restore_to_version(
    pool: State<'_, DbPool>,
    branch_id: String,
    target_version: i64,
) -> Result<RestoreResult, String> {
    let (snapshot, events) =
        collect_restore(pool.inner().clone(), branch_id.clone(), target_version).await?;
    Ok(RestoreResult {
        branch_id,
        target_version,
        snapshot,
        events,
    })
}
