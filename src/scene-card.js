/*
 * Scene Card for Home Assistant
 * https://github.com/juju35/ha-scene-card
 *
 * Lovelace cards to launch scenes and scripts: a grid of scenes (of Home Assistant, Hue, deCONZ, LIFX, SmartThings,
 * Tuya, Overkiz, KNX… any scene entity) with the active one highlighted, and scripts with their running state and
 * a stop button. Scenes and scripts can be picked one by one, or by area: the card then follows what is added to it.
 */

const VERSION = "__VERSION__";

const CARD_ICONS = {
  palette:
    "M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.88,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z",
  script: "M17.8,20C17.4,21.2 16.3,22 15,22H5C3.3,22 2,20.7 2,19V18H5L14.2,18C14.6,19.2 15.7,20 17,20H17.8M19,2C20.7,2 22,3.3 22,5V6H20V5C20,4.4 19.6,4 19,4C18.4,4 18,4.4 18,5V18H17C16.4,18 16,17.6 16,17V16H5V5C5,3.3 6.3,2 8,2H19M8,6V8H15V6H8M8,10V12H14V10H8Z",
  film: "M18,4L20,8H17L15,4H13L15,8H12L10,4H8L10,8H7L5,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V4H18Z",
  dinner: "M8.1,13.34L3.91,9.16C2.35,7.59 2.35,5.06 3.91,3.5L10.93,10.5L8.1,13.34M13.41,13L20.29,19.88L18.88,21.29L12,14.41L5.12,21.29L3.71,19.88L13.36,10.22L13.16,10C12.38,9.23 12.38,7.97 13.16,7.19L17.5,2.82L18.43,3.74L15.19,7L16.15,7.94L19.39,4.69L20.31,5.61L17.06,8.85L18,9.81L21.26,6.56L22.18,7.5L17.81,11.84C17.03,12.62 15.77,12.62 15,11.84L14.78,11.64L13.41,13Z",
  book: "M18,22A2,2 0 0,0 20,20V4C20,2.89 19.1,2 18,2H12V9L9.5,7.5L7,9V2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18Z",
  sun: "M3.55,18.54L4.96,19.95L6.76,18.16L5.34,16.74M11,22.45C11.32,22.45 13,22.45 13,22.45V19.5H11M12,5.5A6,6 0 0,0 6,11.5A6,6 0 0,0 12,17.5A6,6 0 0,0 18,11.5C18,8.18 15.31,5.5 12,5.5M20,12.5H23V10.5H20M17.24,18.16L19.04,19.95L20.45,18.54L18.66,16.74M20.45,4.46L19.04,3.05L17.24,4.84L18.66,6.26M13,0.55H11V3.5H13M4,10.5H1V12.5H4M6.76,4.84L4.96,3.05L3.55,4.46L5.34,6.26L6.76,4.84Z",
  moon: "M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95Z",
  away: "M14.08,15.59L16.67,13H7V11H16.67L14.08,8.41L15.5,7L20.5,12L15.5,17L14.08,15.59M19,3A2,2 0 0,1 21,5V9.67L19,7.67V5H5V19H19V16.33L21,14.33V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19Z",
  sofa: "M21,9V7C21,5.35 19.65,4 18,4H14C13.23,4 12.53,4.3 12,4.78C11.47,4.3 10.77,4 10,4H6C4.35,4 3,5.35 3,7V9C1.35,9 0,10.35 0,12V17C0,18.65 1.35,20 3,20V22H5V20H19V22H21V20C22.65,20 24,18.65 24,17V12C24,10.35 22.65,9 21,9M14,6H18C18.55,6 19,6.45 19,7V9.78C18.39,10.33 18,11.12 18,12V14H13V7C13,6.45 13.45,6 14,6M5,7C5,6.45 5.45,6 6,6H10C10.55,6 11,6.45 11,7V14H6V12C6,11.12 5.61,10.33 5,9.78V7Z",
  party: "M7,7C7,8.66 8.34,10 10,10C11.66,10 13,8.66 13,7C13,5.34 11.66,4 10,4C8.34,4 7,5.34 7,7M22,2L18,6L19,7L23,3L22,2M17,1L16,2L17,5L18,4L17,1M21,7L20,8L23,9L24,8L21,7M2,22L5,12L12,19L2,22Z",
  work: "M4,6H20V16H4M20,18A2,2 0 0,0 22,16V6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V16A2,2 0 0,0 4,18H0V20H24V18H20Z",
  bright: "M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z",
  power: "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",
  shutter: "M3,4H21V8H19V20H17V8H7V20H5V8H3V4M8,9H16V11H8V9M8,12H16V14H8V12M8,15H16V17H8V15M8,18H16V20H8V18Z",
  bed: "M19,7H11V14H3V5H1V20H3V17H21V20H23V11A4,4 0 0,0 19,7M7,13A3,3 0 0,0 10,10A3,3 0 0,0 7,7A3,3 0 0,0 4,10A3,3 0 0,0 7,13Z",
  bulb: "M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z",
  marker: "M12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5M12,2A7,7 0 0,1 19,9C19,14.25 12,22 12,22C12,22 5,14.25 5,9A7,7 0 0,1 12,2M12,4A5,5 0 0,0 7,9C7,10 7,12 12,18.71C17,12 17,10 17,9A5,5 0 0,0 12,4Z",
  music: "M21,3V15.5A3.5,3.5 0 0,1 17.5,19A3.5,3.5 0 0,1 14,15.5A3.5,3.5 0 0,1 17.5,12C18.04,12 18.55,12.12 19,12.34V6.47L9,8.6V17.5A3.5,3.5 0 0,1 5.5,21A3.5,3.5 0 0,1 2,17.5A3.5,3.5 0 0,1 5.5,14C6.04,14 6.55,14.12 7,14.34V6L21,3Z",
};

// An icon for a scene or script from its name, in English or French (and a few other languages): film for a movie
// scene, cutlery for dinner… the palette (scenes) or the script icon otherwise.
const KEYWORDS = [
  [/cin[eé]|movie|film|tv|t[eé]l[eé]|kino/i, "film"],
  [/read|lect|lire|book|livre/i, "book"],
  [/\bdin|d[iî]ner|repas|meal|lunch|d[eé]jeuner|essen/i, "dinner"],
  [/wake|r[eé]veil|morning|matin|sunrise|aube/i, "sun"],
  [/night|nuit|sleep|dodo/i, "moon"],
  [/bed|coucher|lit\b/i, "bed"],
  [/away|absent|leav|d[eé]part|sortie|exit/i, "away"],
  [/relax|d[eé]tente|chill|cosy|cozy|calme/i, "sofa"],
  [/party|f[eê]te|soir[eé]e/i, "party"],
  [/work|travail|bureau|office|focus|concentr/i, "work"],
  [/bright|lumineux|clair|vif|energ/i, "bright"],
  [/\boff\b|[eé]teindre|tout [eé]teint/i, "power"],
  [/shutter|volet|blind|store|rideau|curtain/i, "shutter"],
  [/music|musique|son|audio/i, "music"],
];
const iconFor = (name, fallback) => (KEYWORDS.find(([re]) => re.test(name || "")) || [null, fallback])[1];
// A scene counts as still active while none of its entities changed this long after it was activated.
const SETTLE_MS = 10e3;
// How long the ripple of a scene just launched lasts.
const FIRE_MS = 900;

