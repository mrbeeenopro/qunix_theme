use serde::{Deserialize, Serialize};
use shared::extensions::settings::{
    ExtensionSettings, SettingsDeserializeExt, SettingsDeserializer, SettingsSerializeExt,
    SettingsSerializer,
};
use utoipa::ToSchema;

#[derive(ToSchema, Serialize, Deserialize, Clone)]
pub struct QunixThemeSettingsData {
    pub background_color: compact_str::CompactString,
    pub text_color: compact_str::CompactString,
    pub focus_color: compact_str::CompactString,
    pub shadow_opacity: f32,
    pub font_family: compact_str::CompactString,
    pub sidebar_color: compact_str::CompactString,
    pub card_color: compact_str::CompactString,
    pub border_color: compact_str::CompactString,
    pub border_radius: i32,
    pub navbar_color: compact_str::CompactString,
    pub terminal_color: compact_str::CompactString,
    pub terminal_text_color: compact_str::CompactString,
    pub input_color: compact_str::CompactString,
    pub button_radius: i32,
    pub input_radius: i32,
    pub card_radius: i32,
    pub navbar_height: i32,
    pub sidebar_item_gap: i32,
    pub sidebar_animation: bool,
    pub background_image: Option<compact_str::CompactString>,
    pub sidebar_blur: i32,
    pub wallpaper_blur: i32,
    pub wallpaper_brightness: f32,
    pub glass_transparency: i32,
    pub editor_color: compact_str::CompactString,
    pub editor_text_color: compact_str::CompactString,
    pub listing_color: compact_str::CompactString,
    pub button_color: compact_str::CompactString,
    pub server_action_bg: compact_str::CompactString,
    pub power_start_bg: compact_str::CompactString,
    pub power_restart_bg: compact_str::CompactString,
    pub power_stop_bg: compact_str::CompactString,
    pub sidebar_active_color: compact_str::CompactString,
    pub sidebar_active_bg: compact_str::CompactString,
    pub sidebar_item_height: i32,
    pub terminal_cursor_color: compact_str::CompactString,
    pub terminal_selection_color: compact_str::CompactString,
    pub terminal_ansi_black: compact_str::CompactString,
    pub terminal_ansi_red: compact_str::CompactString,
    pub terminal_ansi_green: compact_str::CompactString,
    pub terminal_ansi_yellow: compact_str::CompactString,
    pub terminal_ansi_blue: compact_str::CompactString,
    pub terminal_ansi_magenta: compact_str::CompactString,
    pub terminal_ansi_cyan: compact_str::CompactString,
    pub terminal_ansi_white: compact_str::CompactString,
    #[serde(default)]
    pub egg_banners: std::collections::HashMap<compact_str::CompactString, compact_str::CompactString>,

    // Light Theme Settings
    pub light_background_color: compact_str::CompactString,
    pub light_text_color: compact_str::CompactString,
    pub light_focus_color: compact_str::CompactString,
    pub light_shadow_opacity: f32,
    pub light_sidebar_color: compact_str::CompactString,
    pub light_card_color: compact_str::CompactString,
    pub light_border_color: compact_str::CompactString,
    pub light_navbar_color: compact_str::CompactString,
    pub light_terminal_color: compact_str::CompactString,
    pub light_terminal_text_color: compact_str::CompactString,
    pub light_input_color: compact_str::CompactString,
    pub light_background_image: Option<compact_str::CompactString>,
    pub light_editor_color: compact_str::CompactString,
    pub light_editor_text_color: compact_str::CompactString,
    pub light_listing_color: compact_str::CompactString,
    pub light_button_color: compact_str::CompactString,
    pub light_server_action_bg: compact_str::CompactString,
    pub light_power_start_bg: compact_str::CompactString,
    pub light_power_restart_bg: compact_str::CompactString,
    pub light_power_stop_bg: compact_str::CompactString,
    pub light_sidebar_active_color: compact_str::CompactString,
    pub light_sidebar_active_bg: compact_str::CompactString,
    pub light_terminal_cursor_color: compact_str::CompactString,
    pub light_terminal_selection_color: compact_str::CompactString,
    pub light_terminal_ansi_black: compact_str::CompactString,
    pub light_terminal_ansi_red: compact_str::CompactString,
    pub light_terminal_ansi_green: compact_str::CompactString,
    pub light_terminal_ansi_yellow: compact_str::CompactString,
    pub light_terminal_ansi_blue: compact_str::CompactString,
    pub light_terminal_ansi_magenta: compact_str::CompactString,
    pub light_terminal_ansi_cyan: compact_str::CompactString,
    pub light_terminal_ansi_white: compact_str::CompactString,
}

