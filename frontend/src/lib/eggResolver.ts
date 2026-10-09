/**
 * Utility to resolve custom egg banners and egg avatar images for all server cards across Qunix theme
 */

// Curated list of popular game and software egg avatar icons (1:1 aspect ratio)
const GAME_EGG_ICONS: Record<string, string> = {
  // Minecraft & variants
  minecraft: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  paper: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  spigot: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  purpur: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  forge: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  fabric: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  bedrock: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  bungeecord: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  velocity: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  mohist: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  leaves: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  folia: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  sponge: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',
  vanilla: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png',

  // Survival & FPS
  rust: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/rust.png',
  'counter-strike': 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/counter-strike-global-offensive.png',
  csgo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/counter-strike-global-offensive.png',
  cs2: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/counter-strike-global-offensive.png',
  ark: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/ark-survival-evolved.png',
  terraria: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/terraria.png',
  tshock: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/terraria.png',
  valheim: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/valheim.png',
  palworld: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/palworld.png',
  fivem: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/fivem.png',
  gta: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/fivem.png',
  factorio: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/factorio.png',
  '7 days to die': 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/7-days-to-die.png',
  '7dtd': 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/7-days-to-die.png',
  zomboid: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/project-zomboid.png',
  garry: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/garrys-mod.png',
  gmod: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/garrys-mod.png',
  'team fortress': 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/team-fortress-2.png',
  tf2: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/team-fortress-2.png',
  unturned: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/unturned.png',
  'left 4 dead': 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/left-4-dead.png',
  l4d: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/left-4-dead.png',
  satisfactory: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/satisfactory.png',
  forest: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/the-forest.png',
  enshrouded: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/enshrouded.png',

  // Apps & Generic
  node: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/nodejs.png',
  javascript: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/nodejs.png',
  python: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/python.png',
  discord: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/discord.png',
  redbot: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/discord.png',
  teamspeak: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/teamspeak.png',
  ts3: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/teamspeak.png',
  mumble: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/mumble.png',
  redis: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/redis.png',
  mariadb: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/mariadb.png',
  mysql: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/mysql.png',
  postgres: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/postgresql.png',
  mongodb: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/mongodb.png',
  golang: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/go.png',
  java: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/java.png',

  // OS & Virtualization
  debian: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/linux.png',
  ubuntu: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/linux.png',
  linux: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/linux.png',
  qemu: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/qemu.png',
  vps: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/linux.png',
  vm: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/qemu.png',
};

// Curated wide hero banners for background styling
const GAME_HERO_BANNERS: Record<string, string> = {
  // Minecraft & variants
  minecraft: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  paper: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  spigot: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  purpur: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  forge: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  fabric: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  bedrock: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  bungeecord: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  velocity: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  mohist: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  leaves: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  folia: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  sponge: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',
  vanilla: 'https://xgamingserver.com/img/game-images/minecraft-hero.webp',

  // Survival & FPS
  rust: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
  'counter-strike': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
  csgo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
  cs2: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
  fivem: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  gta: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  ark: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
  terraria: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
  valheim: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
  palworld: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',

  // OS & Virtualization & Servers
  debian: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&auto=format&fit=crop&q=80',
  ubuntu: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&auto=format&fit=crop&q=80',
  linux: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&auto=format&fit=crop&q=80',
  qemu: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
  vps: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
  vm: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',

  // Apps, Bots & Generic
  node: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
  python: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
  discord: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=1200&auto=format&fit=crop&q=80',
  bot: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=1200&auto=format&fit=crop&q=80',
};

export function getCustomEggBanner(server: any, settings?: any): string | null {
  let currentSettings = settings || (typeof window !== 'undefined' && (window as any).qunixThemeSettings);
  if (!currentSettings && typeof window !== 'undefined') {
    try {
      currentSettings = JSON.parse(localStorage.getItem('qunix_theme_settings') || '{}');
    } catch (_) {}
  }
  if (!server || !currentSettings) return null;
  const eggBanners = currentSettings.egg_banners || currentSettings.eggBanners || {};
  if (!eggBanners || typeof eggBanners !== 'object') return null;

  const egg = server.egg;
  const nest = server.nest;
  const eggUuid = (egg?.uuid || server.eggUuid || server.egg_uuid || '').toLowerCase();
  const eggName = (egg?.name || '').toLowerCase();
  const serverName = (server.name || '').toLowerCase();

  // 1. Direct and normalized key checks
  const directMatches = [
    egg?.uuid,
    eggUuid,
    server.eggUuid,
    server.egg_uuid,
    server.eggId,
    server.egg_id,
    egg?.name,
    eggName,
    egg?.id,
    nest?.uuid,
    nest?.uuid?.toLowerCase(),
    nest?.name,
    nest?.name?.toLowerCase(),
    egg?.nestUuid,
    egg?.nest_uuid,
    server.name,
    serverName,
  ].filter(Boolean);

  for (const key of directMatches) {
    if (eggBanners[key] && typeof eggBanners[key] === 'string' && eggBanners[key].trim()) {
      return eggBanners[key].trim();
    }
  }

  // 2. Case-insensitive and partial match across all configured banners
  for (const [key, val] of Object.entries(eggBanners)) {
    if (!val || typeof val !== 'string' || !val.trim()) continue;
    const lowerKey = key.trim().toLowerCase();
    if (eggUuid && lowerKey === eggUuid) return val.trim();
    if (eggName && (lowerKey === eggName || eggName.includes(lowerKey) || lowerKey.includes(eggName))) {
      return val.trim();
    }
    if (serverName && (lowerKey === serverName || serverName.includes(lowerKey))) {
      return val.trim();
    }
  }

  return null;
}

export function getEggImageUrl(server: any, settings?: any): string | null {
  if (!server) return null;

  // 1. Priority: User custom configured banner/image in theme settings
  const custom = getCustomEggBanner(server, settings);
  if (custom) return custom;

  // 2. Curated game/software icons based on egg name, nest name, or server name
  const eggName = (server.egg?.name || '').toLowerCase();
  const nestName = (server.nest?.name || '').toLowerCase();
  const serverName = (server.name || '').toLowerCase();
  const combined = `${eggName} ${nestName} ${serverName}`;

  for (const [keyword, iconUrl] of Object.entries(GAME_EGG_ICONS)) {
    if (combined.includes(keyword)) {
      return iconUrl;
    }
  }

  return null;
}

export function getBannerUrl(server: any, settings?: any): string | null {
  if (!server) return null;

  // 1. Priority: User custom configured banner/image in theme settings
  const custom = getCustomEggBanner(server, settings);
  if (custom) return custom;

  // 2. Curated hero banners for background card effects
  const eggName = (server.egg?.name || '').toLowerCase();
  const nestName = (server.nest?.name || '').toLowerCase();
  const serverName = (server.name || '').toLowerCase();
  const combined = `${eggName} ${nestName} ${serverName}`;

  for (const [keyword, bannerUrl] of Object.entries(GAME_HERO_BANNERS)) {
    if (combined.includes(keyword)) {
      return bannerUrl;
    }
  }

  // 3. Fallback to egg icon avatar so custom egg images or curated icons are used as background banners
  const eggIcon = getEggImageUrl(server, settings);
  if (eggIcon) {
    return eggIcon;
  }

  return null;
}
