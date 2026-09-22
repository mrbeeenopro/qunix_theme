use shared::State;
use utoipa_axum::{router::OpenApiRouter, routes};

pub static DEV_API_KEY: std::sync::LazyLock<String> = std::sync::LazyLock::new(|| {
    let raw = uuid::Uuid::new_v4().to_string().replace('-', "");
    format!("qunix_dev_{}", &raw[..12])
});

mod get {
    use crate::settings::QunixThemeSettingsData;
    use axum::{
        http::StatusCode,
        response::{IntoResponse, Response},
    };
    use serde::Serialize;
    use shared::{GetState, response::ApiResponse};
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    pub struct ResponseBody {
        pub settings: QunixThemeSettingsData,
    }

    #[utoipa::path(
        get,
        path = "/settings",
        responses(
            (status = OK, body = inline(ResponseBody)),
        ),
    )]
    pub async fn route(state: GetState) -> Response {
        let settings = match state.settings.get().await {
            Ok(s) => s,
            Err(e) => {
                return (StatusCode::INTERNAL_SERVER_ERROR, format!("Error: {}", e))
                    .into_response();
            }
        };

        let ext_settings: &QunixThemeSettingsData = match settings.find_extension_settings() {
            Ok(s) => s,
            Err(e) => {
                return (StatusCode::INTERNAL_SERVER_ERROR, format!("Error: {}", e))
                    .into_response();
            }
        };

        ApiResponse::new_serialized(ResponseBody {
            settings: ext_settings.clone(),
        })
        .into_response()
    }
}

mod put {
    use super::DEV_API_KEY;
    use crate::settings::QunixThemeSettingsData;
    use axum::{
        extract::Query,
        http::{HeaderMap, StatusCode},
        response::{IntoResponse, Response},
    };
    use serde::Serialize;
    use shared::{GetState, Payload, models::user::GetPermissionManager, response::ApiResponse};
    use std::collections::HashMap;
    use utoipa::ToSchema;

    #[derive(ToSchema, Serialize)]
    pub struct ResponseBody {}

    #[utoipa::path(
        put,
        path = "/settings",
        responses(
            (status = OK, body = inline(ResponseBody)),
        ),
        request_body = inline(QunixThemeSettingsData),
    )]
    pub async fn route(
        headers: HeaderMap,
        Query(params): Query<HashMap<String, String>>,
        state: GetState,
        permissions: Option<GetPermissionManager>,
        Payload(data): Payload<QunixThemeSettingsData>,
    ) -> Response {
        let expected_key = DEV_API_KEY.as_str();

        let header_key = headers
            .get("X-Api-Key")
            .or_else(|| headers.get("x-api-key"))
            .and_then(|v| v.to_str().ok());

        let auth_key = headers
            .get("Authorization")
            .or_else(|| headers.get("authorization"))
            .and_then(|v| v.to_str().ok())
            .and_then(|s| {
                s.strip_prefix("Bearer ")
                    .or_else(|| s.strip_prefix("bearer "))
            });

        let query_key = params
            .get("api_key")
            .or_else(|| params.get("key"))
            .map(|s| s.as_str());

        let has_valid_api_key = header_key == Some(expected_key)
            || auth_key == Some(expected_key)
            || query_key == Some(expected_key);

        let is_admin_or_permitted = match &permissions {
            Some(p) => {
                p.has_admin_permission("qunix-theme.update").is_ok()
                    || p.has_user_permission("qunix-theme.update").is_ok()
                    || p.has_admin_permission("settings.update").is_ok()
            }
            None => false,
        };

        if !has_valid_api_key && !is_admin_or_permitted {
            return (StatusCode::UNAUTHORIZED, "#").into_response();
        }

        let mut settings = match state.settings.get_mut().await {
            Ok(s) => s,
            Err(e) => {
                return (StatusCode::INTERNAL_SERVER_ERROR, format!("Error: {}", e))
                    .into_response();
            }
        };

        let ext_settings: &mut QunixThemeSettingsData = match settings.find_mut_extension_settings()
        {
            Ok(s) => s,
            Err(e) => {
                return (StatusCode::INTERNAL_SERVER_ERROR, format!("Error: {}", e))
                    .into_response();
            }
        };

        *ext_settings = data;

        if let Err(e) = settings.save().await {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error saving settings: {}", e),
            )
                .into_response();
        }

        ApiResponse::new_serialized(ResponseBody {}).into_response()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .routes(routes!(put::route))
        .with_state(state.clone())
}
