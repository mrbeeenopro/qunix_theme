use shared::{
    State,
    extensions::{Extension, ExtensionRouteBuilder},
};
use std::sync::Arc;

mod routes;
mod settings;

#[derive(Default)]
pub struct ExtensionStruct;

#[async_trait::async_trait]
impl Extension for ExtensionStruct {
    async fn initialize(&mut self, _state: State) {
        let dev_key = &*routes::public::settings::DEV_API_KEY;
        println!(
            "\x1b[38;2;108;92;247m\n\
  ██████╗ ██╗   ██╗███╗   ██╗██╗██╗  ██╗\n\
  ██╔═══██╗██║   ██║████╗  ██║██║╚██╗██╔╝\n\
  ██║   ██║██║   ██║██╔██╗ ██║██║ ╚███╔╝ \n\
  ██║▄▄ ██║██║   ██║██║╚██╗██║██║ ██╔██╗ \n\
  ╚██████╔╝╚██████╔╝██║ ╚████║██║██╔╝ ██╗\n\
   ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝\n\
   Theme  v1.4.7  —  Calagopus Panel\n\
  \x1b[38;2;162;155;254m© 2026 Mrbeenopro · mrbeenopro.com · github.com/mrbeenopro/qunix_theme\x1b[0m\n\
  \x1b[38;2;46;213;115m🔑 [DEV API KEY]: {}\x1b[0m\n",
            dev_key
        );
        tracing::info!("QUNIX_THEME v1.4.7 Loaded - Dev API Key: {}", dev_key);
    }

    async fn settings_deserializer(
        &self,
        _state: State,
    ) -> shared::extensions::settings::ExtensionSettingsDeserializer {
        Arc::new(settings::QunixThemeSettingsDataDeserializer)
    }

    async fn initialize_router(
        &mut self,
        state: State,
        builder: ExtensionRouteBuilder,
    ) -> ExtensionRouteBuilder {
        builder
            .add_admin_api_router(|routes| {
                routes.nest("/extensions/dev.qunix.theme", routes::admin::router(&state))
            })
            .add_global_router(|routes| {
                routes.nest("/api/dev.qunix.theme", routes::public::router(&state))
            })
    }

    async fn initialize_permissions(
        &mut self,
        _state: State,
        builder: shared::extensions::ExtensionPermissionsBuilder,
    ) -> shared::extensions::ExtensionPermissionsBuilder {
        builder
            .add_admin_permission_group(
                "qunix-theme",
                shared::permissions::PermissionGroup {
                    description: "Permissions for Qunix Theme customization and settings.",
                    permissions: indexmap::IndexMap::from([
                        ("read", "Allows viewing Qunix Theme settings."),
                        ("update", "Allows updating Qunix Theme settings."),
                    ]),
                },
            )
            .add_user_permission_group(
                "qunix-theme",
                shared::permissions::PermissionGroup {
                    description: "Permissions for user-level Qunix Theme customization.",
                    permissions: indexmap::IndexMap::from([
                        ("read", "Allows reading Qunix Theme settings."),
                        ("update", "Allows updating Qunix Theme settings."),
                    ]),
                },
            )
    }
}