impl Default for QunixThemeSettingsData {
    fn default() -> Self {
        Self {
            background_color: "#120b1fff".into(), 
            text_color: "#e2e8f0".into(), 
            focus_color: "hsla(263, 85%, 60%, 1.00)".into(), 
            shadow_opacity: 0.25,
            font_family: "JetBrains Mono".into(),
            sidebar_color: "#1a1329ff".into(), 
            card_color: "#1e1631ff".into(), 
            border_color: "rgba(156, 136, 255, 0.15)".into(), 
            border_radius: 20, 
            navbar_color: "#161025ff".into(),
            terminal_color: "#1a1b26ff".into(),
            terminal_text_color: "#a9b1d6ff".into(),   
            input_color: "#251b3aff".into(),
            button_radius: 20,
            input_radius: 8,
            card_radius: 12,
            navbar_height: 64,
            sidebar_item_gap: 6,
            sidebar_animation: true,
            background_image: None,
            sidebar_blur: 0,
            wallpaper_blur: 0,
            wallpaper_brightness: 1.0,
            glass_transparency: 20,
            editor_color: "#0f081aff".into(),
            editor_text_color: "#e2e8f0ff".into(),
            listing_color: "#1e1631ff".into(),
            button_color: "#6c5ce7ff".into(), 
            server_action_bg: "#0a0a0a".into(),
            power_start_bg: "#40c057".into(),
            power_restart_bg: "#868e96".into(),
            power_stop_bg: "#fa5252".into(),
            sidebar_active_color: "#6c5ce7ff".into(),
            sidebar_active_bg: "rgba(255, 255, 255, 0.05)".into(),
            sidebar_item_height: 36,
            terminal_cursor_color: "#7aa2f7".into(),
            terminal_selection_color: "rgba(255, 255, 255, 0.15)".into(),
            terminal_ansi_black: "#15161e".into(),
            terminal_ansi_red: "#f7768e".into(),
            terminal_ansi_green: "#9ece6a".into(),
            terminal_ansi_yellow: "#e0af68".into(),
            terminal_ansi_blue: "#7aa2f7".into(),
            terminal_ansi_magenta: "#bb9af7".into(),
            terminal_ansi_cyan: "#7dcfff".into(),
            terminal_ansi_white: "#a9b1d6".into(),
            egg_banners: std::collections::HashMap::new(),

            // Light Mode Defaults
            light_background_color: "#f3effaff".into(), 
            light_text_color: "#1e1631ff".into(), 
            light_focus_color: "hsla(263, 85%, 60%, 1.00)".into(), 
            light_shadow_opacity: 0.08,
            light_sidebar_color: "#ffffffff".into(), 
            light_card_color: "#ffffffff".into(), 
            light_border_color: "rgba(108, 92, 231, 0.15)".into(), 
            light_navbar_color: "#ffffffff".into(),
            light_terminal_color: "#f1f2f6ff".into(),
            light_terminal_text_color: "#2f3542ff".into(),   
            light_input_color: "#f1f2f6ff".into(),
            light_background_image: None,
            light_editor_color: "#ffffffff".into(),
            light_editor_text_color: "#2f3542ff".into(),
            light_listing_color: "#ffffffff".into(),
            light_button_color: "#6c5ce7ff".into(), 
            light_server_action_bg: "#f1f2f6ff".into(),
            light_power_start_bg: "#2ed573ff".into(),
            light_power_restart_bg: "#747d8cff".into(),
            light_power_stop_bg: "#ff4757ff".into(),
            light_sidebar_active_color: "#6c5ce7ff".into(),
            light_sidebar_active_bg: "rgba(108, 92, 231, 0.1)".into(),
            light_terminal_cursor_color: "#6c5ce7ff".into(),
            light_terminal_selection_color: "rgba(108, 92, 231, 0.3)".into(),
            light_terminal_ansi_black: "#d5d6db".into(),
            light_terminal_ansi_red: "#f7768e".into(),
            light_terminal_ansi_green: "#485e30".into(),
            light_terminal_ansi_yellow: "#8f5e15".into(),
            light_terminal_ansi_blue: "#34548a".into(),
            light_terminal_ansi_magenta: "#5a4a78".into(),
            light_terminal_ansi_cyan: "#0f4b6e".into(),
            light_terminal_ansi_white: "#343b58".into(),
        }
    }
}

