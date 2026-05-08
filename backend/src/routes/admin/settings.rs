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
        #[schema(inline)]
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
        permissions.has_admin_permission("extensions.qunix.theme.read")?;
        let settings = state.settings.get().await?;
        let ext_settings: &QunixThemeSettingsData = settings.find_extension_settings()?;

        tracing::info!(
            "QUNIX_THEME: GET settings: background_color={}",
            ext_settings.background_color
        );

        ApiResponse::new_serialized(Response {
            settings: ext_settings.clone(),
        })
        .ok()
    }
}

mod put {
    use crate::settings::QunixThemeSettingsData;
    use garde::Validate;
    use serde::Deserialize;
    use shared::{
        GetState,
        models::user::GetPermissionManager,
        response::{ApiResponse, ApiResponseResult},
    };
    use utoipa::ToSchema;

    #[derive(ToSchema, Validate, Deserialize)]
    pub struct Payload {
        #[serde(alias = "backgroundColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub background_color: Option<compact_str::CompactString>,
        #[serde(alias = "textColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub text_color: Option<compact_str::CompactString>,
        #[serde(alias = "focusColor")]
        #[garde(length(chars, min = 4, max = 50))]
        pub focus_color: Option<compact_str::CompactString>,
        #[serde(alias = "shadowOpacity")]
        #[garde(range(min = 0.0, max = 1.0))]
        pub shadow_opacity: Option<f32>,
        #[serde(alias = "fontFamily")]
        #[garde(length(chars, min = 1, max = 100))]
        pub font_family: Option<compact_str::CompactString>,
        #[serde(alias = "sidebarColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub sidebar_color: Option<compact_str::CompactString>,
        #[serde(alias = "cardColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub card_color: Option<compact_str::CompactString>,
        #[serde(alias = "borderColor")]
        #[garde(length(chars, min = 4, max = 50))]
        pub border_color: Option<compact_str::CompactString>,
        #[serde(alias = "borderRadius")]
        #[garde(range(min = 0, max = 100))]
        pub border_radius: Option<i32>,
        #[serde(alias = "navbarColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub navbar_color: Option<compact_str::CompactString>,
        #[serde(alias = "terminalColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub terminal_color: Option<compact_str::CompactString>,
        #[serde(alias = "terminalTextColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub terminal_text_color: Option<compact_str::CompactString>,
        #[serde(alias = "inputColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub input_color: Option<compact_str::CompactString>,
        #[serde(alias = "buttonRadius")]
        #[garde(range(min = 0, max = 100))]
        pub button_radius: Option<i32>,
        #[serde(alias = "inputRadius")]
        #[garde(range(min = 0, max = 100))]
        pub input_radius: Option<i32>,
        #[serde(alias = "cardRadius")]
        #[garde(range(min = 0, max = 100))]
        pub card_radius: Option<i32>,
        #[serde(alias = "navbarHeight")]
        #[garde(range(min = 32, max = 200))]
        pub navbar_height: Option<i32>,
        #[serde(alias = "sidebarItemGap")]
        #[garde(range(min = 0, max = 100))]
        pub sidebar_item_gap: Option<i32>,
        #[serde(alias = "sidebarAnimation")]
        #[garde(skip)]
        pub sidebar_animation: Option<bool>,
        #[serde(alias = "backgroundImage")]
        #[garde(skip)]
        pub background_image: Option<compact_str::CompactString>,
        #[serde(alias = "sidebarBlur")]
        #[garde(range(min = 0, max = 50))]
        pub sidebar_blur: Option<i32>,
        #[serde(alias = "wallpaperBlur")]
        #[garde(range(min = 0, max = 50))]
        pub wallpaper_blur: Option<i32>,
        #[serde(alias = "wallpaperBrightness")]
        #[garde(range(min = 0.0, max = 1.0))]
        pub wallpaper_brightness: Option<f32>,
        #[serde(alias = "glassTransparency")]
        #[garde(range(min = 0, max = 100))]
        pub glass_transparency: Option<i32>,
        #[serde(alias = "editorColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub editor_color: Option<compact_str::CompactString>,
        #[serde(alias = "editorTextColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub editor_text_color: Option<compact_str::CompactString>,
        #[serde(alias = "listingColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub listing_color: Option<compact_str::CompactString>,
        #[serde(alias = "buttonColor")]
        #[garde(length(chars, min = 4, max = 30))]
        pub button_color: Option<compact_str::CompactString>,
    }

