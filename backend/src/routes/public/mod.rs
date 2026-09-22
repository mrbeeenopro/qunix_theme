use shared::State;
use utoipa_axum::router::OpenApiRouter;

pub mod settings;

pub fn router(state: &State) -> OpenApiRouter<State> {
    settings::router(state)
}
