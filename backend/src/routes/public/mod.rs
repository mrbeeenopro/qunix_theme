use shared::State;
use utoipa_axum::router::OpenApiRouter;

mod settings;

pub fn router(state: &State) -> OpenApiRouter<State> {
    settings::router(state)
}
