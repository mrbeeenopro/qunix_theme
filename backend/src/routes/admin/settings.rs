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
        #[garde(length(chars, min = 4, max = 100))]
        pub background_color: Option<compact_str::CompactString>,
        #[serde(alias = "textColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub text_color: Option<compact_str::CompactString>,
        #[serde(alias = "focusColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub focus_color: Option<compact_str::CompactString>,
        #[serde(alias = "shadowOpacity")]
        #[garde(range(min = 0.0, max = 1.0))]
        pub shadow_opacity: Option<f32>,
        #[serde(alias = "fontFamily")]
        #[garde(length(chars, min = 1, max = 100))]
        pub font_family: Option<compact_str::CompactString>,
        #[serde(alias = "sidebarColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub sidebar_color: Option<compact_str::CompactString>,
        #[serde(alias = "cardColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub card_color: Option<compact_str::CompactString>,
        #[serde(alias = "borderColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub border_color: Option<compact_str::CompactString>,
        #[serde(alias = "borderRadius")]
        #[garde(range(min = 0, max = 100))]
        pub border_radius: Option<i32>,
        #[serde(alias = "navbarColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub navbar_color: Option<compact_str::CompactString>,
        #[serde(alias = "terminalColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub terminal_color: Option<compact_str::CompactString>,
        #[serde(alias = "terminalTextColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub terminal_text_color: Option<compact_str::CompactString>,
        #[serde(alias = "inputColor")]
        #[garde(length(chars, min = 4, max = 100))]
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
        #[garde(length(chars, min = 4, max = 100))]
        pub editor_color: Option<compact_str::CompactString>,
        #[serde(alias = "editorTextColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub editor_text_color: Option<compact_str::CompactString>,
        #[serde(alias = "listingColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub listing_color: Option<compact_str::CompactString>,
        #[serde(alias = "buttonColor")]
        #[garde(length(chars, min = 4, max = 100))]
        pub button_color: Option<compact_str::CompactString>,
        #[serde(alias = "serverActionBg", alias = "serverActionColor", alias = "server_action_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub server_action_bg: Option<compact_str::CompactString>,
        #[serde(alias = "powerStartBg", alias = "power_start_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub power_start_bg: Option<compact_str::CompactString>,
        #[serde(alias = "powerRestartBg", alias = "power_restart_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub power_restart_bg: Option<compact_str::CompactString>,
        #[serde(alias = "powerStopBg", alias = "power_stop_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub power_stop_bg: Option<compact_str::CompactString>,
        #[serde(alias = "sidebarActiveColor", alias = "sidebar_active_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub sidebar_active_color: Option<compact_str::CompactString>,
        #[serde(alias = "sidebarActiveBg", alias = "sidebar_active_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub sidebar_active_bg: Option<compact_str::CompactString>,
        #[serde(alias = "sidebarItemHeight", alias = "sidebar_active_height")]
        #[garde(range(min = 20, max = 100))]
        pub sidebar_item_height: Option<i32>,
        #[serde(alias = "eggBanners")]
        #[garde(skip)]
        pub egg_banners: Option<std::collections::HashMap<compact_str::CompactString, compact_str::CompactString>>,

        // Light Mode Payload Fields
        #[serde(alias = "lightBackgroundColor", alias = "light_background_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_background_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightTextColor", alias = "light_text_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_text_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightFocusColor", alias = "light_focus_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_focus_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightShadowOpacity", alias = "light_shadow_opacity")]
        #[garde(range(min = 0.0, max = 1.0))]
        pub light_shadow_opacity: Option<f32>,
        #[serde(alias = "lightSidebarColor", alias = "light_sidebar_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_sidebar_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightCardColor", alias = "light_card_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_card_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightBorderColor", alias = "light_border_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_border_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightNavbarColor", alias = "light_navbar_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_navbar_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightTerminalColor", alias = "light_terminal_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_terminal_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightTerminalTextColor", alias = "light_terminal_text_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_terminal_text_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightInputColor", alias = "light_input_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_input_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightBackgroundImage", alias = "light_background_image")]
        #[garde(skip)]
        pub light_background_image: Option<compact_str::CompactString>,
        #[serde(alias = "lightEditorColor", alias = "light_editor_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_editor_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightEditorTextColor", alias = "light_editor_text_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_editor_text_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightListingColor", alias = "light_listing_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_listing_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightButtonColor", alias = "light_button_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_button_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightServerActionBg", alias = "light_server_action_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_server_action_bg: Option<compact_str::CompactString>,
        #[serde(alias = "lightPowerStartBg", alias = "light_power_start_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_power_start_bg: Option<compact_str::CompactString>,
        #[serde(alias = "lightPowerRestartBg", alias = "light_power_restart_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_power_restart_bg: Option<compact_str::CompactString>,
        #[serde(alias = "lightPowerStopBg", alias = "light_power_stop_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_power_stop_bg: Option<compact_str::CompactString>,
        #[serde(alias = "lightSidebarActiveColor", alias = "light_sidebar_active_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_sidebar_active_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightSidebarActiveBg", alias = "light_sidebar_active_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_sidebar_active_bg: Option<compact_str::CompactString>,

        #[serde(alias = "announcementBg", alias = "announcement_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub announcement_bg: Option<compact_str::CompactString>,
        #[serde(alias = "lightAnnouncementBg", alias = "light_announcement_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_announcement_bg: Option<compact_str::CompactString>,
        #[serde(alias = "announcementBlur", alias = "announcement_blur")]
        #[garde(range(min = 0, max = 100))]
        pub announcement_blur: Option<i32>,
        #[serde(alias = "announcementBorderColor", alias = "announcement_border_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub announcement_border_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightAnnouncementBorderColor", alias = "light_announcement_border_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_announcement_border_color: Option<compact_str::CompactString>,
        #[serde(alias = "announcementRadius", alias = "announcement_radius")]
        #[garde(range(min = 0, max = 100))]
        pub announcement_radius: Option<i32>,
        #[serde(alias = "announcementCta", alias = "announcement_cta")]
        #[garde(skip)]
        pub announcement_cta: Option<bool>,
        #[serde(alias = "announcementCtaBg", alias = "announcement_cta_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub announcement_cta_bg: Option<compact_str::CompactString>,
        #[serde(alias = "lightAnnouncementCtaBg", alias = "light_announcement_cta_bg")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_announcement_cta_bg: Option<compact_str::CompactString>,
        #[serde(alias = "announcementCtaColor", alias = "announcement_cta_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub announcement_cta_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightAnnouncementCtaColor", alias = "light_announcement_cta_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_announcement_cta_color: Option<compact_str::CompactString>,
        #[serde(alias = "announcementCtaRadius", alias = "announcement_cta_radius")]
        #[garde(range(min = 0, max = 100))]
        pub announcement_cta_radius: Option<i32>,
        #[serde(alias = "announcementCtaLink", alias = "announcement_cta_link")]
        #[garde(skip)]
        pub announcement_cta_link: Option<compact_str::CompactString>,
        #[serde(alias = "announcementCtaText", alias = "announcement_cta_text")]
        #[garde(skip)]
        pub announcement_cta_text: Option<compact_str::CompactString>,
        #[serde(alias = "toastStyle", alias = "toast_style")]
        #[garde(length(chars, min = 4, max = 100))]
        pub toast_style: Option<compact_str::CompactString>,
        #[serde(alias = "toastTimer", alias = "toast_timer")]
        #[garde(skip)]
        pub toast_timer: Option<bool>,
        #[serde(alias = "toastRadius", alias = "toast_radius")]
        #[garde(range(min = 0, max = 100))]
        pub toast_radius: Option<i32>,
        #[serde(alias = "toastColoredBorder", alias = "toast_colored_border")]
        #[garde(skip)]
        pub toast_colored_border: Option<bool>,
        #[serde(alias = "toastBackgroundTint", alias = "toast_background_tint")]
        #[garde(skip)]
        pub toast_background_tint: Option<bool>,
        #[serde(alias = "dark7Color", alias = "dark_7_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub dark_7_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightDark7Color", alias = "light_dark_7_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_dark_7_color: Option<compact_str::CompactString>,
        #[serde(alias = "dark6Color", alias = "dark_6_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub dark_6_color: Option<compact_str::CompactString>,
        #[serde(alias = "lightDark6Color", alias = "light_dark_6_color")]
        #[garde(length(chars, min = 4, max = 100))]
        pub light_dark_6_color: Option<compact_str::CompactString>,
        #[serde(alias = "listingRadius", alias = "listing_radius")]
        #[garde(range(min = 0, max = 100))]
        pub listing_radius: Option<i32>,
        #[serde(alias = "checkboxRadius", alias = "checkbox_radius")]
        #[garde(range(min = 0, max = 100))]
        pub checkbox_radius: Option<i32>,
        #[serde(alias = "sidebarHoverStyle", alias = "sidebar_hover_style")]
        #[garde(length(chars, min = 1, max = 50))]
        pub sidebar_hover_style: Option<compact_str::CompactString>,
        #[serde(alias = "sidebarWidth", alias = "sidebar_width")]
        #[garde(range(min = 150, max = 400))]
        pub sidebar_width: Option<i32>,
        #[serde(alias = "sidebarRadius", alias = "sidebar_radius")]
        #[garde(range(min = 0, max = 50))]
        pub sidebar_radius: Option<i32>,
        #[serde(alias = "sidebarActiveRadius", alias = "sidebar_active_radius")]
        #[garde(range(min = 0, max = 50))]
        pub sidebar_active_radius: Option<i32>,
        #[serde(alias = "pageTitleIcon", alias = "page_title_icon")]
        #[garde(skip)]
        pub page_title_icon: Option<bool>,
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
        if let Some(sa_bg) = data.server_action_bg {
            ext_settings.server_action_bg = sa_bg;
        }
        if let Some(start_bg) = data.power_start_bg {
            ext_settings.power_start_bg = start_bg;
        }
        if let Some(restart_bg) = data.power_restart_bg {
            ext_settings.power_restart_bg = restart_bg;
        }
        if let Some(stop_bg) = data.power_stop_bg {
            ext_settings.power_stop_bg = stop_bg;
        }
        if let Some(sac) = data.sidebar_active_color {
            ext_settings.sidebar_active_color = sac;
        }
        if let Some(sab) = data.sidebar_active_bg {
            ext_settings.sidebar_active_bg = sab;
        }
        if let Some(height) = data.sidebar_item_height {
            ext_settings.sidebar_item_height = height;
        }
        if let Some(egg_banners) = data.egg_banners {
            ext_settings.egg_banners = egg_banners;
        }

        // Light Mode Assignments
        if let Some(light_bg) = data.light_background_color {
            ext_settings.light_background_color = light_bg;
        }
        if let Some(light_text) = data.light_text_color {
            ext_settings.light_text_color = light_text;
        }
        if let Some(light_focus) = data.light_focus_color {
            ext_settings.light_focus_color = light_focus;
        }
        if let Some(light_shadow) = data.light_shadow_opacity {
            ext_settings.light_shadow_opacity = light_shadow;
        }
        if let Some(light_sidebar) = data.light_sidebar_color {
            ext_settings.light_sidebar_color = light_sidebar;
        }
        if let Some(light_card) = data.light_card_color {
            ext_settings.light_card_color = light_card;
        }
        if let Some(light_border) = data.light_border_color {
            ext_settings.light_border_color = light_border;
        }
        if let Some(light_navbar) = data.light_navbar_color {
            ext_settings.light_navbar_color = light_navbar;
        }
        if let Some(light_terminal) = data.light_terminal_color {
            ext_settings.light_terminal_color = light_terminal;
        }
        if let Some(light_terminal_text) = data.light_terminal_text_color {
            ext_settings.light_terminal_text_color = light_terminal_text;
        }
        if let Some(light_input) = data.light_input_color {
            ext_settings.light_input_color = light_input;
        }
        if let Some(light_image) = data.light_background_image {
            ext_settings.light_background_image = Some(light_image);
        }
        if let Some(light_editor) = data.light_editor_color {
            ext_settings.light_editor_color = light_editor;
        }
        if let Some(light_e_text) = data.light_editor_text_color {
            ext_settings.light_editor_text_color = light_e_text;
        }
        if let Some(light_l_color) = data.light_listing_color {
            ext_settings.light_listing_color = light_l_color;
        }
        if let Some(light_b_color) = data.light_button_color {
            ext_settings.light_button_color = light_b_color;
        }
        if let Some(light_sa_bg) = data.light_server_action_bg {
            ext_settings.light_server_action_bg = light_sa_bg;
        }
        if let Some(light_start_bg) = data.light_power_start_bg {
            ext_settings.light_power_start_bg = light_start_bg;
        }
        if let Some(light_restart_bg) = data.light_power_restart_bg {
            ext_settings.light_power_restart_bg = light_restart_bg;
        }
        if let Some(light_stop_bg) = data.light_power_stop_bg {
            ext_settings.light_power_stop_bg = light_stop_bg;
        }
        if let Some(light_sac) = data.light_sidebar_active_color {
            ext_settings.light_sidebar_active_color = light_sac;
        }
        if let Some(light_sab) = data.light_sidebar_active_bg {
            ext_settings.light_sidebar_active_bg = light_sab;
        }

        if let Some(ann_bg) = data.announcement_bg {
            ext_settings.announcement_bg = ann_bg;
        }
        if let Some(light_ann_bg) = data.light_announcement_bg {
            ext_settings.light_announcement_bg = light_ann_bg;
        }
        if let Some(ann_blur) = data.announcement_blur {
            ext_settings.announcement_blur = ann_blur;
        }
        if let Some(ann_border) = data.announcement_border_color {
            ext_settings.announcement_border_color = ann_border;
        }
        if let Some(light_ann_border) = data.light_announcement_border_color {
            ext_settings.light_announcement_border_color = light_ann_border;
        }
        if let Some(ann_radius) = data.announcement_radius {
            ext_settings.announcement_radius = ann_radius;
        }
        if let Some(cta_enabled) = data.announcement_cta {
            ext_settings.announcement_cta = cta_enabled;
        }
        if let Some(cta_bg) = data.announcement_cta_bg {
            ext_settings.announcement_cta_bg = cta_bg;
        }
        if let Some(light_cta_bg) = data.light_announcement_cta_bg {
            ext_settings.light_announcement_cta_bg = light_cta_bg;
        }
        if let Some(cta_color) = data.announcement_cta_color {
            ext_settings.announcement_cta_color = cta_color;
        }
        if let Some(light_cta_color) = data.light_announcement_cta_color {
            ext_settings.light_announcement_cta_color = light_cta_color;
        }
        if let Some(cta_radius) = data.announcement_cta_radius {
            ext_settings.announcement_cta_radius = cta_radius;
        }
        if let Some(cta_link) = data.announcement_cta_link {
            ext_settings.announcement_cta_link = cta_link;
        }
        if let Some(cta_text) = data.announcement_cta_text {
            ext_settings.announcement_cta_text = cta_text;
        }
        if let Some(t_style) = data.toast_style {
            ext_settings.toast_style = t_style;
        }
        if let Some(t_timer) = data.toast_timer {
            ext_settings.toast_timer = t_timer;
        }
        if let Some(t_radius) = data.toast_radius {
            ext_settings.toast_radius = t_radius;
        }
        if let Some(t_colored_border) = data.toast_colored_border {
            ext_settings.toast_colored_border = t_colored_border;
        }
        if let Some(t_background_tint) = data.toast_background_tint {
            ext_settings.toast_background_tint = t_background_tint;
        }
        if let Some(d7) = data.dark_7_color {
            ext_settings.dark_7_color = d7;
        }
        if let Some(ld7) = data.light_dark_7_color {
            ext_settings.light_dark_7_color = ld7;
        }
        if let Some(d6) = data.dark_6_color {
            ext_settings.dark_6_color = d6;
        }
        if let Some(ld6) = data.light_dark_6_color {
            ext_settings.light_dark_6_color = ld6;
        }
        if let Some(list_rad) = data.listing_radius {
            ext_settings.listing_radius = list_rad;
        }
        if let Some(chk_rad) = data.checkbox_radius {
            ext_settings.checkbox_radius = chk_rad;
        }
        if let Some(hover_style) = data.sidebar_hover_style {
            ext_settings.sidebar_hover_style = hover_style;
        }
        if let Some(sb_w) = data.sidebar_width {
            ext_settings.sidebar_width = sb_w;
        }
        if let Some(sb_r) = data.sidebar_radius {
            ext_settings.sidebar_radius = sb_r;
        }
        if let Some(sb_ar) = data.sidebar_active_radius {
            ext_settings.sidebar_active_radius = sb_ar;
        }
        if let Some(pti) = data.page_title_icon {
            ext_settings.page_title_icon = pti;
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
