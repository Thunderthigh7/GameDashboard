import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");

const clientPropertyLimit = Number(
  appSource.match(/const MAX_EVENT_DEFINITION_PROPERTIES = (\d+);/)?.[1],
);
const clientManagedValueLimit = Number(
  appSource.match(/const MAX_EVENT_PROPERTY_MANAGED_VALUES = (\d+);/)?.[1],
);
const serverPropertyLimit = Number(
  serverSource.match(/const MAX_CUSTOM_EVENT_PROPERTIES = (\d+);/)?.[1],
);
const serverKnownPropertyLimit = Number(
  serverSource.match(/const MAX_EVENT_DEFINITION_KNOWN_PROPERTIES = (\d+);/)?.[1],
);
const serverDefinitionLimit = Number(
  serverSource.match(/const MAX_EVENT_DEFINITIONS_PER_UNIVERSE = (\d+);/)?.[1],
);
const serverValueSettingsLimit = Number(
  serverSource.match(/const MAX_EVENT_PROPERTY_VALUE_SETTINGS = (\d+);/)?.[1],
);
const serverActiveValueLimit = Number(
  serverSource.match(/const MAX_EVENT_PROPERTY_ACTIVE_VALUES = (\d+);/)?.[1],
);
const markupPropertyLimit = Number(
  indexSource.match(/id="eventDefinitionPropertyCount">\s*0\s*\/\s*(\d+)</)?.[1],
);
assert.ok(Number.isInteger(clientPropertyLimit) && clientPropertyLimit > 0, "the client property limit should be explicit");
assert.equal(serverPropertyLimit, clientPropertyLimit, "client and server event property limits should match");
assert.equal(markupPropertyLimit, clientPropertyLimit, "the visible property counter should match the enforced limit");
assert.equal(clientPropertyLimit, 20, "an event should expose at most 20 active properties");
assert.equal(serverKnownPropertyLimit, 200, "an event should retain up to 200 known property names");
assert.equal(serverDefinitionLimit, 200, "a universe should retain up to 200 event definitions");
assert.equal(serverValueSettingsLimit, 400, "event definitions should retain a bounded value-setting history");
assert.equal(serverActiveValueLimit, 8, "each property should keep a readable maximum of eight visible managed values");
assert.equal(
  clientManagedValueLimit,
  serverActiveValueLimit,
  "the value manager and server should enforce the same per-property limit",
);
assert.notEqual(
  serverKnownPropertyLimit,
  clientPropertyLimit,
  "the known-property retention cap must remain independent from the active-property cap",
);