    #[utoipa::path(
        put,
        path = "/settings",
        responses(
            (status = OK),
        ),
        request_body = inline(Payload),
    )]
    pub async fn route(
        state: GetState,
        permissions: GetPermissionManager,
        shared::Payload(data): shared::Payload<Payload>,
    ) -> ApiResponseResult {
        if let Err(errors) = shared::utils::validate_data(&data) {
            return ApiResponse::new_serialized(shared::ApiError::new_strings_value(errors))
                .with_status(axum::http::StatusCode::BAD_REQUEST)
                .ok();
        }

        permissions.has_admin_permission("extensions.qunix.theme.write")?;

        let mut settings = state.settings.get_mut().await?;
        let ext_settings: &mut QunixThemeSettingsData = settings.find_mut_extension_settings()?;

        if let Some(bg) = data.background_color {
            ext_settings.background_color = bg;
        }
        if let Some(text) = data.text_color {
            ext_settings.text_color = text;
        }
        if let Some(focus) = data.focus_color {
            ext_settings.focus_color = focus;
        }
        if let Some(shadow) = data.shadow_opacity {
            ext_settings.shadow_opacity = shadow;
        }
        if let Some(font) = data.font_family {
            ext_settings.font_family = font;
        }
        if let Some(sidebar) = data.sidebar_color {
            ext_settings.sidebar_color = sidebar;
        }
        if let Some(card) = data.card_color {
            ext_settings.card_color = card;
        }
        if let Some(border) = data.border_color {
            ext_settings.border_color = border;
        }
        if let Some(radius) = data.border_radius {
            ext_settings.border_radius = radius;
        }
        if let Some(navbar) = data.navbar_color {
            ext_settings.navbar_color = navbar;
        }
        if let Some(terminal) = data.terminal_color {
            ext_settings.terminal_color = terminal;
        }
        if let Some(terminal_text) = data.terminal_text_color {
            ext_settings.terminal_text_color = terminal_text;
        }
        if let Some(input) = data.input_color {
            ext_settings.input_color = input;
        }
        if let Some(b_radius) = data.button_radius {
            ext_settings.button_radius = b_radius;
        }
        if let Some(i_radius) = data.input_radius {
            ext_settings.input_radius = i_radius;
        }
        if let Some(c_radius) = data.card_radius {
            ext_settings.card_radius = c_radius;
        }
        if let Some(height) = data.navbar_height {
            ext_settings.navbar_height = height;
        }
        if let Some(gap) = data.sidebar_item_gap {
            ext_settings.sidebar_item_gap = gap;
        }
        if let Some(animation) = data.sidebar_animation {
            ext_settings.sidebar_animation = animation;
        }
        if let Some(image) = data.background_image {
            ext_settings.background_image = Some(image);
        }
        if let Some(blur) = data.sidebar_blur {
            ext_settings.sidebar_blur = blur;
        }
        if let Some(w_blur) = data.wallpaper_blur {
            ext_settings.wallpaper_blur = w_blur;
        }
        if let Some(w_brightness) = data.wallpaper_brightness {
            ext_settings.wallpaper_brightness = w_brightness;
        }
        if let Some(g_transparency) = data.glass_transparency {
            ext_settings.glass_transparency = g_transparency;
        }
        if let Some(e_color) = data.editor_color {
            ext_settings.editor_color = e_color;
        }
        if let Some(e_text) = data.editor_text_color {
            ext_settings.editor_text_color = e_text;
        }
        if let Some(l_color) = data.listing_color {
            ext_settings.listing_color = l_color;
        }
        if let Some(b_color) = data.button_color {
            ext_settings.button_color = b_color;
        }

        settings.save().await?;

        ApiResponse::new_serialized(()).ok()
    }
}

pub fn router(state: &State) -> OpenApiRouter<State> {
    OpenApiRouter::new()
        .routes(routes!(get::route))
        .routes(routes!(put::route))
        .with_state(state.clone())
}
