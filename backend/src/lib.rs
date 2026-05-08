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
        tracing::info!("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        tracing::info!("QUNIX_THEME EXTENSION INITIALIZED SUCCESSFULLY");
        tracing::info!("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
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
}
