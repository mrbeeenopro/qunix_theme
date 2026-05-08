use shared::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod get {
    use crate::settings::QunixThemeSettingsData;
    use serde::Serialize;
    use shared::{
        GetState,
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    pub struct Response {
        pub settings: QunixThemeSettingsData,
    }

    #[utoipa::path(
        get,
        path = "/settings",
        responses(
            (status = OK, body = inline(Response)),
        ),
    )]
    pub async fn route(state: GetState) -> ApiResponseResult {
        let settings = state.settings.get().await?;
        let ext_settings: &QunixThemeSettingsData = settings.find_extension_settings()?;

        ApiResponse::new_serialized(Response {
            settings: ext_settings.clone(),
        })
        .ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .with_state(state.clone())
}
