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
        }
    }
}

#[async_trait::async_trait]
impl SettingsSerializeExt for QunixThemeSettingsData {
    async fn serialize(
        &self,
        serializer: SettingsSerializer,
    ) -> Result<SettingsSerializer, anyhow::Error> {
        Ok(serializer
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
            .write_raw_setting("button_color", self.button_color.clone()))
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
        }))
    }
}