#[async_trait::async_trait]
impl SettingsSerializeExt for QunixThemeSettingsData {
    async fn serialize(
        &self,
        serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error> {
        let serializer = serializer
            .write_raw_setting("background_color", self.background_color.clone())
            .write_raw_setting("text_color", self.text_color.clone())
            .write_raw_setting("focus_color", self.focus_color.clone())
            .write_raw_setting("shadow_opacity", self.shadow_opacity.to_string())
            .write_raw_setting("font_family", self.font_family.clone())
            .write_raw_setting("sidebar_color", self.sidebar_color.clone())
            .write_raw_setting("card_color", self.card_color.clone())
            .write_raw_setting("border_color", self.border_color.clone())
            .write_raw_setting("border_radius", self.border_radius.to_string())
            .write_raw_setting("navbar_color", self.navbar_color.clone())
            .write_raw_setting("terminal_color", self.terminal_color.clone())
            .write_raw_setting("terminal_text_color", self.terminal_text_color.clone())
            .write_raw_setting("input_color", self.input_color.clone())
            .write_raw_setting("button_radius", self.button_radius.to_string())
            .write_raw_setting("input_radius", self.input_radius.to_string())
            .write_raw_setting("card_radius", self.card_radius.to_string())
            .write_raw_setting("navbar_height", self.navbar_height.to_string())
            .write_raw_setting("sidebar_item_gap", self.sidebar_item_gap.to_string())
            .write_raw_setting("sidebar_animation", self.sidebar_animation.to_string())
            .write_raw_setting(
                "background_image",
                self.background_image
                    .clone()
                    .unwrap_or_default()
                    .to_string(),
            )
            .write_raw_setting("sidebar_blur", self.sidebar_blur.to_string())
            .write_raw_setting("wallpaper_blur", self.wallpaper_blur.to_string())
            .write_raw_setting("wallpaper_brightness", self.wallpaper_brightness.to_string())
            .write_raw_setting("glass_transparency", self.glass_transparency.to_string())
            .write_raw_setting("editor_color", self.editor_color.clone())
            .write_raw_setting("editor_text_color", self.editor_text_color.clone())
            .write_raw_setting("listing_color", self.listing_color.clone())
            .write_raw_setting("button_color", self.button_color.clone())
            .write_raw_setting("server_action_bg", self.server_action_bg.clone())
            .write_raw_setting("power_start_bg", self.power_start_bg.clone())
            .write_raw_setting("power_restart_bg", self.power_restart_bg.clone())
            .write_raw_setting("power_stop_bg", self.power_stop_bg.clone())
            .write_raw_setting("sidebar_active_color", self.sidebar_active_color.clone())
            .write_raw_setting("sidebar_active_bg", self.sidebar_active_bg.clone())
            .write_raw_setting("sidebar_item_height", self.sidebar_item_height.to_string())
            .write_raw_setting("terminal_cursor_color", self.terminal_cursor_color.clone())
            .write_raw_setting("terminal_selection_color", self.terminal_selection_color.clone())
            .write_raw_setting("terminal_ansi_black", self.terminal_ansi_black.clone())
            .write_raw_setting("terminal_ansi_red", self.terminal_ansi_red.clone())
            .write_raw_setting("terminal_ansi_green", self.terminal_ansi_green.clone())
            .write_raw_setting("terminal_ansi_yellow", self.terminal_ansi_yellow.clone())
            .write_raw_setting("terminal_ansi_blue", self.terminal_ansi_blue.clone())
            .write_raw_setting("terminal_ansi_magenta", self.terminal_ansi_magenta.clone())
            .write_raw_setting("terminal_ansi_cyan", self.terminal_ansi_cyan.clone())
            .write_raw_setting("terminal_ansi_white", self.terminal_ansi_white.clone())
            
            // Light Mode Serialization
            .write_raw_setting("light_background_color", self.light_background_color.clone())
            .write_raw_setting("light_text_color", self.light_text_color.clone())
            .write_raw_setting("light_focus_color", self.light_focus_color.clone())
            .write_raw_setting("light_shadow_opacity", self.light_shadow_opacity.to_string())
            .write_raw_setting("light_sidebar_color", self.light_sidebar_color.clone())
            .write_raw_setting("light_card_color", self.light_card_color.clone())
            .write_raw_setting("light_border_color", self.light_border_color.clone())
            .write_raw_setting("light_navbar_color", self.light_navbar_color.clone())
            .write_raw_setting("light_terminal_color", self.light_terminal_color.clone())
            .write_raw_setting("light_terminal_text_color", self.light_terminal_text_color.clone())
            .write_raw_setting("light_input_color", self.light_input_color.clone())
            .write_raw_setting(
                "light_background_image",
                self.light_background_image
                    .clone()
                    .unwrap_or_default()
                    .to_string(),
            )
            .write_raw_setting("light_editor_color", self.light_editor_color.clone())
            .write_raw_setting("light_editor_text_color", self.light_editor_text_color.clone())
            .write_raw_setting("light_listing_color", self.light_listing_color.clone())
            .write_raw_setting("light_button_color", self.light_button_color.clone())
            .write_raw_setting("light_server_action_bg", self.light_server_action_bg.clone())
            .write_raw_setting("light_power_start_bg", self.light_power_start_bg.clone())
            .write_raw_setting("light_power_restart_bg", self.light_power_restart_bg.clone())
            .write_raw_setting("light_power_stop_bg", self.light_power_stop_bg.clone())
            .write_raw_setting("light_sidebar_active_color", self.light_sidebar_active_color.clone())
            .write_raw_setting("light_sidebar_active_bg", self.light_sidebar_active_bg.clone())
            .write_raw_setting("light_terminal_cursor_color", self.light_terminal_cursor_color.clone())
            .write_raw_setting("light_terminal_selection_color", self.light_terminal_selection_color.clone())
            .write_raw_setting("light_terminal_ansi_black", self.light_terminal_ansi_black.clone())
            .write_raw_setting("light_terminal_ansi_red", self.light_terminal_ansi_red.clone())
            .write_raw_setting("light_terminal_ansi_green", self.light_terminal_ansi_green.clone())
            .write_raw_setting("light_terminal_ansi_yellow", self.light_terminal_ansi_yellow.clone())
            .write_raw_setting("light_terminal_ansi_blue", self.light_terminal_ansi_blue.clone())
            .write_raw_setting("light_terminal_ansi_magenta", self.light_terminal_ansi_magenta.clone())
            .write_raw_setting("light_terminal_ansi_cyan", self.light_terminal_ansi_cyan.clone())
            .write_raw_setting("light_terminal_ansi_white", self.light_terminal_ansi_white.clone());

        let serializer = serializer
            .write_serde_setting("egg_banners", &self.egg_banners)
            .map_err(|e| anyhow::anyhow!("Failed to serialize egg_banners: {}", e))?;

        Ok(serializer)
    }
}

pub struct QunixThemeSettingsDataDeserializer;

#[async_trait::async_trait]
impl SettingsDeserializeExt for QunixThemeSettingsDataDeserializer {
    async fn deserialize_boxed(
        &self,
        mut deserializer: SettingsDeserializer<'_>,
    ) -> Result<ExtensionSettings, anyhow::Error> {
        let default = QunixThemeSettingsData::default();
        let background_color = deserializer
            .take_raw_setting("background_color")
            .unwrap_or(default.background_color);

        tracing::info!(
            "QUNIX_THEME: Deserialized background_color: {}",
            background_color
        );

        Ok(Box::new(QunixThemeSettingsData {
            background_color,
            text_color: deserializer
                .take_raw_setting("text_color")
                .unwrap_or(default.text_color),
            focus_color: deserializer
                .take_raw_setting("focus_color")
                .unwrap_or(default.focus_color),
            shadow_opacity: deserializer
                .take_raw_setting("shadow_opacity")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.shadow_opacity),
            font_family: deserializer
                .take_raw_setting("font_family")
                .unwrap_or(default.font_family),
            sidebar_color: deserializer
                .take_raw_setting("sidebar_color")
                .unwrap_or(default.sidebar_color),
            card_color: deserializer
                .take_raw_setting("card_color")
                .unwrap_or(default.card_color),
            border_color: deserializer
                .take_raw_setting("border_color")
                .unwrap_or(default.border_color),
            border_radius: deserializer
                .take_raw_setting("border_radius")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.border_radius),
            navbar_color: deserializer
                .take_raw_setting("navbar_color")
                .unwrap_or(default.navbar_color),
            terminal_color: deserializer
                .take_raw_setting("terminal_color")
                .unwrap_or(default.terminal_color),
            terminal_text_color: deserializer
                .take_raw_setting("terminal_text_color")
                .unwrap_or(default.terminal_text_color),
            input_color: deserializer
                .take_raw_setting("input_color")
                .unwrap_or(default.input_color),
            button_radius: deserializer
                .take_raw_setting("button_radius")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.button_radius),
            input_radius: deserializer
                .take_raw_setting("input_radius")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.input_radius),
            card_radius: deserializer
                .take_raw_setting("card_radius")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.card_radius),
            navbar_height: deserializer
                .take_raw_setting("navbar_height")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.navbar_height),
            sidebar_item_gap: deserializer
                .take_raw_setting("sidebar_item_gap")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.sidebar_item_gap),
            sidebar_animation: deserializer
                .take_raw_setting("sidebar_animation")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.sidebar_animation),
            background_image: deserializer
                .take_raw_setting("background_image"),
            sidebar_blur: deserializer
                .take_raw_setting("sidebar_blur")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.sidebar_blur),
            wallpaper_blur: deserializer
                .take_raw_setting("wallpaper_blur")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.wallpaper_blur),
            wallpaper_brightness: deserializer
                .take_raw_setting("wallpaper_brightness")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.wallpaper_brightness),
            glass_transparency: deserializer
                .take_raw_setting("glass_transparency")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.glass_transparency),
            editor_color: deserializer
                .take_raw_setting("editor_color")
                .unwrap_or(default.editor_color),
            editor_text_color: deserializer
                .take_raw_setting("editor_text_color")
                .unwrap_or(default.editor_text_color),
            listing_color: deserializer
                .take_raw_setting("listing_color")
                .unwrap_or(default.listing_color),
            button_color: deserializer
                .take_raw_setting("button_color")
                .unwrap_or(default.button_color),
            server_action_bg: deserializer
                .take_raw_setting("server_action_bg")
                .unwrap_or(default.server_action_bg),
            power_start_bg: deserializer
                .take_raw_setting("power_start_bg")
                .unwrap_or(default.power_start_bg),
            power_restart_bg: deserializer
                .take_raw_setting("power_restart_bg")
                .unwrap_or(default.power_restart_bg),
            power_stop_bg: deserializer
                .take_raw_setting("power_stop_bg")
                .unwrap_or(default.power_stop_bg),
            sidebar_active_color: deserializer
                .take_raw_setting("sidebar_active_color")
                .unwrap_or(default.sidebar_active_color),
            sidebar_active_bg: deserializer
                .take_raw_setting("sidebar_active_bg")
                .unwrap_or(default.sidebar_active_bg),
            sidebar_item_height: deserializer
                .take_raw_setting("sidebar_item_height")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.sidebar_item_height),
            terminal_cursor_color: deserializer
                .take_raw_setting("terminal_cursor_color")
                .unwrap_or(default.terminal_cursor_color),
            terminal_selection_color: deserializer
                .take_raw_setting("terminal_selection_color")
                .unwrap_or(default.terminal_selection_color),
            terminal_ansi_black: deserializer
                .take_raw_setting("terminal_ansi_black")
                .unwrap_or(default.terminal_ansi_black),
            terminal_ansi_red: deserializer
                .take_raw_setting("terminal_ansi_red")
                .unwrap_or(default.terminal_ansi_red),
            terminal_ansi_green: deserializer
                .take_raw_setting("terminal_ansi_green")
                .unwrap_or(default.terminal_ansi_green),
            terminal_ansi_yellow: deserializer
                .take_raw_setting("terminal_ansi_yellow")
                .unwrap_or(default.terminal_ansi_yellow),
            terminal_ansi_blue: deserializer
                .take_raw_setting("terminal_ansi_blue")
                .unwrap_or(default.terminal_ansi_blue),
            terminal_ansi_magenta: deserializer
                .take_raw_setting("terminal_ansi_magenta")
                .unwrap_or(default.terminal_ansi_magenta),
            terminal_ansi_cyan: deserializer
                .take_raw_setting("terminal_ansi_cyan")
                .unwrap_or(default.terminal_ansi_cyan),
            terminal_ansi_white: deserializer
                .take_raw_setting("terminal_ansi_white")
                .unwrap_or(default.terminal_ansi_white),
            egg_banners: deserializer
                .read_serde_setting("egg_banners")
                .unwrap_or_else(|_| default.egg_banners),

            // Light Mode Deserialization
            light_background_color: deserializer
                .take_raw_setting("light_background_color")
                .unwrap_or(default.light_background_color),
            light_text_color: deserializer
                .take_raw_setting("light_text_color")
                .unwrap_or(default.light_text_color),
            light_focus_color: deserializer
                .take_raw_setting("light_focus_color")
                .unwrap_or(default.light_focus_color),
            light_shadow_opacity: deserializer
                .take_raw_setting("light_shadow_opacity")
                .and_then(|s| s.parse().ok())
                .unwrap_or(default.light_shadow_opacity),
            light_sidebar_color: deserializer
                .take_raw_setting("light_sidebar_color")
                .unwrap_or(default.light_sidebar_color),
            light_card_color: deserializer
                .take_raw_setting("light_card_color")
                .unwrap_or(default.light_card_color),
            light_border_color: deserializer
                .take_raw_setting("light_border_color")
                .unwrap_or(default.light_border_color),
            light_navbar_color: deserializer
                .take_raw_setting("light_navbar_color")
                .unwrap_or(default.light_navbar_color),
            light_terminal_color: deserializer
                .take_raw_setting("light_terminal_color")
                .unwrap_or(default.light_terminal_color),
            light_terminal_text_color: deserializer
                .take_raw_setting("light_terminal_text_color")
                .unwrap_or(default.light_terminal_text_color),
            light_input_color: deserializer
                .take_raw_setting("light_input_color")
                .unwrap_or(default.light_input_color),
            light_background_image: deserializer
                .take_raw_setting("light_background_image"),
            light_editor_color: deserializer
                .take_raw_setting("light_editor_color")
                .unwrap_or(default.light_editor_color),
            light_editor_text_color: deserializer
                .take_raw_setting("light_editor_text_color")
                .unwrap_or(default.light_editor_text_color),
            light_listing_color: deserializer
                .take_raw_setting("light_listing_color")
                .unwrap_or(default.light_listing_color),
            light_button_color: deserializer
                .take_raw_setting("light_button_color")
                .unwrap_or(default.light_button_color),
            light_server_action_bg: deserializer
                .take_raw_setting("light_server_action_bg")
                .unwrap_or(default.light_server_action_bg),
            light_power_start_bg: deserializer
                .take_raw_setting("light_power_start_bg")
                .unwrap_or(default.light_power_start_bg),
            light_power_restart_bg: deserializer
                .take_raw_setting("light_power_restart_bg")
                .unwrap_or(default.light_power_restart_bg),
            light_power_stop_bg: deserializer
                .take_raw_setting("light_power_stop_bg")
                .unwrap_or(default.light_power_stop_bg),
            light_sidebar_active_color: deserializer
                .take_raw_setting("light_sidebar_active_color")
                .unwrap_or(default.light_sidebar_active_color),
            light_sidebar_active_bg: deserializer
                .take_raw_setting("light_sidebar_active_bg")
                .unwrap_or(default.light_sidebar_active_bg),
            light_terminal_cursor_color: deserializer
                .take_raw_setting("light_terminal_cursor_color")
                .unwrap_or(default.light_terminal_cursor_color),
            light_terminal_selection_color: deserializer
                .take_raw_setting("light_terminal_selection_color")
                .unwrap_or(default.light_terminal_selection_color),
            light_terminal_ansi_black: deserializer
                .take_raw_setting("light_terminal_ansi_black")
                .unwrap_or(default.light_terminal_ansi_black),
            light_terminal_ansi_red: deserializer
                .take_raw_setting("light_terminal_ansi_red")
                .unwrap_or(default.light_terminal_ansi_red),
            light_terminal_ansi_green: deserializer
                .take_raw_setting("light_terminal_ansi_green")
                .unwrap_or(default.light_terminal_ansi_green),
            light_terminal_ansi_yellow: deserializer
                .take_raw_setting("light_terminal_ansi_yellow")
                .unwrap_or(default.light_terminal_ansi_yellow),
            light_terminal_ansi_blue: deserializer
                .take_raw_setting("light_terminal_ansi_blue")
                .unwrap_or(default.light_terminal_ansi_blue),
            light_terminal_ansi_magenta: deserializer
                .take_raw_setting("light_terminal_ansi_magenta")
                .unwrap_or(default.light_terminal_ansi_magenta),
            light_terminal_ansi_cyan: deserializer
                .take_raw_setting("light_terminal_ansi_cyan")
                .unwrap_or(default.light_terminal_ansi_cyan),
            light_terminal_ansi_white: deserializer
                .take_raw_setting("light_terminal_ansi_white")
                .unwrap_or(default.light_terminal_ansi_white),
        }))
    }
}