const ids = [...indexSource.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert.deepEqual(duplicateIds, [], "event-builder markup must not introduce duplicate IDs");

const createdPlaceholderPredicateStart = appSource.indexOf("function shouldRenderCreatedEventPlaceholder(");
const createdPlaceholderPredicateEnd = appSource.indexOf(
  "\nfunction ",
  createdPlaceholderPredicateStart + 1,
);
assert.ok(
  createdPlaceholderPredicateStart >= 0 && createdPlaceholderPredicateEnd > createdPlaceholderPredicateStart,
  "the newly created event placeholder predicate should remain extractable",
);
const createdPlaceholderPredicateSource = appSource.slice(
  createdPlaceholderPredicateStart,
  createdPlaceholderPredicateEnd,
);
const { shouldRenderCreatedEventPlaceholder } = Function(
  `"use strict";
  ${createdPlaceholderPredicateSource}
  return { shouldRenderCreatedEventPlaceholder };`,
)();
assert.equal(
  shouldRenderCreatedEventPlaceholder({
    name: "weapon_equipped",
    sourceType: "custom",
    count: 0,
    definition: { firstSeenAt: null, lastSeenAt: null },
  }),
  true,
  "a saved custom event that has never received data should render analytics placeholders",
);
assert.equal(
  shouldRenderCreatedEventPlaceholder({
    name: "weapon_equipped",
    sourceType: "custom",
    count: 0,
    definition: { firstSeenAt: 1000, lastSeenAt: 2000 },
  }),
  false,
  "an older event with no data in the selected range should retain the normal empty-range state",
);
assert.equal(
  shouldRenderCreatedEventPlaceholder({
    name: "weapon_equipped",
    sourceType: "custom",
    count: 1,
    definition: { firstSeenAt: null, lastSeenAt: null },
  }),
  false,
  "an event response containing data should not be treated as awaiting its first event",
);
assert.match(
  appSource,
  /function renderEmptyCustomEventPropertyChart\([\s\S]*eventPropertyChartXLabel[\s\S]*eventPropertyChartGrid/,
  "an event awaiting data should render the normal chart axes and selected timeline",
);
assert.doesNotMatch(
  appSource,
  /Event created|Waiting for first event|eventPropertyPlaceholderMessage/,
  "the empty chart should not cover the normal graph with placeholder messaging",
);
const createdPlaceholderCardStart = appSource.indexOf("function renderCreatedEventPropertyPlaceholder(");
const createdPlaceholderCardEnd = appSource.indexOf("\nfunction ", createdPlaceholderCardStart + 1);
const createdPlaceholderCardSource = appSource.slice(createdPlaceholderCardStart, createdPlaceholderCardEnd);
assert.doesNotMatch(
  createdPlaceholderCardSource,
  /renderEventPropertyAverageLegend|eventPropertyAverageLegend/,
  "an event with no received property values should not render legend keys",
);
assert.match(appSource, /eventPropertyRankedEmptyRow[\s\S]*No data yet/, "the empty ranked breakdown should remain visible");

const eventExitIndex = indexSource.indexOf('id="eventExitButton"');
const newEventIndex = indexSource.indexOf('id="newEventButton"');
const trackedEventsIndex = indexSource.indexOf("<h2>Tracked events</h2>");
const eventCatalogIndex = indexSource.indexOf('id="eventCatalog"');
assert.ok(eventExitIndex >= 0, "Events should expose a clear dashboard exit");
assert.ok(
  newEventIndex > eventExitIndex
    && trackedEventsIndex > newEventIndex
    && eventCatalogIndex > trackedEventsIndex,
  "New event should sit above the tracked-event catalog",
);

for (const id of [
  "eventDefinitionForm",
  "eventDefinitionName",
  "eventDefinitionPropertyEditor",
  "eventDefinitionHiddenProperties",
  "eventDefinitionHiddenPropertiesTitle",
  "eventDefinitionHiddenPropertyList",
  "addEventDefinitionPropertyButton",
  "eventLuauPreview",
  "copyEventCodeButton",
  "saveEventDefinitionButton",
  "editEventButton",
  "deleteSelectedEventButton",
  "eventConfirmDialog",
  "eventValueManagerDialog",
  "eventValueManagerList",
  "eventValueManagerAddButton",
  "eventValueManagerSaveButton",
]) {
  assert.match(indexSource, new RegExp(`id="${id}"`), `${id} should exist in the Events workflow`);
}
for (const removedId of [
  "viewEventJsonButton",
  "eventJsonTab",
  "eventJsonPreview",
  "downloadEventJsonButton",
  "eventDefinitionModeBadge",
  "eventKeyModeAuto",
  "eventKeyModeManual",
]) {
  assert.doesNotMatch(
    indexSource,
    new RegExp(`id="${removedId}"`),
    `${removedId} should not appear in the Luau-only Events workflow`,
  );
}
assert.match(indexSource, /id="eventCodePreviewTitle">Roblox Luau</, "the generated-code panel should be explicitly Luau");
const eventCatalogRendererStart = appSource.indexOf("function renderEventCatalog(");
const eventCatalogRendererEnd = appSource.indexOf("\nfunction getSelectedEventCatalogItem(", eventCatalogRendererStart);
assert.ok(eventCatalogRendererStart >= 0 && eventCatalogRendererEnd > eventCatalogRendererStart, "the tracked-event renderer should remain extractable");
const eventCatalogRendererSource = appSource.slice(eventCatalogRendererStart, eventCatalogRendererEnd);
assert.doesNotMatch(eventCatalogRendererSource, /<small>|Auto keys|Manual keys|Not configured|Automatic/, "tracked events should render names only");

assert.match(
  styleSource,
  /body\[data-active-view="events"\]:not\(\.isLocked\) \.sidebar,\s*body\[data-active-view="funnels"\]:not\(\.isLocked\) \.sidebar\s*\{[^}]*display:\s*none;/,
  "the global sidebar should collapse while Events or Funnels owns the workspace rail",
);
assert.match(
  styleSource,
  /body\[data-active-view="events"\]:not\(\.isLocked\) \.appShell,\s*body\[data-active-view="funnels"\]:not\(\.isLocked\) \.appShell\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/,
  "Events and Funnels should reclaim the collapsed sidebar space",
);
assert.match(styleSource, /\.eventConfirmBackdrop\s*\{[^}]*position:\s*fixed;/, "destructive actions should use a themed modal");
const compact1180Start = styleSource.indexOf("@media (max-width: 1180px)");
const compact1180End = styleSource.indexOf("\n@media ", compact1180Start + 1);
assert.ok(compact1180Start >= 0, "the 1180px responsive block should exist");
const compact1180Source = styleSource.slice(
  compact1180Start,
  compact1180End > compact1180Start ? compact1180End : styleSource.length,
);
assert.match(
  compact1180Source,
  /body\.isEditingEventDefinition \.eventCatalogPanel\s*\{[^}]*display:\s*none;/,
  "the builder should read as its own page on compact screens",
);

assert.match(appSource, /newEventButton\?\.addEventListener\("click", startNewEventDefinition\)/, "New event should open the builder");
assert.match(appSource, /editEventButton\?\.addEventListener\("click"/, "existing custom events should be editable");
assert.match(appSource, /deleteSelectedEventButton\?\.addEventListener\("click", deleteSelectedCustomEvent\)/, "existing custom events should be deletable");
const clientSaveStart = appSource.indexOf("async function saveEventDefinition(");
const clientSaveEnd = appSource.indexOf("\nfunction setEventDefinitionFormDisabled(", clientSaveStart);
assert.ok(clientSaveStart >= 0 && clientSaveEnd > clientSaveStart, "the client definition save should remain extractable");
const clientSaveSource = appSource.slice(clientSaveStart, clientSaveEnd);
assert.match(
  clientSaveSource,
  /universeId:\s*Number\(selectedUniverseId\)[\s\S]*eventName:\s*validated\.eventName[\s\S]*properties:\s*validated\.properties[\s\S]*hiddenPropertyNames:\s*validated\.hiddenPropertyNames/,
  "saving should send the selected universe, event name, typed property definitions, and hidden property names",
);
assert.doesNotMatch(
  clientSaveSource,
  /\bkeyMode\b/,
  "the unified client save payload must not send a legacy key mode",
);
assert.doesNotMatch(
  appSource,
  /eventKeyMode(?:Auto|Manual)|function\s+(?:getSelectedEventDefinitionKeyMode|handleEventDefinitionModeChange)\s*\(/,
  "legacy key-mode controls and client helpers should be removed",
);
const hiddenActionStart = appSource.indexOf("function handleEventDefinitionHiddenPropertyAction(");
const hiddenActionEnd = appSource.indexOf("\nfunction addEventDefinitionProperty(", hiddenActionStart);
assert.ok(hiddenActionStart >= 0 && hiddenActionEnd > hiddenActionStart, "the hidden-property restore action should remain extractable");
const hiddenActionSource = appSource.slice(hiddenActionStart, hiddenActionEnd);
assert.ok(
  hiddenActionSource.indexOf("eventDefinitionProperties.length >= MAX_EVENT_DEFINITION_PROPERTIES")
    < hiddenActionSource.indexOf("eventDefinitionHiddenPropertyNames.delete(name)"),
  "restoring at the active-property limit must keep the hidden tombstone intact",
);
assert.match(
  hiddenActionSource,
  /const hiddenType = eventDefinitionHiddenPropertyTypes\.get\(name\)[\s\S]*type:\s*hiddenType \|\|/,
  "restoring should reuse the hidden property's saved example type",
);
const clientValidationStart = appSource.indexOf("function validateEventDefinitionForm(");
const clientValidationEnd = appSource.indexOf("\nasync function saveEventDefinition(", clientValidationStart);
assert.ok(clientValidationStart >= 0 && clientValidationEnd > clientValidationStart, "the client definition validator should remain extractable");
assert.match(
  appSource.slice(clientValidationStart, clientValidationEnd),
  /for \(const hiddenName of hiddenPropertyNames\)[\s\S]*properties\.push\(\{[\s\S]*type:\s*eventDefinitionHiddenPropertyTypes\.get\(hiddenName\) \|\| "string"/,
  "saving should retain hidden property type metadata outside the visible editor rows",
);
assert.match(
  appSource,
  /request\(`\/api\/events\?universeId=\$\{encodeURIComponent\(selectedUniverseId\)\}&eventName=\$\{encodeURIComponent\(catalogItem\.name\)\}`,[\s\S]*method:\s*"DELETE"/,
  "Delete event should remove both its dashboard history and definition",
);
assert.match(appSource, /function confirmUnsavedEventDefinition\(/, "unsaved event changes should be guarded");
assert.match(appSource, /window\.addEventListener\("hashchange", handleDashboardHashChange\)/, "browser navigation should use the unsaved-change guard");
assert.match(appSource, /window\.addEventListener\("beforeunload", handleEventDefinitionBeforeUnload\)/, "closing the page should guard unsaved event edits");
assert.doesNotMatch(
  appSource.slice(appSource.indexOf("function cancelEventDefinitionEdit("), appSource.indexOf("function getSeriesBucketMs(")),
  /window\.confirm/,
  "the Events workflow should use the themed confirmation dialog",
);
const observedTypeStart = appSource.indexOf("function getObservedEventDefinitionPropertyType(");
const observedTypeEnd = appSource.indexOf("\nfunction editSelectedEventDefinition(", observedTypeStart);
assert.ok(observedTypeStart >= 0 && observedTypeEnd > observedTypeStart, "the observed property type helper should remain extractable");
const { getObservedEventDefinitionPropertyType } = Function(
  `"use strict";
  ${appSource.slice(observedTypeStart, observedTypeEnd)}
  return { getObservedEventDefinitionPropertyType };`,
)();
assert.equal(
  getObservedEventDefinitionPropertyType({ type: "number", topValues: [] }),
  "number",
  "numeric properties should remain numeric",
);
assert.equal(
  getObservedEventDefinitionPropertyType({
    type: "category",
    topValues: [{ valueType: "boolean" }, { valueType: "boolean" }],
  }),
  "boolean",
  "observed booleans should remain booleans in generated examples",
);
assert.equal(
  getObservedEventDefinitionPropertyType({
    type: "category",
    topValues: [{ valueType: "boolean" }, { valueType: "string" }],
  }),
  "string",
  "mixed observed types should use a safe string example",
);
const normalizeEditorPropertiesStart = appSource.indexOf("function normalizeEventDefinitionEditorProperties(");
const normalizeEditorPropertiesEnd = appSource.indexOf("\nfunction setEventDefinitionBuilderVisible(", normalizeEditorPropertiesStart);
assert.ok(
  normalizeEditorPropertiesStart >= 0 && normalizeEditorPropertiesEnd > normalizeEditorPropertiesStart,
  "the unified editor property normalizer should remain extractable",
);
const { normalizeEditorPropertyTypes } = Function(
  `"use strict";
  const MAX_EVENT_DEFINITION_PROPERTIES = ${clientPropertyLimit};
  const eventDefinitionConfiguredPropertyNames = new Set(["configured"]);
  ${appSource.slice(normalizeEditorPropertiesStart, normalizeEditorPropertiesEnd)}
  return {
    normalizeEditorPropertyTypes() {
      return normalizeEventDefinitionEditorProperties(
        [
          { name: "configured", type: "string" },
          { name: "discovered", type: "string" },
        ],
        new Map([
          ["configured", "number"],
          ["discovered", "boolean"],
        ]),
      );
    },
  };`,
)();
assert.deepEqual(
  normalizeEditorPropertyTypes().map((property) => property.type),
  ["string", "boolean"],
  "configured example types should win while newly observed properties use their inferred type",
);
const propertyPathValidatorStart = appSource.indexOf("function isValidEventDefinitionPropertyPath(");
const propertyPathValidatorEnd = appSource.indexOf("\nfunction validateEventDefinitionForm(", propertyPathValidatorStart);
assert.ok(
  propertyPathValidatorStart >= 0 && propertyPathValidatorEnd > propertyPathValidatorStart,
  "the client property-path validator should remain extractable",
);
const { isValidEventDefinitionPropertyPath } = Function(
  `"use strict";
  ${appSource.slice(propertyPathValidatorStart, propertyPathValidatorEnd)}
  return { isValidEventDefinitionPropertyPath };`,
)();
assert.equal(isValidEventDefinitionPropertyPath("weapon.name"), true, "canonical nested property paths should remain valid");
assert.equal(isValidEventDefinitionPropertyPath("legacy.1"), true, "the client should accept legacy flat paths accepted by ingestion");
assert.equal(isValidEventDefinitionPropertyPath("legacy..value"), true, "the client should preserve editable legacy dotted keys");
assert.equal(isValidEventDefinitionPropertyPath(".invalid"), false, "property paths must still start with a letter");
assert.match(
  appSource,
  /Property names must be unique/,
  "duplicate property rows should be rejected instead of silently discarded",
);
assert.doesNotMatch(
  `${indexSource}\n${appSource}\n${styleSource}`,
  /eventDefinitionPropertySource|Auto keys|Manual keys|Switch to Manual keys/,
  "property rows should not show obsolete source or mode labels",
);

const generatorStart = appSource.indexOf("function formatLuauString(");
const generatorEnd = appSource.indexOf("\nfunction renderEventDefinitionCodePreviews(", generatorStart);
assert.ok(generatorStart >= 0 && generatorEnd > generatorStart, "event payload generators should remain extractable");
const { buildEventDefinitionLuauTemplate } = Function(
  `"use strict";
  const getEventDefinitionPreviewName = () => "weapon_equipped";
  const getEventDefinitionPreviewProperties = () => [
    { name: "weapon.name", type: "string" },
    { name: "damage", type: "number" },
    { name: "isCritical", type: "boolean" },
  ];
  ${appSource.slice(generatorStart, generatorEnd)}
  return { buildEventDefinitionLuauTemplate };`,
)();
const luauTemplate = buildEventDefinitionLuauTemplate();
assert.match(
  luauTemplate,
  /require\(ServerScriptService\.RoAnalytics\.API\)/,
  "the generated Luau should require the official RoAnalytics service path",
);
assert.match(luauTemplate, /\["weapon\.name"\] = "Example"/, "nested paths should be valid Luau keys");
assert.match(luauTemplate, /damage = 0/, "numeric properties should use numeric Luau examples");
assert.match(luauTemplate, /isCritical = false/, "boolean properties should use boolean Luau examples");
assert.match(luauTemplate, /RoAnalytics\.Log\("weapon_equipped",[\s\S]*, player\)/, "the generated code should log the event for a player");
assert.doesNotMatch(luauTemplate, /hiddenDebug/, "hidden properties should stay out of generated Luau");
const editorDefinitionStart = appSource.indexOf("function editSelectedEventDefinition(");
const editorDefinitionEnd = appSource.indexOf("\nfunction normalizeEventDefinitionEditorProperties(", editorDefinitionStart);
assert.ok(editorDefinitionStart >= 0 && editorDefinitionEnd > editorDefinitionStart, "the definition editor initializer should remain extractable");
assert.match(
  appSource.slice(editorDefinitionStart, editorDefinitionEnd),
  /\.filter\(\(property\) => !eventDefinitionHiddenPropertyNames\.has\(/,
  "the editor and its generated Luau should be initialized from visible properties only",
);

const syncPropertiesStart = appSource.indexOf("function syncEventDefinitionPropertiesFromEditor(");
const syncPropertiesEnd = appSource.indexOf("\nfunction handleEventDefinitionPropertyInput(", syncPropertiesStart);
assert.ok(syncPropertiesStart >= 0 && syncPropertiesEnd > syncPropertiesStart, "property synchronization should remain extractable");
const { syncOnePropertyRow } = Function(
  `"use strict";
  const MAX_EVENT_DEFINITION_PROPERTIES = ${clientPropertyLimit};
  let eventDefinitionProperties = [];
  let selectorUsed = "";
  const propertyRow = {
    dataset: { eventDefinitionPropertyDiscovered: "false" },
    querySelector(selector) {
      if (selector === "[data-event-definition-property-name]") return { value: "weapon.name" };
      if (selector === "[data-event-definition-property-type]") return { value: "string" };
      return null;
    },
  };
  const removeButton = {
    dataset: {},
    querySelector() { return null; },
  };
  const eventDefinitionPropertyEditor = {
    querySelectorAll(selector) {
      selectorUsed = selector;
      return selector === ".eventDefinitionPropertyRow[data-event-definition-property-index]"
        ? [propertyRow]
        : [propertyRow, removeButton];
    },
  };
  ${appSource.slice(syncPropertiesStart, syncPropertiesEnd)}
  return {
    syncOnePropertyRow() {
      syncEventDefinitionPropertiesFromEditor();
      return { selectorUsed, properties: eventDefinitionProperties };
    },
  };`,
)();
const synchronizedPropertyRows = syncOnePropertyRow();
assert.equal(
  synchronizedPropertyRows.selectorUsed,
  ".eventDefinitionPropertyRow[data-event-definition-property-index]",
  "property synchronization should select rows without also counting their remove buttons",
);
assert.equal(
  synchronizedPropertyRows.properties.length,
  1,
  "one visible property row should synchronize as exactly one property",
);

const definitionHelpersStart = serverSource.indexOf("function normalizeEventDefinition(");
const definitionHelpersEnd = serverSource.indexOf("\nfunction getAutoEventDefinitionId(", definitionHelpersStart);
assert.ok(definitionHelpersStart >= 0 && definitionHelpersEnd > definitionHelpersStart, "server definition helpers should remain extractable");
const {
  normalizeEventDefinition,
  serializeEventDefinition,
} = Function(
  `"use strict";
  const MAX_CUSTOM_EVENT_PROPERTIES = ${serverPropertyLimit};
  const MAX_EVENT_DEFINITION_KNOWN_PROPERTIES = ${serverKnownPropertyLimit};
  const MAX_EVENT_DEFINITION_STORED_PROPERTIES =
    MAX_EVENT_DEFINITION_KNOWN_PROPERTIES + MAX_CUSTOM_EVENT_PROPERTIES;
  const MAX_EVENT_PROPERTY_VALUE_SETTINGS = ${serverValueSettingsLimit};
  const MAX_EVENT_PROPERTY_ACTIVE_VALUES = ${serverActiveValueLimit};
  const EVENT_DEFINITION_PROPERTY_TYPES = new Set(["string", "number", "boolean"]);
  const SYSTEM_ANALYTICS_EVENT_NAMES = new Set(["player_died", "player_left", "chat_message"]);
  const crypto = { randomUUID: () => "event-test-id" };
  const cleanString = (value, maxLength = 1000) => String(value ?? "").slice(0, maxLength);
  const cleanInteger = (value) => Math.trunc(Number(value) || 0);
  const cleanTimestampMs = (value) => Math.max(0, Math.trunc(Number(value) || 0));
  const getCustomEventPropertyValueKey = (value) => \`\${typeof value}:\${String(value)}\`;
  const normalizeCustomEventName = (value) => {
    const eventName = cleanString(value, 64).trim().toLowerCase();
    return /^[a-z][a-z0-9_.:-]{0,63}$/.test(eventName) ? eventName : "";
  };
  const isValidCustomEventPropertyPath = (value) => (
    typeof value === "string"
    && value.length > 0
    && value.length <= 96
    && /^[A-Za-z][A-Za-z0-9_:-]*(?:\\[\\])?(?:\\.[A-Za-z][A-Za-z0-9_:-]*(?:\\[\\])?)*$/.test(value)
  );
  ${serverSource.slice(definitionHelpersStart, definitionHelpersEnd)}
  return { normalizeEventDefinition, serializeEventDefinition };`,
)();

const definitionContext = { ownerUserId: "owner-1", universeId: 123 };
assert.equal(
  normalizeEventDefinition({ eventName: "player_died" }, definitionContext).ok,
  false,
  "reserved automatic event names should not be configurable",
);
assert.equal(
  normalizeEventDefinition({
    eventName: "weapon_equipped",
    properties: [{ name: "weapon" }, { name: "weapon" }],
  }, definitionContext).ok,
  false,
  "duplicate server-side property names should be rejected",
);
assert.equal(
  normalizeEventDefinition({
    eventName: "too_many",
    properties: Array.from({ length: clientPropertyLimit + 1 }, (_, index) => ({ name: `property${index}` })),
  }, definitionContext).ok,
  false,
  "event definitions should enforce the configured property limit",
);
assert.equal(
  normalizeEventDefinition({
    eventName: "visible_plus_hidden",
    properties: [
      ...Array.from({ length: clientPropertyLimit }, (_, index) => ({ name: `visible${index}` })),
      { name: "hiddenNumber", type: "number" },
    ],
    hiddenPropertyNames: ["hiddenNumber"],
  }, definitionContext).ok,
  true,
  "hidden typed definitions should not consume one of the 20 active property slots",
);

const normalizedDefinition = normalizeEventDefinition({
  eventName: "Weapon_Equipped",
  properties: [
    { name: "weapon.name", type: "string" },
    { name: "damage", type: "number" },
    { name: "critical", type: "boolean" },
  ],
  hiddenPropertyNames: ["critical", "server.secret"],
  valueSettings: [
    {
      propertyName: "weapon.name",
      value: "Shotgun",
      valueType: "string",
      color: "#9B6DFF",
      displayName: "Pump Shotgun",
      manual: true,
    },
    {
      propertyName: "weapon.name",
      value: "Sniper",
      valueType: "string",
      hidden: true,
    },
  ],
}, definitionContext);
assert.equal(normalizedDefinition.ok, true);
assert.equal(normalizedDefinition.value.eventName, "weapon_equipped", "event names should normalize to lowercase");
assert.deepEqual(
  normalizedDefinition.value.properties.map((property) => property.type),
  ["string", "number", "boolean"],
  "configured example types should be retained",
);
assert.deepEqual(
  normalizedDefinition.value.valueSettings,
  [
    {
      propertyName: "weapon.name",
      value: "Shotgun",
      valueType: "string",
      color: "#9b6dff",
      manual: true,
      hidden: false,
      displayName: "Pump Shotgun",
    },
    {
      propertyName: "weapon.name",
      value: "Sniper",
      valueType: "string",
      color: "",
      manual: false,
      hidden: true,
    },
  ],
  "manual values, colors, and suppressed discoveries should normalize into the saved definition",
);
assert.equal(
  normalizeEventDefinition({
    eventName: "invalid_color",
    valueSettings: [{ propertyName: "weapon", value: "Shotgun", color: "purple" }],
  }, definitionContext).ok,
  false,
  "saved value colors should require canonical six-digit hex values",
);
assert.equal(
  normalizeEventDefinition({
    eventName: "too_many_values",
    valueSettings: Array.from({ length: serverActiveValueLimit + 1 }, (_, index) => ({
      propertyName: "weapon",
      value: `Weapon ${index}`,
      color: "#9b6dff",
      manual: true,
    })),
  }, definitionContext).ok,
  false,
  "a property should reject more visible managed values than the chart can clearly display",
);

const mergedDefinition = serializeEventDefinition({
  ...normalizedDefinition.value,
  discoveredPropertyNames: ["weapon.name", "region", "server.secret"],
});
assert.deepEqual(
  mergedDefinition.effectiveProperties.map((property) => property.name),
  ["weapon.name", "damage", "region"],
  "configured properties should lead the active list before visible discoveries",
);
assert.deepEqual(
  mergedDefinition.effectiveProperties.map((property) => property.type),
  ["string", "number", "string"],
  "configured example types should survive the configured-first merge",
);
assert.deepEqual(
  mergedDefinition.hiddenPropertyNames,
  ["critical", "server.secret"],
  "explicitly hidden configured and discovered properties should remain excluded",
);
assert.equal(
  mergedDefinition.properties.find((property) => property.name === "critical")?.type,
  "boolean",
  "hidden configured properties should retain their example type for later restoration",
);
assert.equal(
  mergedDefinition.effectiveProperties.some((property) => ["critical", "server.secret"].includes(property.name)),
  false,
  "hidden properties must not enter the active property list",
);
assert.equal(Object.hasOwn(mergedDefinition, "keyMode"), false, "serialized definitions should omit legacy keyMode");
assert.equal(
  mergedDefinition.valueSettings[0].color,
  "#9b6dff",
  "serialized definitions should return saved series colors to the dashboard",
);

const cappedDefinition = serializeEventDefinition({
  ...normalizedDefinition.value,
  properties: [{ name: "preset", type: "number" }],
  hiddenPropertyNames: [],
  discoveredPropertyNames: Array.from({ length: clientPropertyLimit + 5 }, (_, index) => `observed${index}`),
});
assert.equal(
  cappedDefinition.effectiveProperties.length,
  clientPropertyLimit,
  "the active configured-plus-discovered list should remain capped at 20",
);
assert.equal(cappedDefinition.effectiveProperties[0].name, "preset", "configured properties should stay first at the cap");

const legacyAutoDefinition = serializeEventDefinition({
  id: "legacy-auto",
  universeId: 123,
  eventName: "legacy_auto",
  keyMode: "auto",
  properties: [{ name: "preset", type: "number" }],
  discoveredPropertyNames: ["preset", "autoDiscovered"],
});
assert.deepEqual(
  legacyAutoDefinition.effectiveProperties.map((property) => property.name),
  ["preset", "autoDiscovered"],
  "legacy Auto definitions should migrate with discovered properties visible",
);
assert.deepEqual(legacyAutoDefinition.hiddenPropertyNames, [], "legacy Auto migration should not hide discoveries");
assert.equal(Object.hasOwn(legacyAutoDefinition, "keyMode"), false, "legacy Auto serialization should drop keyMode");

const legacyManualDefinition = serializeEventDefinition({
  id: "legacy-manual",
  universeId: 123,
  eventName: "legacy_manual",
  keyMode: "manual",
  properties: [{ name: "preset", type: "string" }],
  discoveredPropertyNames: ["preset", "manualDiscovered", "manualExtra"],
});
assert.deepEqual(
  legacyManualDefinition.effectiveProperties.map((property) => property.name),
  ["preset"],
  "legacy Manual definitions should keep only configured properties visible",
);
assert.deepEqual(
  legacyManualDefinition.hiddenPropertyNames,
  ["manualDiscovered", "manualExtra"],
  "legacy Manual discoveries that were not configured should migrate to hidden properties",
);

assert.match(serverSource, /url\.pathname === "\/api\/event-definitions" && req\.method === "GET"/, "definitions should have an authenticated GET route");
assert.match(serverSource, /url\.pathname === "\/api\/event-definitions" && req\.method === "POST"/, "definitions should have an authenticated save route");
assert.match(serverSource, /eventDefinitionMatch && req\.method === "DELETE"/, "definitions should have an authenticated delete route");
assert.match(serverSource, /remainingSlots = Math\.max\(MAX_EVENT_DEFINITIONS_PER_UNIVERSE/, "Mongo schema discovery should enforce the definition cap");
assert.match(
  serverSource,
  /discoverEventDefinitionsFromPresence\(presence\.value\)\.catch\(/,
  "schema discovery failures should never interrupt heartbeat ingestion",
);
const discoveryStart = serverSource.indexOf("async function discoverEventDefinitionsFromPresence(");
const discoveryEnd = serverSource.indexOf("\nasync function readEventDefinitions(", discoveryStart);
assert.ok(discoveryStart >= 0 && discoveryEnd > discoveryStart, "schema discovery should remain extractable");
const discoverySource = serverSource.slice(discoveryStart, discoveryEnd);
assert.match(
  discoverySource,
  /const deletionCutoffs = await getCustomEventDeletionCutoffs\(universeId\);[\s\S]*occurredAt <= deletedAt\) continue;/,
  "schema discovery should ignore delayed event payloads at or before a durable deletion cutoff",
);
assert.match(
  discoverySource,
  /withEventDefinitionMutationLock\(ownerUserId,\s*universeId,[\s\S]*currentDeletionCutoffs = await getCustomEventDeletionCutoffs\(universeId\);[\s\S]*buildEventDefinitionDiscoveries\(incomingEvents,\s*currentDeletionCutoffs\)/,
  "Mongo schema discovery should revalidate deletion cutoffs after acquiring its mutation lock",
);
assert.match(
  discoverySource,
  /withLocalEventDefinitionStoreLock\([\s\S]*currentDeletionCutoffs = await getCustomEventDeletionCutoffs\(universeId\);[\s\S]*buildEventDefinitionDiscoveries\(incomingEvents,\s*currentDeletionCutoffs\)/,
  "local schema discovery should revalidate deletion cutoffs after acquiring its store lock",
);
assert.match(
  discoverySource,
  /hiddenPropertyNames:\s*\{[\s\S]*\$isArray:\s*"\$hiddenPropertyNames"[\s\S]*existingState\.hiddenPropertyNames/,
  "Mongo discovery should preserve explicit hidden names and legacy migrated hidden names",
);
assert.match(
  discoverySource,
  /valueSettings:\s*\{\s*\$ifNull:\s*\["\$valueSettings",\s*\[\]\]\s*\}/,
  "automatic property discovery should preserve saved value names, colors, and suppressions",
);
assert.match(
  discoverySource,
  /\$reduce:\s*\{[\s\S]*\$concatArrays:[\s\S]*\$in:\s*\["\$\$this",\s*"\$\$value"\]/,
  "Mongo discovery should append and deduplicate names while preserving first-seen order",
);
assert.doesNotMatch(
  discoverySource,
  /\$setUnion/,
  "Mongo discovery must not use order-undefined set union before applying the known-name cap",
);
assert.match(
  discoverySource,
  /\{\s*\$unset:\s*"keyMode"\s*\}/,
  "Mongo discovery should remove the legacy keyMode field",
);
assert.match(
  discoverySource,
  /definition\.hiddenPropertyNames = propertyState\.hiddenPropertyNames;[\s\S]*delete definition\.keyMode;/,
  "local discovery should preserve hidden names while removing legacy keyMode",
);
assert.match(
  serverSource,
  /await persistCustomEventDeletionCutoff\([\s\S]*const currentEvents = customEventsByUniverseId/,
  "a deletion cutoff should be durable before in-memory history is removed",
);
assert.match(serverSource, /custom-event-deletions\.json/, "local deployments should persist event-deletion cutoffs");
const deletionCutoffLoaderStart = serverSource.indexOf("async function getCustomEventDeletionCutoffs(");
const deletionCutoffLoaderEnd = serverSource.indexOf("\nasync function readLocalCustomEventDeletionStore(", deletionCutoffLoaderStart);
const deletionCutoffLoaderSource = serverSource.slice(deletionCutoffLoaderStart, deletionCutoffLoaderEnd);
assert.match(
  deletionCutoffLoaderSource,
  /const latest = customEventDeletionCutoffsByUniverseId\.get\(universeKey\)[\s\S]*Math\.max\([\s\S]*customEventDeletionCutoffsByUniverseId\.set\(universeKey,\s*mergedCutoffs\)/,
  "concurrent cutoff loads should merge monotonically instead of replacing newer cached deletions",
);
const eventDetailStart = serverSource.indexOf("function buildCustomEventDetail(");
const eventDetailEnd = serverSource.indexOf("\nfunction buildCustomEventSeries(", eventDetailStart);
assert.ok(eventDetailStart >= 0 && eventDetailEnd > eventDetailStart, "the event detail builder should remain extractable");
let capturedAllowedPropertyNames = [];
const { buildCustomEventDetail } = Function(
  `"use strict";
  const MAX_CUSTOM_EVENT_PROPERTIES = ${serverPropertyLimit};
  const MAX_EVENT_DEFINITION_KNOWN_PROPERTIES = ${serverKnownPropertyLimit};
  const MAX_EVENT_DEFINITION_STORED_PROPERTIES =
    MAX_EVENT_DEFINITION_KNOWN_PROPERTIES + MAX_CUSTOM_EVENT_PROPERTIES;
  const MAX_EVENT_PROPERTY_VALUE_SETTINGS = ${serverValueSettingsLimit};
  const MAX_EVENT_PROPERTY_ACTIVE_VALUES = ${serverActiveValueLimit};
  const MAX_CUSTOM_EVENT_RECENT_RESPONSE = 100;
  const MAX_CUSTOM_EVENT_PROPERTY_VALUES_RESPONSE = 100;
  const EVENT_DEFINITION_PROPERTY_TYPES = new Set(["string", "number", "boolean"]);
  const SYSTEM_ANALYTICS_EVENT_NAMES = new Set(["player_died", "player_left", "chat_message"]);
  const crypto = { randomUUID: () => "event-test-id" };
  const cleanInteger = (value) => Math.trunc(Number(value) || 0);
  const cleanString = (value, maxLength = 1000) => String(value ?? "").slice(0, maxLength);
  const cleanTimestampMs = (value) => Math.max(0, Math.trunc(Number(value) || 0));
  const getCustomEventPropertyValueKey = (value) => \`\${typeof value}:\${String(value)}\`;
  const normalizeCustomEventName = (value) => {
    const eventName = cleanString(value, 64).trim().toLowerCase();
    return /^[a-z][a-z0-9_.:-]{0,63}$/.test(eventName) ? eventName : "";
  };
  const isValidCustomEventPropertyPath = (value) => (
    typeof value === "string"
    && value.length > 0
    && value.length <= 96
    && /^[A-Za-z][A-Za-z0-9_:-]*(?:\\[\\])?(?:\\.[A-Za-z][A-Za-z0-9_:-]*(?:\\[\\])?)*$/.test(value)
  );
  ${serverSource.slice(definitionHelpersStart, definitionHelpersEnd)}
  const buildCustomEventSeries = () => ({
    bucketMs: 60_000,
    availableIntervals: ["1m"],
    selectedInterval: "1m",
    buckets: [],
    rangeStart: 0,
    rangeEnd: 0,
  });
  let allowedNames = [];
  const summarizeCustomEventProperties = (events, valueLimit, selectedName, options) => {
    allowedNames = [...options.allowedPropertyNames];
    return [...new Set(events.flatMap((event) => Object.keys(event.properties || {})))]
      .filter((name) => options.allowedPropertyNames.has(name))
      .map((name) => ({ name }));
  };
  ${serverSource.slice(eventDetailStart, eventDetailEnd)}
  return {
    buildCustomEventDetail(...args) {
      const result = buildCustomEventDetail(...args);
      return { result, getAllowedNames: () => allowedNames };
    },
  };`,
)();
const rawEventWithHiddenProperty = {
  id: "event-1",
  userId: 1,
  sessionId: "session-1",
  occurredAt: 1_000,
  properties: {
    preset: "Shotgun",
    visibleObserved: "Arena",
    hiddenDebug: true,
  },
};
const hiddenDetailRun = buildCustomEventDetail("weapon_equipped", [rawEventWithHiddenProperty], {
  definition: {
    properties: [{ name: "preset", type: "string" }],
    discoveredPropertyNames: ["preset", "visibleObserved", "hiddenDebug"],
    hiddenPropertyNames: ["hiddenDebug"],
  },
  recentLimit: 7,
  propertyValueLimit: 4,
});
capturedAllowedPropertyNames = hiddenDetailRun.getAllowedNames();
assert.deepEqual(
  capturedAllowedPropertyNames,
  ["preset", "visibleObserved"],
  "property breakdowns should allow configured fields and visible discoveries only",
);
assert.deepEqual(
  hiddenDetailRun.result.properties.map((property) => property.name),
  ["preset", "visibleObserved"],
  "hidden fields should be excluded from property breakdowns",
);
assert.deepEqual(
  hiddenDetailRun.result.observedPropertyNames,
  ["preset", "visibleObserved"],
  "hidden fields should be excluded from observedPropertyNames",
);
assert.equal(
  hiddenDetailRun.result.recentEvents[0].properties.hiddenDebug,
  true,
  "display filtering should retain hidden fields in raw recent event records",
);

const valueSettingsHelperStart = serverSource.indexOf("function normalizeEventDefinitionValueSettings(");
const valueSettingsHelperEnd = serverSource.indexOf("\nfunction getEventDefinitionPropertyState(", valueSettingsHelperStart);
const propertySummaryStart = serverSource.indexOf("function summarizeCustomEventProperties(");
const propertySummaryEnd = serverSource.indexOf("\nasync function getFunnelsFromQuery(", propertySummaryStart);
assert.ok(
  valueSettingsHelperStart >= 0
    && valueSettingsHelperEnd > valueSettingsHelperStart
    && propertySummaryStart >= 0
    && propertySummaryEnd > propertySummaryStart,
  "managed-value property analytics helpers should remain extractable",
);
const { summarizeCustomEventProperties } = Function(
  `"use strict";
  const MAX_EVENT_PROPERTY_VALUE_SETTINGS = ${serverValueSettingsLimit};
  const MAX_CUSTOM_EVENT_PROPERTY_VALUES_RESPONSE = 100;
  const MAX_CUSTOM_EVENT_PROPERTY_OBSERVATIONS = 40;
  const MAX_CUSTOM_EVENT_PROPERTY_VALUES_TRACKED = 1000;
  const EVENT_PROPERTY_TIMELINE_SERIES_LIMIT = 4;
  const cleanInteger = (value) => {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : 0;
  };
  const cleanFiniteInteger = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.trunc(number) : 0;
  };
  const cleanFiniteNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : NaN;
  };
  const cleanString = (value, maxLength = 1000) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";
  const cleanTimestampMs = (value) => Math.max(0, Math.trunc(Number(value) || 0));
  const isValidCustomEventPropertyPath = (value) => (
    typeof value === "string"
    && value.length > 0
    && value.length <= 96
    && /^[A-Za-z][A-Za-z0-9_:-]*(?:\\[\\])?(?:\\.[A-Za-z][A-Za-z0-9_:-]*(?:\\[\\])?)*$/.test(value)
  );
  const getExactCustomEventBucketIndex = (timestamp, rangeStart, rangeEnd, bucketMs, bucketCount) => {
    if (timestamp < rangeStart || timestamp > rangeEnd || !bucketCount) return -1;
    return Math.min(Math.floor((timestamp - rangeStart) / bucketMs), bucketCount - 1);
  };
  ${serverSource.slice(valueSettingsHelperStart, valueSettingsHelperEnd)}
  ${serverSource.slice(propertySummaryStart, propertySummaryEnd)}
  return { summarizeCustomEventProperties };`,
)();
const managedPropertySummary = summarizeCustomEventProperties(
  [
    { occurredAt: 1_100, properties: { weapon: "Shotgun" } },
    { occurredAt: 2_100, properties: { weapon: "Sniper" } },
  ],
  serverActiveValueLimit,
  "weapon",
  {
    allowedPropertyNames: new Set(["weapon"]),
    propertyDefinitions: [{ name: "weapon", type: "string" }],
    valueSettings: [
      { propertyName: "weapon", value: "Shotgun", valueType: "string", color: "#123456", displayName: "Pump Shotgun" },
      { propertyName: "weapon", value: "SMG", valueType: "string", color: "#abcdef", manual: true },
      { propertyName: "weapon", value: "Sniper", valueType: "string", hidden: true },
    ],
    bucketMs: 1_000,
    bucketStarts: [1_000, 2_000],
    bucketEnds: [2_000, 3_000],
    rangeStart: 1_000,
    rangeEnd: 3_000,
  },
)[0];
assert.deepEqual(
  managedPropertySummary.timeline.series.map((series) => series.value),
  ["Shotgun", "SMG"],
  "manual values should join automatic values while deleted discoveries remain suppressed",
);
assert.equal(
  managedPropertySummary.timeline.series[0].color,
  "#123456",
  "saved colors should be returned with their matching timeline series",
);
assert.equal(
  managedPropertySummary.timeline.series[0].displayName,
  "Pump Shotgun",
  "saved display names should be returned without changing the underlying Roblox value",
);
assert.equal(
  managedPropertySummary.timeline.series[1].managed,
  true,
  "a zero-event manual value should remain marked for graph and breakdown rendering",
);
assert.equal(
  managedPropertySummary.timeline.observationCount,
  1,
  "suppressed values should not distort visible-value percentages",
);

const playerWeightedPropertySummary = summarizeCustomEventProperties(
  [
    { userId: 1, occurredAt: 1_100, properties: { weapon: "Shotgun" } },
    { userId: 1, occurredAt: 1_200, properties: { weapon: "Shotgun" } },
    { userId: 1, occurredAt: 1_300, properties: { weapon: "Shotgun" } },
    { userId: 1, occurredAt: 1_400, properties: { weapon: "Rifle" } },
    { userId: 2, occurredAt: 2_100, properties: { weapon: "Rifle" } },
  ],
  serverActiveValueLimit,
  "weapon",
  {
    allowedPropertyNames: new Set(["weapon"]),
    propertyDefinitions: [{ name: "weapon", type: "string" }],
    bucketMs: 1_000,
    bucketStarts: [1_000, 2_000],
    bucketEnds: [2_000, 3_000],
    rangeStart: 1_000,
    rangeEnd: 3_000,
  },
)[0];
const shotgunPlayerMetrics = playerWeightedPropertySummary.timeline.series
  .find((series) => series.value === "Shotgun");
const riflePlayerMetrics = playerWeightedPropertySummary.timeline.series
  .find((series) => series.value === "Rifle");
assert.equal(
  playerWeightedPropertySummary.timeline.uniquePlayers,
  2,
  "property player metrics should use players with a visible value as the denominator",
);
assert.equal(shotgunPlayerMetrics.playerCount, 1, "value reach should count each matching player once");
assert.equal(shotgunPlayerMetrics.percentPlayers, 50, "value reach should report the percentage of participating players");
assert.equal(
  shotgunPlayerMetrics.averagePlayerShare,
  37.5,
  "average player share should give the heavy and light player equal influence",
);
assert.equal(riflePlayerMetrics.playerCount, 2, "a value used by every participating player should reach every player");
assert.equal(riflePlayerMetrics.percentPlayers, 100, "full player reach should report 100 percent");
assert.equal(
  riflePlayerMetrics.averagePlayerShare,
  62.5,
  "average player share should average each player's personal distribution",
);
assert.equal(
  shotgunPlayerMetrics.averagePlayerShare + riflePlayerMetrics.averagePlayerShare,
  100,
  "average player shares should total 100 percent when all visible values are represented",
);
assert.deepEqual(
  shotgunPlayerMetrics.points.map((point) => point.percentPlayers),
  [100, 0],
  "timeline points should report per-interval player reach for inline changes",
);
assert.deepEqual(
  shotgunPlayerMetrics.points.map((point) => point.averagePlayerShare),
  [75, 0],
  "timeline points should report per-interval average player share for inline changes",
);
assert.deepEqual(
  riflePlayerMetrics.points.map((point) => point.averagePlayerShare),
  [25, 100],
  "per-interval preference should be calculated independently for each value",
);

const analyticsRecordsStart = serverSource.indexOf("async function getAnalyticsEventRecords(");
const analyticsRecordsEnd = serverSource.indexOf("\nfunction createVisitAnalyticsEvent(", analyticsRecordsStart);
assert.ok(
  analyticsRecordsStart >= 0 && analyticsRecordsEnd > analyticsRecordsStart,
  "the analytics event cleanup filter should remain extractable",
);
const deletionCutoff = 2_000;
const { getAnalyticsEventRecords } = Function(
  `"use strict";
  const cleanInteger = (value) => Math.trunc(Number(value) || 0);
  const cleanString = (value, maxLength = 1000) => String(value ?? "").slice(0, maxLength);
  const cleanTimestampMs = (value) => Math.max(0, Math.trunc(Number(value) || 0));
  const normalizeCustomEventName = (value) => String(value || "").trim().toLowerCase();
  const SYSTEM_ANALYTICS_EVENT_NAMES = new Set(["player_died", "player_left", "chat_message"]);
  const SYSTEM_ANALYTICS_EVENT_DEFINITIONS = [];
  const customEventsByUniverseId = new Map([["123", [
    { id: "after", eventName: "weapon_equipped", occurredAt: 2001 },
  ]]]);
  const getObjectStorageRollup = async () => ({
    customEvents: {
      samples: [
        { id: "before", eventName: "weapon_equipped", occurredAt: 1999 },
        { id: "at-cutoff", eventName: "weapon_equipped", occurredAt: 2000 },
        { id: "other-event", eventName: "round_started", occurredAt: 1500 },
      ],
    },
  });
  const getAnalyticsRollupSamples = (rollup, selector) => selector(rollup) || [];
  const getCustomEventDeletionCutoffs = async () => new Map([["weapon_equipped", ${deletionCutoff}]]);
  const getAnalyticsEventSignalSamples = () => [];
  const getDeathSamplesForFilters = () => [];
  const getLeaveSamplesForFilters = () => [];
  const getChatLogs = () => ({ logs: [] });
  const getVisitSamplesForFilters = () => [];
  const createSystemAnalyticsEvent = () => null;
  const createVisitAnalyticsEvent = () => null;
  ${serverSource.slice(analyticsRecordsStart, analyticsRecordsEnd)}
  return { getAnalyticsEventRecords };`,
)();
const recordsAfterDelete = await getAnalyticsEventRecords({ universeId: 123 });
assert.deepEqual(
  recordsAfterDelete.events.map((event) => event.id).sort(),
  ["after", "other-event"],
  "delete cleanup should hide matching records at or before deletedAt while retaining newer and unrelated events",
);
assert.match(
  serverSource,
  /eventDefinitions\.map\(\(definition\) => normalizeCustomEventName\(definition\.eventName\)\)/,
  "preset definitions should be available to funnels before the first event arrives",
);
const saveDefinitionStart = serverSource.indexOf("async function saveEventDefinition(");
const saveDefinitionEnd = serverSource.indexOf("\nasync function deleteEventDefinition(", saveDefinitionStart);
const saveDefinitionSource = serverSource.slice(saveDefinitionStart, saveDefinitionEnd);
assert.doesNotMatch(saveDefinitionSource, /replaceOne\(/, "editing a definition must not overwrite concurrently discovered keys");
assert.match(saveDefinitionSource, /\$setOnInsert/, "server-maintained discovery fields should be preserved atomically");
const editableSetStart = saveDefinitionSource.indexOf("$set: {");
const setOnInsertStart = saveDefinitionSource.indexOf("$setOnInsert:", editableSetStart);
assert.ok(
  editableSetStart >= 0 && setOnInsertStart > editableSetStart,
  "the editable and insert-only definition fields should be separate",
);
const editableSetSource = saveDefinitionSource.slice(editableSetStart, setOnInsertStart);
assert.match(
  editableSetSource,
  /hiddenPropertyNames:\s*savedDefinition\.hiddenPropertyNames/,
  "editing a Mongo definition should persist its user-owned hidden property names",
);
assert.match(
  editableSetSource,
  /valueSettings:\s*savedDefinition\.valueSettings/,
  "editing a Mongo definition should persist user-owned value colors and suppressions",
);
assert.doesNotMatch(
  editableSetSource,
  /discoveredPropertyNames/,
  "editing a definition must not place discovered property names in the overwritable $set block",
);
assert.match(
  saveDefinitionSource,
  /\$unset:\s*\{\s*keyMode:\s*"",?\s*\}/,
  "saving a Mongo definition should remove its legacy keyMode field",
);
const deleteDefinitionByNameStart = serverSource.indexOf("async function deleteEventDefinitionByName(");
const deleteDefinitionByNameEnd = serverSource.indexOf("\nfunction createEventDefinitionLimitError(", deleteDefinitionByNameStart);
assert.ok(
  deleteDefinitionByNameStart >= 0 && deleteDefinitionByNameEnd > deleteDefinitionByNameStart,
  "definition cleanup should remain extractable",
);
const deleteDefinitionByNameSource = serverSource.slice(deleteDefinitionByNameStart, deleteDefinitionByNameEnd);
assert.match(
  deleteDefinitionByNameSource,
  /lastSeenAt:\s*\{\s*\$lte:\s*throughTimestamp\s*\}/,
  "definition cleanup should use event occurrence time so post-cutoff telemetry survives",
);
assert.doesNotMatch(
  deleteDefinitionByNameSource,
  /updatedAt:\s*\{\s*\$lte:\s*throughTimestamp\s*\}/,
  "definition cleanup must not treat delayed processing time as a post-cutoff event",
);

console.log("Event definition workflow tests passed.", {
  controls: 17,
  generatedFormats: ["luau"],
  propertyModel: "configured + discovered - hidden",
  activePropertyLimit: clientPropertyLimit,
  knownPropertyLimit: serverKnownPropertyLimit,
});