const STRINGS = {
  en: {
    scenes: "Scenes",
    scripts: "Scripts",
    areas: "Areas",
    all: "All",
    active: "Active",
    active_scene: "{name} active",
    no_active: "No active scene",
    running: "Running",
    running_n: "{n} running",
    last_run: "Last run {when}",
    never: "Never",
    never_run: "Never run",
    run: "Run",
    nothing_here: "Nothing in this area.",
    no_data: "Nothing to show: no scene or script found.",
    scenes_field: "Scenes (empty: all)",
    scripts_field: "Scripts (empty: all)",
    area: "Areas (only their scenes and scripts)",
    show_scenes: "Show the scenes",
    show_scripts: "Show the scripts",
    show_area_filter: "Show the area filter",
    show_last: "Show when last activated",
    mini_count: "Scene buttons on the mini card",
    stop: "Stop",
    activated: "Activated {when}",
    lights_on: "Lights on: {n}",
    show_hero: "Show the active scene",
    cancel: "Cancel",
    left: "{time} left",
    today_at: "today {time}",
    tomorrow_at: "tomorrow {time}",
    yesterday_at: "yesterday {time}",
    zoom_in: "Show details",
    zoom_out: "Show less",
    title: "Title (optional)",
    language: "Language",
    lang_auto: "Automatic",
    collapsed: "Sections folded by default",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card's content",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    unavailable: "Unavailable",
  },
  fr: {
    scenes: "Scènes",
    scripts: "Scripts",
    areas: "Pièces",
    all: "Toutes",
    active: "Active",
    active_scene: "{name} active",
    no_active: "Aucune scène active",
    running: "En cours",
    running_n: "{n} en cours",
    last_run: "Lancé {when}",
    never: "Jamais",
    never_run: "Jamais lancé",
    run: "Lancer",
    nothing_here: "Rien dans cette pièce.",
    no_data: "Rien à afficher : aucune scène ni script trouvé.",
    scenes_field: "Scènes (vide : toutes)",
    scripts_field: "Scripts (vide : tous)",
    area: "Pièces (seulement leurs scènes et scripts)",
    show_scenes: "Afficher les scènes",
    show_scripts: "Afficher les scripts",
    show_area_filter: "Afficher le filtre par pièce",
    show_last: "Afficher la dernière activation",
    mini_count: "Boutons de scène de la mini-carte",
    stop: "Arrêter",
    activated: "Activée {when}",
    lights_on: "Lumières allumées : {n}",
    show_hero: "Afficher la scène active",
    cancel: "Annuler",
    left: "{time} restantes",
    today_at: "aujourd'hui {time}",
    tomorrow_at: "demain {time}",
    yesterday_at: "hier {time}",
    zoom_in: "Afficher les détails",
    zoom_out: "Réduire",
    title: "Titre (facultatif)",
    language: "Langue",
    lang_auto: "Automatique",
    collapsed: "Sections repliées par défaut",
    zoom: "Bouton détail",
    zoom_helper: "Bascule la mini-carte vers le contenu de la carte complète",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    unavailable: "Indisponible",
  },
  de: {
    scenes: "Szenen",
    scripts: "Skripte",
    areas: "Bereiche",
    all: "Alle",
    active: "Aktiv",
    active_scene: "{name} aktiv",
    no_active: "Keine Szene aktiv",
    running: "Läuft",
    running_n: "{n} laufen",
    last_run: "Zuletzt {when}",
    never: "Nie",
    never_run: "Nie ausgeführt",
    run: "Ausführen",
    nothing_here: "Nichts in diesem Bereich.",
    no_data: "Nichts anzuzeigen: keine Szene oder kein Skript gefunden.",
    scenes_field: "Szenen (leer: alle)",
    scripts_field: "Skripte (leer: alle)",
    area: "Bereiche (nur ihre Szenen und Skripte)",
    show_scenes: "Szenen anzeigen",
    show_scripts: "Skripte anzeigen",
    show_area_filter: "Bereichsfilter anzeigen",
    show_last: "Letzte Aktivierung anzeigen",
    mini_count: "Szenen-Schaltflächen der Mini-Karte",
    stop: "Stoppen",
    activated: "Aktiviert {when}",
    lights_on: "Lichter an: {n}",
    show_hero: "Aktive Szene anzeigen",
    cancel: "Abbrechen",
    left: "Noch {time}",
    today_at: "heute {time}",
    tomorrow_at: "morgen {time}",
    yesterday_at: "gestern {time}",
    zoom_in: "Details anzeigen",
    zoom_out: "Weniger anzeigen",
    title: "Titel (optional)",
    language: "Sprache",
    lang_auto: "Automatisch",
    collapsed: "Standardmäßig eingeklappte Bereiche",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Schaltet die Mini-Karte auf den Inhalt der vollen Karte um",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    no_registry: "Diese Karte benötigt Home Assistant 2024.8 oder neuer.",
    unavailable: "Nicht verfügbar",
  },
  es: {
    scenes: "Escenas",
    scripts: "Scripts",
    areas: "Áreas",
    all: "Todas",
    active: "Activa",
    active_scene: "{name} activa",
    no_active: "Ninguna escena activa",
    running: "En curso",
    running_n: "{n} en curso",
    last_run: "Última vez {when}",
    never: "Nunca",
    never_run: "Nunca ejecutado",
    run: "Ejecutar",
    nothing_here: "Nada en esta área.",
    no_data: "Nada que mostrar: no se encontró ninguna escena ni script.",
    scenes_field: "Escenas (vacío: todas)",
    scripts_field: "Scripts (vacío: todos)",
    area: "Áreas (solo sus escenas y scripts)",
    show_scenes: "Mostrar las escenas",
    show_scripts: "Mostrar los scripts",
    show_area_filter: "Mostrar el filtro por área",
    show_last: "Mostrar la última activación",
    mini_count: "Botones de escena de la mini tarjeta",
    stop: "Detener",
    activated: "Activada {when}",
    lights_on: "Luces encendidas: {n}",
    show_hero: "Mostrar la escena activa",
    cancel: "Cancelar",
    left: "Quedan {time}",
    today_at: "hoy {time}",
    tomorrow_at: "mañana {time}",
    yesterday_at: "ayer {time}",
    zoom_in: "Ver detalles",
    zoom_out: "Ver menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secciones plegadas por defecto",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la minitarjeta al contenido de la tarjeta completa",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Esta tarjeta necesita Home Assistant 2024.8 o posterior.",
    unavailable: "No disponible",
  },
  it: {
    scenes: "Scene",
    scripts: "Script",
    areas: "Aree",
    all: "Tutte",
    active: "Attiva",
    active_scene: "{name} attiva",
    no_active: "Nessuna scena attiva",
    running: "In corso",
    running_n: "{n} in corso",
    last_run: "Ultima volta {when}",
    never: "Mai",
    never_run: "Mai eseguito",
    run: "Esegui",
    nothing_here: "Niente in quest'area.",
    no_data: "Niente da mostrare: nessuna scena o script trovato.",
    scenes_field: "Scene (vuoto: tutte)",
    scripts_field: "Script (vuoto: tutti)",
    area: "Aree (solo le loro scene e script)",
    show_scenes: "Mostra le scene",
    show_scripts: "Mostra gli script",
    show_area_filter: "Mostra il filtro per area",
    show_last: "Mostra l'ultima attivazione",
    mini_count: "Pulsanti scena della mini scheda",
    stop: "Ferma",
    activated: "Attivata {when}",
    lights_on: "Luci accese: {n}",
    show_hero: "Mostra la scena attiva",
    cancel: "Annulla",
    left: "{time} rimanenti",
    today_at: "oggi {time}",
    tomorrow_at: "domani {time}",
    yesterday_at: "ieri {time}",
    zoom_in: "Mostra dettagli",
    zoom_out: "Mostra meno",
    title: "Titolo (facoltativo)",
    language: "Lingua",
    lang_auto: "Automatica",
    collapsed: "Sezioni chiuse per impostazione predefinita",
    zoom: "Pulsante dettagli",
    zoom_helper: "Passa la mini scheda al contenuto della scheda completa",
    show_title: "Mostra titolo",
    show_subtitle: "Mostra sottotitolo",
    no_registry: "Questa scheda richiede Home Assistant 2024.8 o successivo.",
    unavailable: "Non disponibile",
  },
  nl: {
    scenes: "Scènes",
    scripts: "Scripts",
    areas: "Ruimtes",
    all: "Alle",
    active: "Actief",
    active_scene: "{name} actief",
    no_active: "Geen scène actief",
    running: "Bezig",
    running_n: "{n} bezig",
    last_run: "Laatst {when}",
    never: "Nooit",
    never_run: "Nooit uitgevoerd",
    run: "Uitvoeren",
    nothing_here: "Niets in deze ruimte.",
    no_data: "Niets te tonen: geen scène of script gevonden.",
    scenes_field: "Scènes (leeg: alle)",
    scripts_field: "Scripts (leeg: alle)",
    area: "Ruimtes (alleen hun scènes en scripts)",
    show_scenes: "Scènes tonen",
    show_scripts: "Scripts tonen",
    show_area_filter: "Ruimtefilter tonen",
    show_last: "Laatste activering tonen",
    mini_count: "Scèneknoppen van de mini-kaart",
    stop: "Stoppen",
    activated: "Geactiveerd {when}",
    lights_on: "Lampen aan: {n}",
    show_hero: "Actieve scène tonen",
    cancel: "Annuleren",
    left: "Nog {time}",
    today_at: "vandaag {time}",
    tomorrow_at: "morgen {time}",
    yesterday_at: "gisteren {time}",
    zoom_in: "Details tonen",
    zoom_out: "Minder tonen",
    title: "Titel (optioneel)",
    language: "Taal",
    lang_auto: "Automatisch",
    collapsed: "Standaard ingeklapte secties",
    zoom: "Detailknop",
    zoom_helper: "Schakelt de minikaart naar de inhoud van de volledige kaart",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    no_registry: "Deze kaart vereist Home Assistant 2024.8 of nieuwer.",
    unavailable: "Niet beschikbaar",
  },
  pt: {
    scenes: "Cenas",
    scripts: "Scripts",
    areas: "Áreas",
    all: "Todas",
    active: "Ativa",
    active_scene: "{name} ativa",
    no_active: "Nenhuma cena ativa",
    running: "Em curso",
    running_n: "{n} em curso",
    last_run: "Última vez {when}",
    never: "Nunca",
    never_run: "Nunca executado",
    run: "Executar",
    nothing_here: "Nada nesta área.",
    no_data: "Nada a mostrar: nenhuma cena ou script encontrado.",
    scenes_field: "Cenas (vazio: todas)",
    scripts_field: "Scripts (vazio: todos)",
    area: "Áreas (apenas as suas cenas e scripts)",
    show_scenes: "Mostrar as cenas",
    show_scripts: "Mostrar os scripts",
    show_area_filter: "Mostrar o filtro por área",
    show_last: "Mostrar a última ativação",
    mini_count: "Botões de cena do mini cartão",
    stop: "Parar",
    activated: "Ativada {when}",
    lights_on: "Luzes acesas: {n}",
    show_hero: "Mostrar a cena ativa",
    cancel: "Cancelar",
    left: "Faltam {time}",
    today_at: "hoje {time}",
    tomorrow_at: "amanhã {time}",
    yesterday_at: "ontem {time}",
    zoom_in: "Mostrar detalhes",
    zoom_out: "Mostrar menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secções recolhidas por predefinição",
    zoom: "Botão de detalhe",
    zoom_helper: "Muda o minicartão para o conteúdo do cartão completo",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Este cartão requer o Home Assistant 2024.8 ou posterior.",
    unavailable: "Indisponível",
  },
  pl: {
    scenes: "Sceny",
    scripts: "Skrypty",
    areas: "Obszary",
    all: "Wszystkie",
    active: "Aktywna",
    active_scene: "{name} aktywna",
    no_active: "Brak aktywnej sceny",
    running: "Działa",
    running_n: "Działa: {n}",
    last_run: "Ostatnio {when}",
    never: "Nigdy",
    never_run: "Nigdy nie uruchomiono",
    run: "Uruchom",
    nothing_here: "Nic w tym obszarze.",
    no_data: "Brak danych: nie znaleziono sceny ani skryptu.",
    scenes_field: "Sceny (puste: wszystkie)",
    scripts_field: "Skrypty (puste: wszystkie)",
    area: "Obszary (tylko ich sceny i skrypty)",
    show_scenes: "Pokaż sceny",
    show_scripts: "Pokaż skrypty",
    show_area_filter: "Pokaż filtr obszarów",
    show_last: "Pokaż ostatnią aktywację",
    mini_count: "Przyciski scen mini karty",
    stop: "Stop",
    activated: "Aktywowano {when}",
    lights_on: "Włączone światła: {n}",
    show_hero: "Pokaż aktywną scenę",
    cancel: "Anuluj",
    left: "Pozostało {time}",
    today_at: "dziś {time}",
    tomorrow_at: "jutro {time}",
    yesterday_at: "wczoraj {time}",
    zoom_in: "Pokaż szczegóły",
    zoom_out: "Pokaż mniej",
    title: "Tytuł (opcjonalnie)",
    language: "Język",
    lang_auto: "Automatycznie",
    collapsed: "Sekcje domyślnie zwinięte",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przełącza minikartę na zawartość pełnej karty",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    no_registry: "Ta karta wymaga Home Assistant 2024.8 lub nowszego.",
    unavailable: "Niedostępne",
  },
  sr: {
    scenes: "Сцене",
    scripts: "Скрипте",
    areas: "Просторије",
    all: "Све",
    active: "Активна",
    active_scene: "{name} активна",
    no_active: "Нема активне сцене",
    running: "Ради",
    running_n: "Ради: {n}",
    last_run: "Последњи пут {when}",
    never: "Никад",
    never_run: "Никад покренута",
    run: "Покрени",
    nothing_here: "Ништа у овој просторији.",
    no_data: "Нема шта да се прикаже: није пронађена ниједна сцена ни скрипта.",
    scenes_field: "Сцене (празно: све)",
    scripts_field: "Скрипте (празно: све)",
    area: "Просторије (само њихове сцене и скрипте)",
    show_scenes: "Прикажи сцене",
    show_scripts: "Прикажи скрипте",
    show_area_filter: "Прикажи филтер просторија",
    show_last: "Прикажи последње покретање",
    mini_count: "Дугмад сцена мини картице",
    stop: "Заустави",
    activated: "Активирана {when}",
    lights_on: "Упаљена светла: {n}",
    show_hero: "Прикажи активну сцену",
    cancel: "Откажи",
    left: "Преостало {time}",
    today_at: "данас {time}",
    tomorrow_at: "сутра {time}",
    yesterday_at: "јуче {time}",
    zoom_in: "Прикажи детаље",
    zoom_out: "Прикажи мање",
    title: "Наслов (опционо)",
    language: "Језик",
    lang_auto: "Аутоматски",
    collapsed: "Подразумевано скупљени одељци",
    zoom: "Дугме за детаље",
    zoom_helper: "Пребацује мини картицу на садржај пуне картице",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    no_registry: "Ова картица захтева Home Assistant 2024.8 или новији.",
    unavailable: "Недоступно",
  },
  "sr-Latn": {
    scenes: "Scene",
    scripts: "Skripte",
    areas: "Prostorije",
    all: "Sve",
    active: "Aktivna",
    active_scene: "{name} aktivna",
    no_active: "Nema aktivne scene",
    running: "Radi",
    running_n: "Radi: {n}",
    last_run: "Poslednji put {when}",
    never: "Nikad",
    never_run: "Nikad pokrenuta",
    run: "Pokreni",
    nothing_here: "Ništa u ovoj prostoriji.",
    no_data: "Nema šta da se prikaže: nije pronađena nijedna scena ni skripta.",
    scenes_field: "Scene (prazno: sve)",
    scripts_field: "Skripte (prazno: sve)",
    area: "Prostorije (samo njihove scene i skripte)",
    show_scenes: "Prikaži scene",
    show_scripts: "Prikaži skripte",
    show_area_filter: "Prikaži filter prostorija",
    show_last: "Prikaži poslednje pokretanje",
    mini_count: "Dugmad scena mini kartice",
    stop: "Zaustavi",
    activated: "Aktivirana {when}",
    lights_on: "Upaljena svetla: {n}",
    show_hero: "Prikaži aktivnu scenu",
    cancel: "Otkaži",
    left: "Preostalo {time}",
    today_at: "danas {time}",
    tomorrow_at: "sutra {time}",
    yesterday_at: "juče {time}",
    zoom_in: "Prikaži detalje",
    zoom_out: "Prikaži manje",
    title: "Naslov (opciono)",
    language: "Jezik",
    lang_auto: "Automatski",
    collapsed: "Podrazumevano skupljeni odeljci",
    zoom: "Dugme za detalje",
    zoom_helper: "Prebacuje mini karticu na sadržaj pune kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ova kartica zahteva Home Assistant 2024.8 ili noviji.",
    unavailable: "Nedostupno",
  },
  ro: {
    scenes: "Scene",
    scripts: "Scripturi",
    areas: "Zone",
    all: "Toate",
    active: "Activă",
    active_scene: "{name} activă",
    no_active: "Nicio scenă activă",
    running: "Rulează",
    running_n: "{n} rulează",
    last_run: "Ultima dată {when}",
    never: "Niciodată",
    never_run: "Nerulat niciodată",
    run: "Rulează",
    nothing_here: "Nimic în această zonă.",
    no_data: "Nimic de afișat: nu s-a găsit nicio scenă sau script.",
    scenes_field: "Scene (gol: toate)",
    scripts_field: "Scripturi (gol: toate)",
    area: "Zone (doar scenele și scripturile lor)",
    show_scenes: "Afișează scenele",
    show_scripts: "Afișează scripturile",
    show_area_filter: "Afișează filtrul pe zone",
    show_last: "Afișează ultima activare",
    mini_count: "Butoane de scenă ale mini cardului",
    stop: "Oprește",
    activated: "Activată {when}",
    lights_on: "Lumini aprinse: {n}",
    show_hero: "Afișează scena activă",
    cancel: "Anulează",
    left: "Mai sunt {time}",
    today_at: "azi {time}",
    tomorrow_at: "mâine {time}",
    yesterday_at: "ieri {time}",
    zoom_in: "Arată detalii",
    zoom_out: "Arată mai puțin",
    title: "Titlu (opțional)",
    language: "Limbă",
    lang_auto: "Automat",
    collapsed: "Secțiuni pliate implicit",
    zoom: "Buton de detalii",
    zoom_helper: "Comută mini cardul la conținutul cardului complet",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    no_registry: "Acest card necesită Home Assistant 2024.8 sau mai nou.",
    unavailable: "Indisponibil",
  },
  da: {
    scenes: "Scener",
    scripts: "Scripts",
    areas: "Områder",
    all: "Alle",
    active: "Aktiv",
    active_scene: "{name} aktiv",
    no_active: "Ingen aktiv scene",
    running: "Kører",
    running_n: "{n} kører",
    last_run: "Sidst {when}",
    never: "Aldrig",
    never_run: "Aldrig kørt",
    run: "Kør",
    nothing_here: "Intet i dette område.",
    no_data: "Intet at vise: ingen scene eller script fundet.",
    scenes_field: "Scener (tom: alle)",
    scripts_field: "Scripts (tom: alle)",
    area: "Områder (kun deres scener og scripts)",
    show_scenes: "Vis scenerne",
    show_scripts: "Vis scripts",
    show_area_filter: "Vis områdefilteret",
    show_last: "Vis seneste aktivering",
    mini_count: "Sceneknapper på minikortet",
    stop: "Stop",
    activated: "Aktiveret {when}",
    lights_on: "Tændte lys: {n}",
    show_hero: "Vis den aktive scene",
    cancel: "Annuller",
    left: "{time} tilbage",
    today_at: "i dag {time}",
    tomorrow_at: "i morgen {time}",
    yesterday_at: "i går {time}",
    zoom_in: "Vis detaljer",
    zoom_out: "Vis mindre",
    title: "Titel (valgfri)",
    language: "Sprog",
    lang_auto: "Automatisk",
    collapsed: "Sektioner foldet sammen som standard",
    zoom: "Detaljeknap",
    zoom_helper: "Skifter minikortet til det fulde korts indhold",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    no_registry: "Dette kort kræver Home Assistant 2024.8 eller nyere.",
    unavailable: "Utilgængelig",
  },
  sv: {
    scenes: "Scener",
    scripts: "Skript",
    areas: "Områden",
    all: "Alla",
    active: "Aktiv",
    active_scene: "{name} aktiv",
    no_active: "Ingen aktiv scen",
    running: "Körs",
    running_n: "{n} körs",
    last_run: "Senast {when}",
    never: "Aldrig",
    never_run: "Aldrig kört",
    run: "Kör",
    nothing_here: "Inget i detta område.",
    no_data: "Inget att visa: ingen scen eller skript hittades.",
    scenes_field: "Scener (tomt: alla)",
    scripts_field: "Skript (tomt: alla)",
    area: "Områden (bara deras scener och skript)",
    show_scenes: "Visa scenerna",
    show_scripts: "Visa skripten",
    show_area_filter: "Visa områdesfiltret",
    show_last: "Visa senaste aktivering",
    mini_count: "Scenknappar på minikortet",
    stop: "Stoppa",
    activated: "Aktiverad {when}",
    lights_on: "Tända lampor: {n}",
    show_hero: "Visa den aktiva scenen",
    cancel: "Avbryt",
    left: "{time} kvar",
    today_at: "i dag {time}",
    tomorrow_at: "i morgon {time}",
    yesterday_at: "i går {time}",
    zoom_in: "Visa detaljer",
    zoom_out: "Visa mindre",
    title: "Titel (valfri)",
    language: "Språk",
    lang_auto: "Automatiskt",
    collapsed: "Sektioner hopfällda som standard",
    zoom: "Detaljknapp",
    zoom_helper: "Växlar minikortet till hela kortets innehåll",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    no_registry: "Det här kortet kräver Home Assistant 2024.8 eller senare.",
    unavailable: "Otillgänglig",
  },
  bg: {
    scenes: "Сцени",
    scripts: "Скриптове",
    areas: "Зони",
    all: "Всички",
    active: "Активна",
    active_scene: "{name} активна",
    no_active: "Няма активна сцена",
    running: "Изпълнява се",
    running_n: "Изпълняват се: {n}",
    last_run: "Последно {when}",
    never: "Никога",
    never_run: "Не е стартиран",
    run: "Стартирай",
    nothing_here: "Нищо в тази зона.",
    no_data: "Няма какво да се покаже: не е намерена сцена или скрипт.",
    scenes_field: "Сцени (празно: всички)",
    scripts_field: "Скриптове (празно: всички)",
    area: "Зони (само техните сцени и скриптове)",
    show_scenes: "Показване на сцените",
    show_scripts: "Показване на скриптовете",
    show_area_filter: "Показване на филтъра по зони",
    show_last: "Показване на последното активиране",
    mini_count: "Бутони за сцени на мини картата",
    stop: "Стоп",
    activated: "Активирана {when}",
    lights_on: "Включени светлини: {n}",
    show_hero: "Показване на активната сцена",
    cancel: "Отказ",
    left: "Остават {time}",
    today_at: "днес {time}",
    tomorrow_at: "утре {time}",
    yesterday_at: "вчера {time}",
    zoom_in: "Покажи подробности",
    zoom_out: "Покажи по-малко",
    title: "Заглавие (по избор)",
    language: "Език",
    lang_auto: "Автоматично",
    collapsed: "Сгънати по подразбиране раздели",
    zoom: "Бутон за подробности",
    zoom_helper: "Превключва мини картата към съдържанието на пълната карта",
    show_title: "Покажи заглавие",
    show_subtitle: "Покажи подзаглавие",
    no_registry: "Тази карта изисква Home Assistant 2024.8 или по-нов.",
    unavailable: "Недостъпно",
  },
  ru: {
    scenes: "Сцены",
    scripts: "Скрипты",
    areas: "Пространства",
    all: "Все",
    active: "Активна",
    active_scene: "{name} активна",
    no_active: "Нет активной сцены",
    running: "Выполняется",
    running_n: "Выполняется: {n}",
    last_run: "Последний запуск {when}",
    never: "Никогда",
    never_run: "Не запускался",
    run: "Запустить",
    nothing_here: "В этом пространстве ничего нет.",
    no_data: "Нечего показать: не найдено ни сцен, ни скриптов.",
    scenes_field: "Сцены (пусто: все)",
    scripts_field: "Скрипты (пусто: все)",
    area: "Пространства (только их сцены и скрипты)",
    show_scenes: "Показывать сцены",
    show_scripts: "Показывать скрипты",
    show_area_filter: "Показывать фильтр по пространствам",
    show_last: "Показывать последнюю активацию",
    mini_count: "Кнопки сцен мини-карточки",
    stop: "Остановить",
    activated: "Активирована {when}",
    lights_on: "Включено светильников: {n}",
    show_hero: "Показывать активную сцену",
    cancel: "Отмена",
    left: "Осталось {time}",
    today_at: "сегодня {time}",
    tomorrow_at: "завтра {time}",
    yesterday_at: "вчера {time}",
    zoom_in: "Показать подробности",
    zoom_out: "Свернуть",
    title: "Заголовок (необязательно)",
    language: "Язык",
    lang_auto: "Автоматически",
    collapsed: "Свёрнутые по умолчанию разделы",
    zoom: "Кнопка подробностей",
    zoom_helper: "Переключает мини-карточку на содержимое полной карточки",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    no_registry: "Для этой карточки нужен Home Assistant 2024.8 или новее.",
    unavailable: "Недоступно",
  },
  uk: {
    scenes: "Сцени",
    scripts: "Скрипти",
    areas: "Простори",
    all: "Усі",
    active: "Активна",
    active_scene: "{name} активна",
    no_active: "Немає активної сцени",
    running: "Виконується",
    running_n: "Виконується: {n}",
    last_run: "Останній запуск {when}",
    never: "Ніколи",
    never_run: "Не запускався",
    run: "Запустити",
    nothing_here: "У цьому просторі нічого немає.",
    no_data: "Нічого показати: не знайдено ні сцен, ні скриптів.",
    scenes_field: "Сцени (порожньо: усі)",
    scripts_field: "Скрипти (порожньо: усі)",
    area: "Простори (лише їхні сцени та скрипти)",
    show_scenes: "Показувати сцени",
    show_scripts: "Показувати скрипти",
    show_area_filter: "Показувати фільтр за просторами",
    show_last: "Показувати останню активацію",
    mini_count: "Кнопки сцен міні-картки",
    stop: "Зупинити",
    activated: "Активовано {when}",
    lights_on: "Увімкнено світильників: {n}",
    show_hero: "Показувати активну сцену",
    cancel: "Скасувати",
    left: "Залишилось {time}",
    today_at: "сьогодні {time}",
    tomorrow_at: "завтра {time}",
    yesterday_at: "учора {time}",
    zoom_in: "Показати подробиці",
    zoom_out: "Згорнути",
    title: "Заголовок (необов'язково)",
    language: "Мова",
    lang_auto: "Автоматично",
    collapsed: "Згорнуті за замовчуванням розділи",
    zoom: "Кнопка подробиць",
    zoom_helper: "Перемикає міні-картку на вміст повної картки",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    no_registry: "Для цієї картки потрібен Home Assistant 2024.8 або новіший.",
    unavailable: "Недоступно",
  },
  hu: {
    scenes: "Jelenetek",
    scripts: "Szkriptek",
    areas: "Területek",
    all: "Mind",
    active: "Aktív",
    active_scene: "{name} aktív",
    no_active: "Nincs aktív jelenet",
    running: "Fut",
    running_n: "{n} fut",
    last_run: "Utoljára {when}",
    never: "Soha",
    never_run: "Még nem futott",
    run: "Futtatás",
    nothing_here: "Ezen a területen nincs semmi.",
    no_data: "Nincs mit megjeleníteni: nem található jelenet vagy szkript.",
    scenes_field: "Jelenetek (üres: mind)",
    scripts_field: "Szkriptek (üres: mind)",
    area: "Területek (csak azok jelenetei és szkriptjei)",
    show_scenes: "Jelenetek megjelenítése",
    show_scripts: "Szkriptek megjelenítése",
    show_area_filter: "Területszűrő megjelenítése",
    show_last: "Utolsó aktiválás megjelenítése",
    mini_count: "A mini kártya jelenetgombjai",
    stop: "Leállítás",
    activated: "Aktiválva {when}",
    lights_on: "Bekapcsolt lámpák: {n}",
    show_hero: "Aktív jelenet megjelenítése",
    cancel: "Mégse",
    left: "Még {time}",
    today_at: "ma {time}",
    tomorrow_at: "holnap {time}",
    yesterday_at: "tegnap {time}",
    zoom_in: "Részletek",
    zoom_out: "Kevesebb",
    title: "Cím (nem kötelező)",
    language: "Nyelv",
    lang_auto: "Automatikus",
    collapsed: "Alapértelmezetten összecsukott szakaszok",
    zoom: "Részletek gomb",
    zoom_helper: "A minikártyát a teljes kártya tartalmára váltja",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    no_registry: "Ehhez a kártyához Home Assistant 2024.8 vagy újabb szükséges.",
    unavailable: "Nem elérhető",
  },
  sk: {
    scenes: "Scény",
    scripts: "Skripty",
    areas: "Oblasti",
    all: "Všetky",
    active: "Aktívna",
    active_scene: "{name} aktívna",
    no_active: "Žiadna aktívna scéna",
    running: "Beží",
    running_n: "Beží: {n}",
    last_run: "Naposledy {when}",
    never: "Nikdy",
    never_run: "Nikdy nespustený",
    run: "Spustiť",
    nothing_here: "V tejto oblasti nič nie je.",
    no_data: "Nie je čo zobraziť: nenašla sa žiadna scéna ani skript.",
    scenes_field: "Scény (prázdne: všetky)",
    scripts_field: "Skripty (prázdne: všetky)",
    area: "Oblasti (len ich scény a skripty)",
    show_scenes: "Zobraziť scény",
    show_scripts: "Zobraziť skripty",
    show_area_filter: "Zobraziť filter oblastí",
    show_last: "Zobraziť poslednú aktiváciu",
    mini_count: "Tlačidlá scén mini karty",
    stop: "Zastaviť",
    activated: "Aktivovaná {when}",
    lights_on: "Zapnuté svetlá: {n}",
    show_hero: "Zobraziť aktívnu scénu",
    cancel: "Zrušiť",
    left: "Zostáva {time}",
    today_at: "dnes {time}",
    tomorrow_at: "zajtra {time}",
    yesterday_at: "včera {time}",
    zoom_in: "Zobraziť podrobnosti",
    zoom_out: "Zobraziť menej",
    title: "Názov (voliteľné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Predvolene zbalené sekcie",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Prepne mini kartu na obsah úplnej karty",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    no_registry: "Táto karta vyžaduje Home Assistant 2024.8 alebo novší.",
    unavailable: "Nedostupné",
  },
  cs: {
    scenes: "Scény",
    scripts: "Skripty",
    areas: "Oblasti",
    all: "Vše",
    active: "Aktivní",
    active_scene: "{name} aktivní",
    no_active: "Žádná aktivní scéna",
    running: "Běží",
    running_n: "Běží: {n}",
    last_run: "Naposledy {when}",
    never: "Nikdy",
    never_run: "Nikdy nespuštěn",
    run: "Spustit",
    nothing_here: "V této oblasti nic není.",
    no_data: "Není co zobrazit: nebyla nalezena žádná scéna ani skript.",
    scenes_field: "Scény (prázdné: všechny)",
    scripts_field: "Skripty (prázdné: všechny)",
    area: "Oblasti (jen jejich scény a skripty)",
    show_scenes: "Zobrazit scény",
    show_scripts: "Zobrazit skripty",
    show_area_filter: "Zobrazit filtr oblastí",
    show_last: "Zobrazit poslední aktivaci",
    mini_count: "Tlačítka scén mini karty",
    stop: "Zastavit",
    activated: "Aktivována {when}",
    lights_on: "Rozsvícená světla: {n}",
    show_hero: "Zobrazit aktivní scénu",
    cancel: "Zrušit",
    left: "Zbývá {time}",
    today_at: "dnes {time}",
    tomorrow_at: "zítra {time}",
    yesterday_at: "včera {time}",
    zoom_in: "Zobrazit podrobnosti",
    zoom_out: "Zobrazit méně",
    title: "Název (volitelné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Ve výchozím stavu sbalené sekce",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Přepne mini kartu na obsah plné karty",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podtitul",
    no_registry: "Tato karta vyžaduje Home Assistant 2024.8 nebo novější.",
    unavailable: "Nedostupné",
  },
  sl: {
    scenes: "Scene",
    scripts: "Skripte",
    areas: "Območja",
    all: "Vse",
    active: "Aktivna",
    active_scene: "{name} aktivna",
    no_active: "Ni aktivne scene",
    running: "Teče",
    running_n: "Teče: {n}",
    last_run: "Nazadnje {when}",
    never: "Nikoli",
    never_run: "Še ni zagnan",
    run: "Zaženi",
    nothing_here: "V tem območju ni ničesar.",
    no_data: "Ni kaj prikazati: ni najdene scene ali skripte.",
    scenes_field: "Scene (prazno: vse)",
    scripts_field: "Skripte (prazno: vse)",
    area: "Območja (samo njihove scene in skripte)",
    show_scenes: "Prikaži scene",
    show_scripts: "Prikaži skripte",
    show_area_filter: "Prikaži filter območij",
    show_last: "Prikaži zadnjo aktivacijo",
    mini_count: "Gumbi scen mini kartice",
    stop: "Ustavi",
    activated: "Aktivirana {when}",
    lights_on: "Prižgane luči: {n}",
    show_hero: "Prikaži aktivno sceno",
    cancel: "Prekliči",
    left: "Še {time}",
    today_at: "danes {time}",
    tomorrow_at: "jutri {time}",
    yesterday_at: "včeraj {time}",
    zoom_in: "Prikaži podrobnosti",
    zoom_out: "Prikaži manj",
    title: "Naslov (neobvezno)",
    language: "Jezik",
    lang_auto: "Samodejno",
    collapsed: "Privzeto strnjeni razdelki",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Preklopi mini kartico na vsebino polne kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ta kartica potrebuje Home Assistant 2024.8 ali novejši.",
    unavailable: "Ni na voljo",
  },
  lv: {
    scenes: "Ainas",
    scripts: "Skripti",
    areas: "Zonas",
    all: "Visas",
    active: "Aktīva",
    active_scene: "{name} aktīva",
    no_active: "Nav aktīvas ainas",
    running: "Darbojas",
    running_n: "Darbojas: {n}",
    last_run: "Pēdējoreiz {when}",
    never: "Nekad",
    never_run: "Nekad nav palaists",
    run: "Palaist",
    nothing_here: "Šajā zonā nekā nav.",
    no_data: "Nav ko rādīt: nav atrasta neviena aina vai skripts.",
    scenes_field: "Ainas (tukšs: visas)",
    scripts_field: "Skripti (tukšs: visi)",
    area: "Zonas (tikai to ainas un skripti)",
    show_scenes: "Rādīt ainas",
    show_scripts: "Rādīt skriptus",
    show_area_filter: "Rādīt zonu filtru",
    show_last: "Rādīt pēdējo aktivizēšanu",
    mini_count: "Mini kartītes ainu pogas",
    stop: "Apturēt",
    activated: "Aktivizēta {when}",
    lights_on: "Ieslēgtās gaismas: {n}",
    show_hero: "Rādīt aktīvo ainu",
    cancel: "Atcelt",
    left: "Atlikušas {time}",
    today_at: "šodien {time}",
    tomorrow_at: "rīt {time}",
    yesterday_at: "vakar {time}",
    zoom_in: "Rādīt detaļas",
    zoom_out: "Rādīt mazāk",
    title: "Virsraksts (neobligāts)",
    language: "Valoda",
    lang_auto: "Automātiski",
    collapsed: "Pēc noklusējuma sakļautās sadaļas",
    zoom: "Detaļu poga",
    zoom_helper: "Pārslēdz mini kartīti uz pilnās kartītes saturu",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    no_registry: "Šai kartītei nepieciešams Home Assistant 2024.8 vai jaunāks.",
    unavailable: "Nav pieejams",
  },
  el: {
    scenes: "Σκηνές",
    scripts: "Σενάρια",
    areas: "Χώροι",
    all: "Όλες",
    active: "Ενεργή",
    active_scene: "{name} ενεργή",
    no_active: "Καμία ενεργή σκηνή",
    running: "Εκτελείται",
    running_n: "Εκτελούνται: {n}",
    last_run: "Τελευταία φορά {when}",
    never: "Ποτέ",
    never_run: "Δεν εκτελέστηκε ποτέ",
    run: "Εκτέλεση",
    nothing_here: "Τίποτα σε αυτόν τον χώρο.",
    no_data: "Τίποτα για εμφάνιση: δεν βρέθηκε σκηνή ή σενάριο.",
    scenes_field: "Σκηνές (κενό: όλες)",
    scripts_field: "Σενάρια (κενό: όλα)",
    area: "Χώροι (μόνο οι σκηνές και τα σενάριά τους)",
    show_scenes: "Εμφάνιση των σκηνών",
    show_scripts: "Εμφάνιση των σεναρίων",
    show_area_filter: "Εμφάνιση του φίλτρου χώρων",
    show_last: "Εμφάνιση της τελευταίας ενεργοποίησης",
    mini_count: "Κουμπιά σκηνών της μίνι κάρτας",
    stop: "Διακοπή",
    activated: "Ενεργοποιήθηκε {when}",
    lights_on: "Αναμμένα φώτα: {n}",
    show_hero: "Εμφάνιση της ενεργής σκηνής",
    cancel: "Ακύρωση",
    left: "Απομένουν {time}",
    today_at: "σήμερα {time}",
    tomorrow_at: "αύριο {time}",
    yesterday_at: "χθες {time}",
    zoom_in: "Εμφάνιση λεπτομερειών",
    zoom_out: "Εμφάνιση λιγότερων",
    title: "Τίτλος (προαιρετικό)",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
    collapsed: "Ενότητες συμπτυγμένες από προεπιλογή",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Αλλάζει τη μίνι κάρτα στο περιεχόμενο της πλήρους κάρτας",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    no_registry: "Αυτή η κάρτα απαιτεί Home Assistant 2024.8 ή νεότερο.",
    unavailable: "Μη διαθέσιμο",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_ICONS = {
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  alert: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  minus: "M19,13H5V11H19V13Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  stop: "M18,18H6V6H18V18Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
};
const ICONS = { ...BASE_ICONS, ...CARD_ICONS };

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, or Home Assistant's full locale when it has the same base (pt-BR, de-CH).
// A bare "pt" (Home Assistant's code for European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const valid = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);


const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Attributes of an element that opens an entity's more-info (nothing without an entity).
const moreInfo = (id) => (id ? ` role="button" tabindex="0" data-entity="${esc(id)}"` : "");
const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const domainOf = (id) => String(id || "").split(".")[0];
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const DAY_MS = 8.64e7;


// "8:12", "1:05:00": a countdown, rounded up to the second.
const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

// A time stamp (ISO string, sensor state or input_datetime "YYYY-MM-DD HH:MM:SS") in ms; null otherwise.
const parseTime = (v) => {
  if (v === null || v === undefined || v === "" || v === "unknown" || v === "unavailable") return null;
  if (typeof v === "number") return v > 1e11 ? v : v * 1000;
  const s = String(v);
  const ms = Date.parse(/^\d{4}-\d{2}-\d{2} \d/.test(s) ? s.replace(" ", "T") : s);
  return Number.isFinite(ms) ? ms : null;
};




// "12 min ago", "in 3 h", "2 days ago": the largest unit that fits, rounded.
const fmtRelative = (hass, config, ms) => {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(hass, config), { numeric: "auto", style: "short" });
  if (abs < 6e4) return rtf.format(0, "minute");
  if (abs < 3.6e6) return rtf.format(Math.round(diff / 6e4), "minute");
  if (abs < DAY_MS) return rtf.format(Math.round(diff / 3.6e6), "hour");
  return rtf.format(Math.round(diff / DAY_MS), "day");
};


const devName = (d) => d?.name_by_user || d?.name || "";
const nameOf = (hass, id, fallback) => fallback || hass.states[id]?.attributes?.friendly_name || id;
const areaOf = (hass, id) => {
  const e = hass.entities?.[id];
  return e?.area_id || (e?.device_id && hass.devices?.[e.device_id]?.area_id) || null;
};
// Name of an entity without its device's name in front ("Kitchen Pasta" on the device "Kitchen" → "Pasta").
const shortName = (hass, id) => {
  const name = nameOf(hass, id);
  const dev = devName(hass.devices?.[hass.entities?.[id]?.device_id]);
  return dev && name.startsWith(`${dev} `) && name.length > dev.length + 1 ? name.slice(dev.length + 1) : name;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --sc-accent: #8e24aa; --sc-ok: var(--success-color, #43a047); --sc-warn: var(--warning-color, #ffa600);
          --sc-crit: var(--error-color, #db4437); --sc-idle: var(--disabled-text-color, #9e9e9e); --sc-active: var(--info-color, #039be5);
          /* Text in a state color is mixed with the text color so that it reads at 4.5:1 at least. */
          --sc-accent-text: color-mix(in srgb, var(--sc-accent) 50%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container-type: inline-size; }
  /* Natural width in a parent that sizes to its content (inline-block, grid "auto" column), without a minimum. */
  :host { display: block; min-width: 0; --sc-natural-width: 380px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--sc-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, var(--sc-accent)); outline-offset: 2px; border-radius: 4px; }
  .ok { --c: var(--sc-ok); } .warn { --c: var(--sc-warn); } .crit { --c: var(--sc-crit); } .idle { --c: var(--sc-idle); }
  .active { --c: var(--sc-active); } .accent { --c: var(--sc-accent); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--sc-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--sc-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--sc-ok)) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; box-sizing: border-box; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  /* The chip sits on the title's line, whether a subtitle follows or not. */
  .header .chip, .header .zoom { align-self: flex-start; margin-top: 10px; }
  .type-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none;
               --sc-tint: var(--c, var(--sc-accent)); background: color-mix(in srgb, var(--sc-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--sc-tint) 60%, var(--primary-text-color)); transition: fill .3s ease; }
  .titles { flex: 1 1 0; min-width: 5ch; }
  :host([hide-title]) .titles > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--sc-warn) 50%, var(--primary-text-color)); }
  /* Buttons as on the other cards: a smoked-glass background (never a filled color), the icon in the accent color. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--primary-text-color); min-width: 0; }
  .btn span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn:not(:disabled):hover { background: color-mix(in srgb, var(--sc-accent) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn .icon { width: 18px; height: 18px; color: var(--sc-accent); }
  .btn.primary { background: color-mix(in srgb, var(--sc-accent) 16%, transparent); color: var(--sc-accent-text); }
  .btn.primary:not(:disabled):hover { background: color-mix(in srgb, var(--sc-accent) 24%, transparent); }
  .btn.active { background: color-mix(in srgb, var(--sc-active) 16%, transparent); color: color-mix(in srgb, var(--sc-active) 50%, var(--primary-text-color)); }
  .btn.active .icon { color: var(--sc-active); }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  .btn:disabled { opacity: .45; cursor: default; }
  .btn:focus-visible { outline: 2px solid var(--primary-color, var(--sc-accent)); outline-offset: 2px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--sc-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--sc-accent)); outline-offset: 1px; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 16px; height: 16px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line.ok, .line.warn, .line.crit, .line.active, .line.accent { color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .line.ok .icon, .line.warn .icon, .line.crit .icon, .line.active .icon, .line.accent .icon { color: var(--c); }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .num { font-variant-numeric: tabular-nums; }
  .content { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title.toggle { cursor: pointer; user-select: none; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title .count { margin-left: 2px; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title.toggle[aria-expanded="false"] { margin-bottom: 0; }
  /* Folded: the chevron points right; unfolded: down. */
  .section-title .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform .2s ease; }
  .section-title.toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 2px 0; }
  .ring-svg { position: absolute; inset: 0; transform: rotate(-90deg); }
  .ring-svg circle { fill: none; }
  .ring-svg .track { stroke: color-mix(in srgb, var(--c, var(--sc-accent)) 18%, transparent); }
  .ring-svg .prog { stroke: var(--c, var(--sc-accent)); stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  /* Hero, as on the garden and tempo cards: a flat illustration on the left, a big value and a few colored lines on the right. */
  .hero { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .hero-art { flex: none; width: 120px; display: grid; place-items: center; }
  .hero-art svg { width: 100%; height: auto; display: block; }
  .hero-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .hero-kick { font-size: 12px; color: var(--secondary-text-color); }
  .big { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
  .big .icon { width: 24px; height: 24px; align-self: center; color: var(--c, var(--sc-accent)); }
  .big b { font-size: 30px; font-weight: 400; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .big span { font-size: 14px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hero .line { font-size: 12.5px; }
  /* Rows, as the watering zones: a round icon (grey at rest, tinted otherwise, a ring while it runs), name, colored state, a button. */
  .row { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .row-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; flex: none; display: grid; place-items: center;
              --t: var(--c, var(--sc-idle)); background: color-mix(in srgb, var(--t) 18%, transparent); color: color-mix(in srgb, var(--t) 70%, var(--primary-text-color)); }
  .row-icon.idle { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); color: var(--secondary-text-color); }
  .row-icon > .icon, .row-icon > ha-icon { width: 22px; height: 22px; --mdc-icon-size: 22px; }
  .row-icon .ring-svg { inset: -2px; width: 44px; height: 44px; }
  .badge { position: absolute; right: -3px; bottom: -3px; width: 17px; height: 17px; border-radius: 50%; display: grid; place-items: center;
           background: var(--b, var(--sc-ok)); color: #fff; box-shadow: 0 0 0 2px var(--ha-card-background, var(--card-background-color, #fff)); }
  .badge .icon { width: 11px; height: 11px; }
  .row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .row-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state { font-size: 12.5px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state.ok, .row-state.warn, .row-state.crit, .row-state.active, .row-state.accent { color: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  .rows { display: flex; flex-direction: column; gap: 8px; }
  /* Tiles, as on room overview: grey, tinted with a border when they need a look; small badges below. */
  .tiles { display: grid; gap: 8px; grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr)); }
  .tile { min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 10px; box-sizing: border-box;
          background: var(--secondary-background-color, rgba(127,127,127,.12)); border: 1px solid transparent; }
  .tile.tint { background: color-mix(in srgb, var(--c) 13%, var(--secondary-background-color, rgba(127,127,127,.12)));
               border-color: color-mix(in srgb, var(--c) 30%, transparent); }
  .tile-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .tile .row-icon { width: 30px; height: 30px; } .tile .row-icon > .icon { width: 18px; height: 18px; }
  .tile .row-state { font-size: 12px; }
  .badges { display: flex; gap: 4px; flex-wrap: wrap; }
  .pill { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; padding: 1px 7px; border-radius: 10px;
          color: color-mix(in srgb, var(--c, var(--sc-idle)) 60%, var(--primary-text-color)); background: color-mix(in srgb, var(--c, var(--sc-idle)) 14%, transparent); }
  .pill .icon { width: 14px; height: 14px; color: var(--c, var(--sc-idle)); }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  @container (max-width: 230px) {
    .chip { padding: 4px; flex: none; }
    .chip-text { display: none; }
    .header { gap: 6px; }
  }
`;

// Popup at the top of the card, over a backdrop: it stays in view on a long card.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 220px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 15px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
  .stepper { display: flex; align-items: center; justify-content: center; gap: 14px; }
  .stepper .val { font-size: 28px; font-weight: 400; min-width: 4ch; text-align: center; }
  .stepper .val small { font-size: 14px; color: var(--secondary-text-color); margin-left: 2px; }
  .presets { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
  .preset { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 14px; cursor: pointer; color: var(--primary-text-color);
            background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 16%, transparent); }
  .preset.on { border-color: color-mix(in srgb, var(--sc-accent) 60%, transparent); color: var(--sc-accent-text); font-weight: 500;
               background: color-mix(in srgb, var(--sc-accent) 10%, transparent); }
  .field { font: inherit; font-size: 15px; width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px; color: var(--primary-text-color);
           background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 20%, transparent); }
  .field:focus { outline: 2px solid var(--primary-color, var(--sc-accent)); outline-offset: -1px; }
`;

// The mini card: header and a compact row; its detail button switches it to the full card's content.
const MINI_STYLE = `
  :host { --sc-natural-width: 300px; }
  .content.mini { flex-direction: row; align-items: center; gap: 12px; }
  .mini .info { gap: 4px; }
  .mini .line .icon { width: 14px; height: 14px; }
  .controls { display: flex; gap: 6px; flex: none; }
  @container (max-width: 300px) {
    .content.mini { flex-wrap: wrap; row-gap: 8px; }
    .mini .controls { flex-basis: 100%; justify-content: flex-end; }
  }
`;

// Element names of Home Assistant dialogs (a more-info opened from the card): a click there is not "elsewhere".
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};
// After a popup closes, clicks on the card are ignored this long (the second click of a double click).
const CONFIRM_GUARD_MS = 400;
// Elements a click acts on, and how one is told from the others across renders (focus kept for keyboard users).
const FOCUS_SELECTOR = "[data-action], [data-entity], [data-keep]";
const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};
// A progress ring (SVG, size × size, stroke width w) whose progress `p` (0..1) is drawn; `end` and `total` (ms) make it
// count down every second in place (see _syncCountdown).
const ring = (size, w, p, { end, total } = {}) => {
  const r = (size - w) / 2;
  const c = 2 * Math.PI * r;
  const live = end && total ? ` data-end="${end}" data-total="${total}" data-c="${c.toFixed(2)}"` : "";
  return `<svg class="ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${w}"/><circle class="prog" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${w}" stroke-dasharray="${c.toFixed(2)}" style="stroke-dashoffset:${(c * (1 - clamp(p, 0, 1))).toFixed(2)}"${live}/></svg>`;
};

// ---------------------------------------------------------------------------
// Card base
// ---------------------------------------------------------------------------

// What every card of this file shares: rendering only when something shown changed, no rewrite under a press, focus
// kept for keyboard users, folding sections, a popup at the top of the card, live countdowns, service calls.
// A card defines _build() (its model from the registries and the configuration), _entityIds(m), _render(), and may
// define _action(action, el, ev), _dialogHtml() / _dialogAction(action, el), _extraDeps(), _onConnect() / _onDisconnect().
class CardBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._inputs = {};
    // No rewrite of the card between a press and its click: Home Assistant updates the card several times a second,
    // and a rewrite under the pointer replaces the element pressed, so that the click lands on the card itself and
    // does nothing. The update held back is drawn once released: by the click (registered before the card's own
    // handler, which renders at once), else right after the release.
    this._onPress = () => {
      this._byPointer = true;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    this._onPressClick = (ev) => {
      if (ev.detail === 0) this._byPointer = false;
      this._pressing = false;
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPress);
    this.shadowRoot.addEventListener("click", this._onPressClick);
    // From the keyboard, the focus is kept across rewrites (with the pointer it would draw the focus ring).
    this.shadowRoot.addEventListener("keydown", () => {
      this._byPointer = false;
    });
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Text typed in a field of the card is kept across rewrites (see _update); Enter in it acts as its button.
    this.shadowRoot.addEventListener("input", (ev) => {
      const key = ev.target?.dataset?.keep;
      if (key) this._inputs[key] = ev.target.value;
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      const el = ev.target;
      if (ev.key === "Enter" && el?.dataset?.keep && el.dataset.submit) {
        ev.preventDefault();
        this._onClick({ composedPath: () => [{ dataset: { action: el.dataset.submit } }], stopPropagation() {}, detail: 0 });
        return;
      }
      // Enter / Space on an element with the button role acts as a click, as on a <button>.
      if ((ev.key !== "Enter" && ev.key !== " ") || el?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      el.click();
    });
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._dialog) return;
      ev.stopPropagation();
      this._closeDialog();
    };
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._model = null;
    this._configChanged?.();
    this._update();
  }

  // Home Assistant pushes a new hass on every state change of the whole instance: the card is only rebuilt when
  // something it shows changed (see _deps).
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // The registries, the language, the theme, the state objects the card reads, its own data and the minute (the
  // "12 min ago" texts move on their own).
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const m = this._resolve();
    const ids = m ? this._entityIds(m) : [];
    return [h.entities, h.devices, h.areas, h.language, h.locale, h.themes?.darkMode, Math.floor(Date.now() / 6e4), ...this._extraDeps(), ...ids.map((id) => h.states[id])];
  }

  _extraDeps() {
    return [];
  }

  // The model is rebuilt when the registries or the set of entities change (a new entity, a device renamed).
  _resolve() {
    const h = this._hass;
    if (!h?.entities || !h?.devices) return null;
    const key = [h.entities, h.devices, h.areas, Object.keys(h.states).length];
    if (this._model && this._modelKey?.every((k, i) => k === key[i])) return this._model;
    this._modelKey = key;
    this._model = this._build();
    return this._model;
  }

  connectedCallback() {
    // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
    this._outside ??= watchOutside(
      (ev) => isOutside(this, ev),
      () => {
        if (!this._toggled?.size && !this._dialog) return;
        this._toggled = new Map();
        if (this._dialog) this._closeDialog();
        else this._update();
      },
    );
    this._outside.on();
    if (this._dialog) window.addEventListener("keydown", this._onKey);
    clearInterval(this._tick);
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 60000);
    this._onConnect?.();
    this._update();
  }

  disconnectedCallback() {
    this._pressing = this._dirty = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    clearInterval(this._tick);
    clearInterval(this._countdown);
    this._tick = this._countdown = null;
    this._outside?.off();
    window.removeEventListener("keydown", this._onKey);
    this._onDisconnect?.();
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._toggled = new Map();
    this._dialog = null;
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _locale() {
    return intlLocale(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // Service call whose failure Home Assistant already reports (toast): handled here so that it does not end up as
  // "Uncaught (in promise)".
  _call(domain, service, data) {
    const r = this._hass.callService(domain, service, data);
    if (r && typeof r.catch === "function") r.catch(() => {});
    return r;
  }

  // A websocket command, through hass.callWS (or the connection), resolved with null on error.
  async _ws(msg) {
    const h = this._hass;
    try {
      if (h.callWS) return await h.callWS(msg);
      if (h.connection?.sendMessagePromise) return await h.connection.sendMessagePromise(msg);
    } catch {
      return null;
    }
    return null;
  }

  _update() {
    if (!this._hass || !this._config) return;
    // Held back under a press (see the constructor): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    let html = this._render();
    if (this._dialog) {
      html = html.replace(/<ha-card(\s[^>]*)?>([\s\S]*)<\/ha-card>\s*$/, (_, attrs = "", inner) => {
        const a = attrs.includes('class="') ? attrs.replace('class="', 'class="dialog-open ') : `${attrs} class="dialog-open"`;
        return `<ha-card${a}>${inner}<style>${DIALOG_STYLE}</style>${this._dialogHtml()}</ha-card>`;
      });
    }
    if (html !== this._html) {
      const active = this.shadowRoot.activeElement;
      const field = active?.dataset?.keep ? { key: active.dataset.keep, start: active.selectionStart, end: active.selectionEnd } : null;
      const focused = this._dialog && active?.dataset?.action;
      const kept = this._dialog || this._byPointer ? null : this._focusedSpot();
      this._html = html;
      this.shadowRoot.innerHTML = html;
      // Fields get back what was typed, and the caret when one had the focus.
      for (const el of this.shadowRoot.querySelectorAll?.("[data-keep]") || []) {
        const v = this._inputs[el.dataset.keep];
        if (v !== undefined) el.value = v;
      }
      if (field) {
        const el = this.shadowRoot.querySelector(`[data-keep="${field.key}"]`);
        el?.focus?.({ preventScroll: true });
        el?.setSelectionRange?.(field.start, field.end);
      } else if (kept) this._restoreFocus(kept);
      if (this._dialog && !field) {
        const sel = focused ? `.modal [data-action="${focused}"]` : ".modal [data-keep], .modal .primary";
        this.shadowRoot.querySelector(sel)?.focus?.({ preventScroll: true });
      }
    }
    this._syncCountdown();
    this._afterUpdate?.();
  }

  // Countdowns move every second in place (no re-render, which would restart the animations): the text of [data-end]
  // elements, and the arc of rings (data-total and data-c). The card is redrawn once a countdown ends.
  _syncCountdown() {
    const els = [...(this.shadowRoot.querySelectorAll?.("[data-end]") || [])];
    if (!els.length) {
      clearInterval(this._countdown);
      this._countdown = null;
      return;
    }
    if (this._countdown) return;
    this._countdown = setInterval(() => {
      const now = Date.now();
      let ended = false;
      for (const el of this.shadowRoot.querySelectorAll("[data-end]")) {
        const left = Number(el.dataset.end) - now;
        if (left <= 0) ended = true;
        if (el.dataset.total) {
          const offset = (Number(el.dataset.c) * (1 - clamp(left / Number(el.dataset.total), 0, 1))).toFixed(2);
          if (el.style.strokeDashoffset !== offset) el.style.strokeDashoffset = offset;
        } else {
          const text = el.dataset.fmt === "left" ? this._t("left", { time: fmtCountdown(left) }) : fmtCountdown(left);
          if (el.textContent !== text) el.textContent = text;
        }
      }
      if (ended) {
        clearInterval(this._countdown);
        this._countdown = null;
        this._lastDeps = null;
        this._update();
      }
    }, 1000);
  }

  _focusedSpot() {
    const el = this.shadowRoot.activeElement;
    if (!el?.dataset) return null;
    const key = focusKey(el);
    if (!key) return null;
    const index = this._focusables(key).indexOf(el);
    return index < 0 ? null : { key, index };
  }

  _focusables(key) {
    return [...this.shadowRoot.querySelectorAll(FOCUS_SELECTOR)].filter((n) => focusKey(n) === key);
  }

  _restoreFocus({ key, index }) {
    this._focusables(key)[index]?.focus({ preventScroll: true });
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._dialog) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "dialog_cancel" || (action === "dialog_backdrop" && path[0] === el)) return this._closeDialog();
      if (action) this._dialogAction(action, el);
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity } = el.dataset;
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "toggle_section") {
      const key = el.dataset.section;
      this._toggled = new Map(this._toggled).set(key, !this._isCollapsed(key));
      return this._update();
    }
    if (action && this._action(action, el, ev)) return;
    if (entity) this._moreInfo(entity);
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  _action() {
    return false;
  }

  _dialogAction() {}

  _dialogHtml() {
    return "";
  }

  _openDialog(d) {
    this._dialog = d;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector(".modal [data-keep], .modal .primary")?.focus?.();
  }

  _closeDialog() {
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  // The popup's frame: a message, the content and its buttons (cancel, then the main action).
  _modal(title, body, okLabel, okIcon, okDisabled = false) {
    return `<div class="backdrop" data-action="dialog_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="msg">${esc(title)}</div>
        ${body}
        <div class="modal-actions">
          <button class="btn" data-action="dialog_cancel"><span>${esc(this._t("cancel"))}</span></button>
          <button class="btn primary" data-action="dialog_ok"${okDisabled ? " disabled" : ""}>${okIcon ? svgIcon(okIcon) : ""}<span>${esc(okLabel)}</span></button>
        </div>
      </div>
    </div>`;
  }

  _isCollapsed(key) {
    if (this._toggled?.has(key)) return this._toggled.get(key);
    return asList(this._config.collapsed ?? this.constructor.defaultCollapsed ?? []).includes(key);
  }

  _sectionTitle(key, icon, label, count = "") {
    const closed = this._isCollapsed(key);
    return `<div class="section-title toggle" role="button" tabindex="0" data-action="toggle_section" data-section="${key}" aria-expanded="${!closed}">${svgIcon(icon)}<span>${esc(
      label,
    )}</span>${count !== "" ? `<span class="count">${esc(count)}</span>` : ""}${svgIcon(ICONS.chevron_down, "chevron")}</div>`;
  }

  // A folding section: its title, and its body unless folded.
  _section(key, icon, label, count, body) {
    return `<div class="section">${this._sectionTitle(key, icon, label, count)}${this._isCollapsed(key) ? "" : body}</div>`;
  }

  // The model ready to draw, or the error card to draw instead: no registries (Home Assistant too old), or nothing to
  // show (_emptyKey(m) names the message).
  _ready() {
    const m = this._resolve();
    if (!m) return { error: this._errorCard("no_registry") };
    const empty = this._emptyKey(m);
    return empty ? { error: this._errorCard(empty) } : { m };
  }

  _emptyKey() {
    return null;
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t(key))}</div></ha-card>`;
  }

  // Header: the tinted round icon (its tint follows `cls`), the title and subtitle, the status chip on the title's line.
  _header({ icon, cls = "accent", title, sub, chip, extra = "" }) {
    return `
      <div class="header">
        <div class="type-icon ${cls}">${extra}${svgIcon(icon)}</div>
        <div class="titles">
          <div class="name">${esc(title)}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
        ${
          chip
            ? `<span class="chip ${chip.cls}${chip.entity ? " clickable" : ""}"${moreInfo(chip.entity)} title="${esc(chip.text)}" aria-label="${esc(
                chip.text,
              )}"><span class="dot"></span><span class="chip-text">${esc(chip.text)}</span></span>`
            : ""
        }
        ${this._zoomButton()}
      </div>`;
  }

  _zoomButton() {
    return "";
  }

  _toggleZoom() {}
}

// The mini card is the full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
const withMini = (Full) =>
  class extends Full {
    constructor() {
      super();
      this._unzoom = watchOutside(
        (ev) => isOutside(this, ev),
        () => {
          if (this._zoomed && !this._dialog) this._setZoom(false);
        },
      );
    }

    connectedCallback() {
      super.connectedCallback();
      this._unzoom.on();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._unzoom.off();
      // Back to the compact view once off the screen (see the full card).
      this._zoomed = false;
    }

    getCardSize() {
      return this._zoomed ? super.getCardSize() : 3;
    }

    getGridOptions() {
      return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
    }

    _zoomButton() {
      if (this._config.zoom === false) return "";
      const z = this._zoomed;
      const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
      return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
    }

    _setZoom(on) {
      this._zoomed = on;
      this._update();
      this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
    }

    _toggleZoom(ev) {
      this._setZoom(!this._zoomed);
      if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
    }

    _render() {
      return this._zoomed ? super._render() : this._renderMini();
    }
  };

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// An editor is a ha-form: `fields` (the card's options), `toggles` ([name, default] booleans), `defaults` (options
// left out of the YAML when at their default), `sections` (the foldable sections, for `collapsed`). Options written
// in YAML that the form does not show are kept.
class EditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  static get defaults() {
    return {};
  }

  static get sections() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _fields() {
    return [];
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const toggles = this.constructor.toggles;
    const sections = this.constructor.sections;
    return [
      { name: "title", selector: { text: {} } },
      ...this._fields(),
      ...(toggles.length ? [{ type: "grid", name: "", schema: toggles.map(([name]) => ({ name, selector: { boolean: {} } })) }] : []),
      ...(sections.length ? [{ name: "collapsed", selector: { select: { multiple: true, mode: "list", options: sections.map((value) => ({ value, label: tr(value) })) } } }] : []),
      { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } } },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    const defaults = { ...Object.fromEntries(toggles), ...this.constructor.defaults };
    if (!this._form) {
      this._form = document.createElement("ha-form");
      // A field's label is its `<name>_field` text when the card also uses `<name>` for something else (a section).
      this._form.computeLabel = (s) => t(this._hass, this._config, STRINGS.en[`${s.name}_field`] ? `${s.name}_field` : s.name);
      this._form.computeHelper = (s) => (STRINGS.en[`${s.name}_helper`] ? t(this._hass, this._config, `${s.name}_helper`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: no empty values, no options left at their default.
          if (v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length) || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    if (this._formConfig !== this._config) {
      this._formConfig = this._config;
      this._form.data = { ...defaults, ...this._config };
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};

const register = (cards, url) => {
  for (const [name, cls] of cards) define(name, cls);
  window.customCards = window.customCards || [];
  for (const [type, , card] of cards) {
    if (card && !window.customCards.some((c) => c.type === type)) window.customCards.push({ type, ...card, preview: true, documentationURL: url });
  }
};

// ---------------------------------------------------------------------------
// Discovery and the active scene
// ---------------------------------------------------------------------------

// The colors of the scene icons, by kind: a movie scene in violet, a dinner in orange…
const TINTS = {
  film: "#5e35b1",
  dinner: "#ef6c00",
  book: "#8d6e63",
  sun: "#f9a825",
  moon: "#3949ab",
  bed: "#5c6bc0",
  away: "#00897b",
  sofa: "#d81b60",
  party: "#e53935",
  work: "#1e88e5",
  bright: "#fbc02d",
  power: "#757575",
  shutter: "#6d4c41",
  music: "#8e24aa",
};

const _cache = new WeakMap();

// An entry of `scenes` or `scripts`: an entity id, or { entity, name, icon, color }.
const entries = (list, domain) =>
  asList(list)
    .map((x) => (typeof x === "string" ? { entity: x } : x))
    .filter((x) => x?.entity && domainOf(x.entity) === domain);

// Shown unless hidden in Home Assistant or a configuration / diagnostic entity.
const visible = (hass, id) => {
  const e = hass.entities?.[id];
  return !e || (!e.hidden && !e.hidden_by && !e.entity_category);
};

// The scenes and scripts of the configuration, else every visible scene and script; `area` keeps those of an area
// (or of several). Each one with its area: { entity, name, icon, color, area }.
const resolve = (hass, config) => {
  let per = _cache.get(hass.entities);
  if (!per) _cache.set(hass.entities, (per = new Map()));
  const sig = `${JSON.stringify([config.scenes, config.scripts, config.area])}|${Object.keys(hass.states).length}`;
  if (per.has(sig)) return per.get(sig);
  const areas = asList(config.area);
  const all = (domain) =>
    Object.keys(hass.states)
      .filter((id) => domainOf(id) === domain && visible(hass, id))
      .map((entity) => ({ entity }));
  const take = (list, domain) =>
    (list === undefined ? all(domain) : entries(list, domain))
      .filter((x) => hass.states[x.entity])
      .map((x) => ({ ...x, name: x.name || shortName(hass, x.entity), area: areaOf(hass, x.entity) }))
      .filter((x) => !areas.length || areas.includes(x.area));
  const byName = (a, b) => a.name.localeCompare(b.name);
  const scenes = take(config.scenes, "scene");
  const scripts = take(config.scripts, "script");
  // In the configuration's order when listed there, else by name.
  if (config.scenes === undefined) scenes.sort(byName);
  if (config.scripts === undefined) scripts.sort(byName);
  // The lights a scene sets: its `entity_id` attribute (scenes of Home Assistant); else the lights of its device (Hue
  // scenes belong to their room or zone, whose grouped light is on the same device); else those of the area named as
  // its `group_name` (Hue), else of its own area (deCONZ and the others).
  const lights = Object.keys(hass.states).filter((id) => domainOf(id) === "light");
  const areaByName = new Map(Object.values(hass.areas || {}).map((a) => [String(a.name).toLowerCase(), a.area_id]));
  const lightsOf = new Map();
  // The lights counted as "on" for a scene: only those it really sets (listed, or on its device), a light group
  // expanded to its members; null when they come from the area, or a Hue room light that can't be expanded.
  const countOf = new Map();
  const byFriendly = new Map(lights.map((id) => [String(hass.states[id]?.attributes?.friendly_name || ""), id]));
  const expand = (id) => {
    const a = hass.states[id]?.attributes || {};
    const listed = asList(a.entity_id).filter((x) => domainOf(x) === "light" && x !== id);
    if (listed.length) return listed;
    const named = asList(a.lights).map((n) => byFriendly.get(String(n))).filter((x) => x && x !== id);
    if (named.length) return named;
    return a.is_hue_group ? null : [id];
  };
  for (const sc of scenes) {
    const attrs = hass.states[sc.entity].attributes || {};
    const listed = asList(attrs.entity_id);
    const device = hass.entities?.[sc.entity]?.device_id;
    const area = sc.area || (attrs.group_name ? areaByName.get(String(attrs.group_name).toLowerCase()) : null) || null;
    let members = listed;
    if (!members.length && device) members = lights.filter((id) => hass.entities?.[id]?.device_id === device);
    const sure = members.length > 0;
    if (!members.length && attrs.group_name) {
      const named = areaByName.get(String(attrs.group_name).toLowerCase());
      if (named) members = lights.filter((id) => areaOf(hass, id) === named);
    }
    if (!members.length && area) members = lights.filter((id) => areaOf(hass, id) === area);
    if (!sc.area && area) sc.area = area;
    lightsOf.set(sc.entity, members);
    if (sure) {
      const parts = members.map(expand);
      countOf.set(sc.entity, parts.some((x) => x === null) ? null : [...new Set(parts.flat())]);
    } else countOf.set(sc.entity, null);
  }
  const out = { scenes, scripts, lightsOf, countOf };
  per.set(sig, out);
  return out;
};

// Relative luminance of a #rrggbb color (0 black … 1 white).
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// When a scene was last activated: the state of every scene entity, or null (never).
const activatedAt = (s) => (s && valid(s) ? parseTime(s.state) : null);

// The active scenes: those that say so (Hue smart scenes), else those activated last among the scenes that set the
// same lights, while none of these lights changed since (SETTLE_MS after the activation, for its transitions).
const activeScenes = (hass, m) => {
  const out = new Set();
  const at = new Map(m.scenes.map((sc) => [sc.entity, activatedAt(hass.states[sc.entity])]));
  for (const sc of m.scenes) {
    const s = hass.states[sc.entity];
    if (typeof s?.attributes?.is_active === "boolean") {
      if (s.attributes.is_active) out.add(sc.entity);
      continue;
    }
    const t = at.get(sc.entity);
    const lights = m.lightsOf.get(sc.entity) || [];
    if (t === null || !lights.length) continue;
    const newer = m.scenes.some((o) => o.entity !== sc.entity && (at.get(o.entity) ?? -1) > t && (m.lightsOf.get(o.entity) || []).some((id) => lights.includes(id)));
    if (newer) continue;
    const changed = lights.some((id) => (parseTime(hass.states[id]?.last_updated) ?? 0) > t + SETTLE_MS);
    if (!changed) out.add(sc.entity);
  }
  return out;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

// The illustration of the hero: a sofa under a lamp, greyed when no scene is active.
const ART = `<svg viewBox="0 0 120 100" aria-hidden="true">
  <ellipse cx="60" cy="60" rx="52" ry="36" class="a-bg"/>
  <rect x="22" y="58" width="76" height="22" rx="8" class="a-s1"/><rect x="16" y="54" width="14" height="28" rx="6" class="a-s2"/>
  <rect x="90" y="54" width="14" height="28" rx="6" class="a-s2"/><rect x="30" y="50" width="28" height="14" rx="6" class="a-s3"/>
  <rect x="62" y="50" width="28" height="14" rx="6" class="a-s3"/><rect x="20" y="82" width="4" height="8" class="a-s2"/><rect x="96" y="82" width="4" height="8" class="a-s2"/>
  <path d="M96 14 v20" class="a-cord"/><path d="M86 34 h20 l-4 -10 h-12 z" class="a-lamp"/><path d="M84 36 l-8 14 h40 l-8 -14" class="a-light"/>
  <circle cx="22" cy="24" r="14" class="a-moon2"/><circle cx="22" cy="24" r="8" class="a-moon"/></svg>`;

const SCENE_STYLE = `
  :host { --sc-art-bg: color-mix(in srgb, #7e57c2 14%, transparent); }
  .a-bg { fill: var(--sc-art-bg); } .a-s1 { fill: #7e57c2; } .a-s2 { fill: #673ab7; } .a-s3 { fill: #9575cd; }
  .a-cord { stroke: var(--secondary-text-color); stroke-width: 2; } .a-lamp { fill: #ffb74d; } .a-light { fill: #ffe082; opacity: .55; }
  .a-moon { fill: #ffd54f; opacity: .9; } .a-moon2 { fill: #ffd54f; opacity: .25; }
  .hero-art.off svg { filter: grayscale(1); opacity: .45; }
  .hero-art.off .a-light { display: none; }
  .areas { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin: 0 -12px; padding: 0 12px; }
  .areas::-webkit-scrollbar { display: none; }
  .area { font: inherit; font-size: 13px; padding: 4px 10px; border-radius: 14px; cursor: pointer; color: var(--primary-text-color); white-space: nowrap; flex: none;
          border: none; background: var(--secondary-background-color, rgba(127,127,127,.12)); }
  .area.on { color: var(--sc-accent-text); background: color-mix(in srgb, var(--sc-accent) 15%, transparent); font-weight: 500; }
  .area:focus-visible { outline: 2px solid var(--primary-color, var(--sc-accent)); outline-offset: 1px; }
  .tiles { --cols: 3; }
  button.tile { all: unset; position: relative; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; gap: 6px; padding: 8px;
                border-radius: 10px; cursor: pointer; min-width: 0; border: 1px solid transparent;
                background: var(--secondary-background-color, rgba(127,127,127,.12)); transition: background-color .3s ease, border-color .3s ease; }
  button.tile.tint { background: color-mix(in srgb, var(--c) 13%, var(--secondary-background-color, rgba(127,127,127,.12)));
                     border-color: color-mix(in srgb, var(--c) 30%, transparent); }
  /* Only with a real pointer (no sticky hover after a tap on WebKit), and never over the active tile's tint. */
  @media (hover: hover) {
    button.tile:not(.tint):hover { background: color-mix(in srgb, var(--c) 8%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  }
  .hero-body .big b { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .big ha-icon { --mdc-icon-size: 24px; color: var(--c); align-self: center; flex: none; }
  button.tile:focus-visible { outline: 2px solid var(--primary-color, var(--sc-accent)); outline-offset: 2px; }
  .tile .row-icon > ha-icon { --mdc-icon-size: 18px; }
  /* The scene just launched: a ripple from its icon. */
  .tile .ripple { position: absolute; top: 24px; left: 24px; width: 30px; height: 30px; margin: -15px; border-radius: 50%; pointer-events: none;
                  background: var(--c); opacity: 0; transform: scale(0); }
  .tile.fire .ripple { animation: sc-ripple ${FIRE_MS}ms ease-out forwards; }
  .tile.fire .row-icon { animation: sc-pop ${FIRE_MS}ms ease-out; }
  @keyframes sc-ripple { 0% { opacity: .35; transform: scale(.6); } 100% { opacity: 0; transform: scale(9); } }
  @keyframes sc-pop { 0%, 100% { transform: scale(1); } 30% { transform: scale(.86); } 60% { transform: scale(1.08); } }
  /* A script running: its ring turns round the icon. */
  .row-icon .ring-svg.spin { animation: sc-spin 1.2s linear infinite; }
  @keyframes sc-spin { from { transform: rotate(-90deg); } to { transform: rotate(270deg); } }
  .row-text.clickable { cursor: pointer; }
  .mini .mini-art { width: 84px; flex: none; } .mini .mini-art svg { width: 100%; height: auto; display: block; }
  .mini .picks { display: flex; gap: 6px; flex: none; }
  .mini .btn.round { --t: var(--c, var(--sc-accent)); background: color-mix(in srgb, var(--t) 16%, transparent); }
  .mini .btn.round.on { box-shadow: inset 0 0 0 2px var(--t); }
  .mini .btn.round .icon, .mini .btn.round ha-icon { color: color-mix(in srgb, var(--t) 70%, var(--primary-text-color)); --mdc-icon-size: 20px; }
  @container (max-width: 340px) {
    .tiles { --cols: 2; }
    .hero-art { width: 84px; }
    .big b { font-size: 24px; }
  }
  .big.none b { font-size: 20px; font-weight: 500; }
  @container (max-width: 300px) {
    .tile-head { flex-direction: column; align-items: flex-start; gap: 6px; }
    .tile .ripple { top: 23px; left: 23px; }
    .hero-art { width: 64px; }
    .big span { display: none; }
    .row { gap: 10px; }
    .row .btn span { display: none; }
    .row .btn { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  }
  @container (max-width: 260px) {
    .mini .mini-art { display: none; }
  }
  @container (max-width: 200px) {
    .hero-art { display: none; }
    .tiles { --cols: 1; }
  }
`;

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

class SceneCard extends CardBase {
  static getConfigElement() {
    return document.createElement("scene-card-editor");
  }

  getCardSize() {
    return 6;
  }

  _build() {
    return resolve(this._hass, this._config);
  }

  _entityIds(m) {
    return [...m.scenes.map((x) => x.entity), ...m.scripts.map((x) => x.entity), ...new Set([...m.lightsOf.values(), ...[...m.countOf.values()].filter(Boolean)].flat())];
  }

  _extraDeps() {
    return [this._area, this._fired?.at];
  }

  _emptyKey(m) {
    return m.scenes.length || m.scripts.length ? null : "no_data";
  }

  // The areas to filter on: those of the scenes and scripts shown, when there are two at least.
  _areas(m) {
    if (this._config.show_area_filter === false) return [];
    const ids = [...new Set([...m.scenes, ...m.scripts].map((x) => x.area).filter(Boolean))];
    const list = ids.map((id) => ({ id, name: this._areaName(id) })).sort((a, b) => a.name.localeCompare(b.name));
    return list.length > 1 ? list : [];
  }

  _areaName(id) {
    return this._hass.areas?.[id]?.name || id;
  }

  _inArea(x) {
    return !this._area || x.area === this._area;
  }

  // The icon of a scene or script: the one set in the card or in Home Assistant, else one from its name.
  _icon(x, fallback) {
    // A state icon only when it is an icon name: SmartThings scenes carry a numeric code of their own ("203").
    const own = this._s(x.entity)?.attributes?.icon;
    const icon = x.icon || (typeof own === "string" && own.includes(":") ? own : null);
    if (icon) return { html: `<ha-icon icon="${esc(icon)}"></ha-icon>`, key: null };
    const key = iconFor(x.name, null);
    return { html: svgIcon(ICONS[key || fallback]), key };
  }

  _color(x, key) {
    // SmartThings scenes have a color of their own (a hex code).
    const own = this._s(x.entity)?.attributes?.color;
    const hex = typeof own === "string" && /^#?[0-9a-f]{6}$/i.test(own) ? (own.startsWith("#") ? own : `#${own}`) : null;
    // A very light color (cream, pale yellow) would leave its icon unreadable: darkened.
    const light = hex && luminance(hex) > 0.6;
    return x.color || (hex && (light ? `color-mix(in srgb, ${hex} 55%, #000)` : hex)) || (key && TINTS[key]) || "var(--sc-accent)";
  }

  // The lights a scene set that are on; 0 when the card can't tell which lights the scene sets.
  _lightsOn(m, x) {
    return (m.countOf.get(x.entity) || []).filter((id) => this._s(id)?.state === "on").length;
  }

  _summary(m) {
    const active = activeScenes(this._hass, m);
    // Running scripts are not shown anywhere when the scripts are hidden.
    const running = this._config.show_scripts === false ? [] : m.scripts.filter((x) => this._s(x.entity)?.state === "on");
    const on = m.scenes.filter((x) => active.has(x.entity));
    // Without an active scene, the hero says so: the subtitle stays empty then.
    const heroShown = this._config.show_hero !== false;
    const sub = on.length ? this._t("active_scene", { name: on.map((x) => x.name).join(", ") }) : m.scenes.length && !heroShown ? this._t("no_active") : "";
    const chip = running.length ? { cls: "accent", text: running.length === 1 ? this._t("running") : this._t("running_n", { n: running.length }), entity: running[0].entity } : null;
    return { active, running, on, sub, chip };
  }

  _onDisconnect() {
    clearTimeout(this._fireTimer);
  }

  _firing(id) {
    return this._fired?.id === id && Date.now() - this._fired.at < FIRE_MS;
  }

  _when(t) {
    return fmtRelative(this._hass, this._config, t);
  }

  // The hero: the active scene in big with where and when, its lights on and the running scripts; greyed without.
  _hero(m, sum) {
    // The area filter applies to the hero too.
    const x = sum.on.find((o) => this._inArea(o));
    const running = sum.running.filter((r) => this._inArea(r));
    const lines = [];
    if (x) {
      const t = activatedAt(this._s(x.entity));
      const where = [x.area && this._areaName(x.area), t && this._t("activated", { when: this._when(t) })].filter(Boolean).join(" · ");
      if (where) lines.push(`<div class="line">${svgIcon(ICONS.marker)}<span>${esc(where)}</span></div>`);
      const n = this._lightsOn(m, x);
      if (n) lines.push(`<div class="line">${svgIcon(ICONS.bulb)}<span>${esc(this._t("lights_on", { n }))}</span></div>`);
    }
    for (const r of running.slice(0, 2)) {
      lines.push(`<div class="line accent clickable"${moreInfo(r.entity)}>${svgIcon(ICONS.script)}<span>${esc(`${r.name} · ${this._t("running")}`)}</span></div>`);
    }
    const icon = x && this._icon(x, "palette");
    const big = x
      ? `<div class="big" style="--c: ${esc(this._color(x, icon.key))}">${icon.html}<b>${esc(x.name)}</b><span>${esc(this._t("active").toLowerCase())}</span></div>`
      : `<div class="big none"><b>${esc(this._t("no_active"))}</b></div>`;
    return `<div class="hero"><div class="hero-art${x ? "" : " off"}">${ART}</div><div class="hero-body">${big}${lines.join("")}</div></div>`;
  }

  _scene(m, x, sum) {
    const on = sum.active.has(x.entity);
    const { html, key } = this._icon(x, "palette");
    const color = this._color(x, key);
    const t = activatedAt(this._s(x.entity));
    const when = on ? this._t("active") : this._config.show_last === false ? "" : t ? this._when(t) : this._t("never");
    const n = on ? this._lightsOn(m, x) : 0;
    const cls = `tile${on ? " tint" : ""}${this._firing(x.entity) ? " fire" : ""}`;
    return `<button class="${cls}" data-action="activate" data-entity="${esc(x.entity)}" style="--c: ${esc(color)}" aria-pressed="${on}" aria-label="${esc(
      `${x.name}${on ? ` · ${this._t("active")}` : ""}`,
    )}">
      <span class="ripple" aria-hidden="true"></span>
      <span class="tile-head"><span class="row-icon${on ? "" : " idle"}">${html}${on ? `<span class="badge">${svgIcon(ICONS.check)}</span>` : ""}</span>
        <span class="row-text"><span class="row-name">${esc(x.name)}</span>${when ? `<span class="row-state${on ? " accent" : ""}">${esc(when)}</span>` : ""}</span></span>
      ${n ? `<span class="badges"><span class="pill">${svgIcon(ICONS.bulb)}${n}</span></span>` : ""}
    </button>`;
  }

  _script(x) {
    const s = this._s(x.entity);
    const running = s?.state === "on";
    const { html } = this._icon(x, "script");
    const last = parseTime(s?.attributes?.last_triggered);
    const current = Number(s?.attributes?.current) || 0;
    const meta = running
      ? current > 1
        ? this._t("running_n", { n: current })
        : this._t("running")
      : this._config.show_last === false
        ? ""
        : last
          ? this._t("last_run", { when: this._when(last) })
          : this._t("never_run");
    const off = !s || s.state === "unavailable";
    const label = running ? this._t("stop") : this._t("run");
    return `<div class="row">
      <div class="row-icon${running ? " accent" : " idle"}">${running ? ring(44, 3, 0.3).replace('class="ring-svg"', 'class="ring-svg spin"') : ""}${html}</div>
      <div class="row-text clickable" role="button" tabindex="0" data-entity="${esc(x.entity)}"><div class="row-name">${esc(x.name)}</div>${meta ? `<div class="row-state${running ? " accent" : ""}">${esc(meta)}</div>` : ""}</div>
      <button class="btn${running ? " primary" : ""}" data-action="${running ? "stop" : "run"}" data-entity="${esc(x.entity)}" title="${esc(label)}" aria-label="${esc(`${label} · ${x.name}`)}"${off ? " disabled" : ""}>${svgIcon(running ? ICONS.stop : ICONS.play)}<span>${esc(label)}</span></button>
    </div>`;
  }

  _head(sum, sub) {
    return this._header({ icon: ICONS.palette, cls: sum.on.length || sum.running.length ? "accent" : "idle", title: this._config.title || this._t("scenes"), sub, chip: sum.chip });
  }

  _render() {
    const { m, error } = this._ready();
    if (error) return error;
    const c = this._config;
    const sum = this._summary(m);
    const areas = this._areas(m);
    if (this._area && !areas.some((a) => a.id === this._area)) this._area = null;
    const parts = [];
    if (c.show_hero !== false && m.scenes.length) parts.push(this._hero(m, sum));
    if (areas.length) {
      const chip = (id, name) => `<button class="area${(this._area || null) === id ? " on" : ""}" data-action="area" data-area="${esc(id || "")}" aria-pressed="${(this._area || null) === id}">${esc(name)}</button>`;
      parts.push(`<div class="areas" role="group" aria-label="${esc(this._t("areas"))}">${chip(null, this._t("all"))}${areas.map((a) => chip(a.id, a.name)).join("")}</div>`);
    }
    const before = parts.length;
    const scenes = m.scenes.filter((x) => this._inArea(x));
    const scripts = m.scripts.filter((x) => this._inArea(x));
    if (c.show_scenes !== false && scenes.length) {
      parts.push(this._section("scenes", ICONS.palette, this._t("scenes"), scenes.length, `<div class="tiles">${scenes.map((x) => this._scene(m, x, sum)).join("")}</div>`));
    }
    if (c.show_scripts !== false && scripts.length) {
      parts.push(this._section("scripts", ICONS.script, this._t("scripts"), scripts.length, `<div class="rows">${scripts.map((x) => this._script(x)).join("")}</div>`));
    }
    if (parts.length === before) parts.push(`<div class="empty">${esc(this._t("nothing_here"))}</div>`);
    return `<style>${BASE_STYLE}${SCENE_STYLE}</style>
      <ha-card>
        ${this._head(sum, sum.sub)}
        <div class="content">${parts.join("")}</div>
      </ha-card>`;
  }

  _action(action, el) {
    const id = el.dataset.entity;
    if (action === "area") {
      this._area = el.dataset.area || null;
      this._update();
      return true;
    }
    if (action === "activate") {
      this._call("scene", "turn_on", { entity_id: id });
      this._fired = { id, at: Date.now() };
      // Drawn again once the ripple is over.
      clearTimeout(this._fireTimer);
      this._fireTimer = setTimeout(() => {
        this._lastDeps = null;
        this._update();
      }, FIRE_MS + 50);
      this._update();
      return true;
    }
    if (action === "run") this._call("script", "turn_on", { entity_id: id });
    else if (action === "stop") this._call("script", "turn_off", { entity_id: id });
    else return false;
    return true;
  }
}

class SceneMiniCard extends withMini(SceneCard) {
  static getConfigElement() {
    return document.createElement("scene-mini-card-editor");
  }

  _renderMini() {
    const { m, error } = this._ready();
    if (error) return error;
    const sum = this._summary(m);
    const lines = [];
    if (sum.on.length) lines.push(`<div class="line accent clickable"${moreInfo(sum.on[0].entity)}>${svgIcon(ICONS.check)}<span>${esc(this._t("active_scene", { name: sum.on.map((x) => x.name).join(", ") }))}</span></div>`);
    for (const x of sum.running.slice(0, 2)) lines.push(`<div class="line accent clickable"${moreInfo(x.entity)}>${svgIcon(ICONS.script)}<span>${esc(`${x.name} · ${this._t("running")}`)}</span></div>`);
    if (!lines.length) lines.push(`<div class="line">${svgIcon(ICONS.palette)}<span>${esc(this._t("no_active"))}</span></div>`);
    // The first scenes as round buttons (`mini_count`, 3 by default).
    const n = clamp(Number(this._config.mini_count ?? 3), 0, 6);
    const picks = m.scenes.slice(0, n).map((x) => {
      const on = sum.active.has(x.entity);
      const { html, key } = this._icon(x, "palette");
      return `<button class="btn round${on ? " on" : ""}" data-action="activate" data-entity="${esc(x.entity)}" style="--c: ${esc(this._color(x, key))}" title="${esc(x.name)}" aria-label="${esc(x.name)}" aria-pressed="${on}">${html}</button>`;
    });
    return `<style>${BASE_STYLE}${SCENE_STYLE}${MINI_STYLE}</style>
      <ha-card>
        ${this._head(sum, "")}
        <div class="content mini">
          <div class="mini-art${sum.on.length ? "" : " hero-art off"}">${ART}</div>
          <div class="info">${lines.join("")}</div>
          ${picks.length ? `<div class="controls picks">${picks.join("")}</div>` : ""}
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------

class SceneCardEditor extends EditorBase {
  static get toggles() {
    return [
      ["show_title", true],
      ["show_subtitle", true],
      ["show_hero", true],
      ["show_scenes", true],
      ["show_scripts", true],
      ["show_area_filter", true],
      ["show_last", true],
    ];
  }

  static get sections() {
    return ["scenes", "scripts"];
  }

  _fields() {
    return [
      { name: "scenes", selector: { entity: { multiple: true, domain: "scene" } } },
      { name: "scripts", selector: { entity: { multiple: true, domain: "script" } } },
      { name: "area", selector: { area: { multiple: true } } },
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus its own.
class SceneMiniCardEditor extends SceneCardEditor {
  static get toggles() {
    return [...SceneCardEditor.toggles, ["zoom", true]];
  }

  _fields() {
    return [...super._fields(), { name: "mini_count", selector: { number: { min: 0, max: 6, mode: "box" } } }];
  }
}

register(
  [
    ["scene-card", SceneCard, { name: "Scene Card", description: "Scenes in a grid with the active one highlighted, scripts with their running state, filtered by area." }],
    ["scene-mini-card", SceneMiniCard, { name: "Scene Mini Card", description: "Compact scenes: the active scene, the running scripts and buttons for the first scenes." }],
    ["scene-card-editor", SceneCardEditor],
    ["scene-mini-card-editor", SceneMiniCardEditor],
  ],
  "https://github.com/juju35/ha-scene-card",
);

console.info(`%c SCENE-CARD %c v${VERSION} `, "color: white; background: #8e24aa; font-weight: 700;", "color: #8e24aa; background: white; font-weight: 700;");
