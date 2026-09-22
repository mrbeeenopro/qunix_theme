use shared::State;
use utoipa_axum::{router::OpenApiRouter, routes};

mod get {
    use crate::settings::QunixThemeSettingsData;
    use serde::Serialize;
    use shared::{
        GetState,
        models::user::GetPermissionManager,
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
    pub async fn route(state: GetState, permissions: GetPermissionManager) -> ApiResponseResult {
        permissions.has_admin_permission("settings.read")?;

        let settings = state.settings.get().await?;
        let ext_settings: &QunixThemeSettingsData = settings.find_extension_settings()?;

        ApiResponse::new_serialized(Response {
            settings: ext_settings.clone(),
        })
        .ok()
    }
}

mod put {
    use crate::settings::QunixThemeSettingsData;
    use serde::Serialize;
    use shared::{
        GetState,
        models::user::GetPermissionManager,
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    pub struct Response {}

    #[utoipa::path(
        put,
        path = "/settings",
        responses(
            (status = OK, body = inline(Response)),
        ),
        request_body = inline(QunixThemeSettingsData),
    )]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        shared::Payload(data): shared::Payload<QunixThemeSettingsData>,
    ) -> ApiResponseResult {
        permissions.has_admin_permission("settings.update")?;

        let mut settings = state.settings.get_mut().await?;
        let ext_settings: &mut QunixThemeSettingsData = settings.find_mut_extension_settings()?;
        *ext_settings = data;

        settings.save().await?;

        ApiResponse::new_serialized(Response {}).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .routes(routes!(put::route))
        .with_state(state.clone())
}
