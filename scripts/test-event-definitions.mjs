import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");

const clientPropertyLimit = Number(
  appSource.match(/const MAX_EVENT_DEFINITION_PROPERTIES = (\d+);/)?.[1],
);
const serverPropertyLimit = Number(
  serverSource.match(/const MAX_CUSTOM_EVENT_PROPERTIES = (\d+);/)?.[1],
);
const markupPropertyLimit = Number(
  indexSource.match(/id="eventDefinitionPropertyCount">\s*0\s*\/\s*(\d+)</)?.[1],
);
assert.ok(Number.isInteger(clientPropertyLimit) && clientPropertyLimit > 0, "the client property limit should be explicit");
assert.equal(serverPropertyLimit, clientPropertyLimit, "client and server event property limits should match");
assert.equal(markupPropertyLimit, clientPropertyLimit, "the visible property counter should match the enforced limit");

const ids = [...indexSource.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert.deepEqual(duplicateIds, [], "event-builder markup must not introduce duplicate IDs");

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
  "eventKeyModeAuto",
  "eventKeyModeManual",
  "eventDefinitionPropertyEditor",
  "addEventDefinitionPropertyButton",
  "eventJsonPreview",
  "eventLuauPreview",
  "copyEventCodeButton",
  "downloadEventJsonButton",
  "saveEventDefinitionButton",
  "editEventButton",
  "deleteSelectedEventButton",
  "eventConfirmDialog",
]) {
  assert.match(indexSource, new RegExp(`id="${id}"`), `${id} should exist in the Events workflow`);
}

assert.match(
  styleSource,
  /body\[data-active-view="events"\]:not\(\.isLocked\) \.sidebar\s*\{[^}]*display:\s*none;/,
  "the global sidebar should collapse only while Events is active",
);
assert.match(
  styleSource,
  /body\[data-active-view="events"\]:not\(\.isLocked\) \.appShell\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/,
  "Events should reclaim the collapsed sidebar space",
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
assert.match(
  appSource,
  /request\("\/api\/event-definitions",\s*\{[\s\S]*method:\s*"POST"[\s\S]*universeId:\s*Number\(selectedUniverseId\)[\s\S]*eventName:\s*validated\.eventName[\s\S]*keyMode:\s*getSelectedEventDefinitionKeyMode\(\)[\s\S]*properties:\s*validated\.properties/,
  "saving should send the selected universe, event name, key mode, and properties",
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
assert.match(
  appSource,
  /Property names must be unique/,
  "duplicate property rows should be rejected instead of silently discarded",
);
assert.match(
  appSource,
  /Switch to Manual keys to exclude this property/,
  "Auto-discovered keys should explain how to exclude them",
);

const generatorStart = appSource.indexOf("function getEventDefinitionExampleValue(");
const generatorEnd = appSource.indexOf("\nfunction renderEventDefinitionCodePreviews(", generatorStart);
assert.ok(generatorStart >= 0 && generatorEnd > generatorStart, "event payload generators should remain extractable");
const { buildEventDefinitionJsonTemplate, buildEventDefinitionLuauTemplate } = Function(
  `"use strict";
  const getEventDefinitionPreviewName = () => "weapon_equipped";
  const getEventDefinitionPreviewProperties = () => [
    { name: "weapon.name", type: "string" },
    { name: "damage", type: "number" },
    { name: "isCritical", type: "boolean" },
  ];
  ${appSource.slice(generatorStart, generatorEnd)}
  return { buildEventDefinitionJsonTemplate, buildEventDefinitionLuauTemplate };`,
)();
assert.deepEqual(
  buildEventDefinitionJsonTemplate(),
  {
    eventName: "weapon_equipped",
    properties: {
      "weapon.name": "Example",
      damage: 0,
      isCritical: false,
    },
  },
  "the JSON preview should preserve property names and example types",
);
const luauTemplate = buildEventDefinitionLuauTemplate();
assert.match(
  luauTemplate,
  /require\(ServerScriptService\.Server\.Services\.Game\.PresenceService\.API\)/,
  "the generated Luau should require the official RoAnalytics service path",
);
assert.match(luauTemplate, /\["weapon\.name"\] = "Example"/, "nested paths should be valid Luau keys");
assert.match(luauTemplate, /damage = 0/, "numeric properties should use numeric Luau examples");
assert.match(luauTemplate, /isCritical = false/, "boolean properties should use boolean Luau examples");
assert.match(luauTemplate, /Logger\.Log\("weapon_equipped",[\s\S]*, player\)/, "the generated code should log the event for a player");

const definitionHelpersStart = serverSource.indexOf("function normalizeEventDefinition(");
const definitionHelpersEnd = serverSource.indexOf("\nfunction getAutoEventDefinitionId(", definitionHelpersStart);
assert.ok(definitionHelpersStart >= 0 && definitionHelpersEnd > definitionHelpersStart, "server definition helpers should remain extractable");
const {
  normalizeEventDefinition,
  serializeEventDefinition,
} = Function(
  `"use strict";
  const MAX_CUSTOM_EVENT_PROPERTIES = ${serverPropertyLimit};
  const EVENT_DEFINITION_KEY_MODES = new Set(["auto", "manual"]);
  const EVENT_DEFINITION_PROPERTY_TYPES = new Set(["string", "number", "boolean"]);
  const SYSTEM_ANALYTICS_EVENT_NAMES = new Set(["player_died", "player_left", "chat_message"]);
  const crypto = { randomUUID: () => "event-test-id" };
  const cleanString = (value, maxLength = 1000) => String(value ?? "").slice(0, maxLength);
  const cleanInteger = (value) => Math.trunc(Number(value) || 0);
  const cleanTimestampMs = (value) => Math.max(0, Math.trunc(Number(value) || 0));
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

const normalizedDefinition = normalizeEventDefinition({
  eventName: "Weapon_Equipped",
  keyMode: "manual",
  properties: [
    { name: "weapon.name", type: "string" },
    { name: "damage", type: "number" },
    { name: "critical", type: "boolean" },
  ],
}, definitionContext);
assert.equal(normalizedDefinition.ok, true);
assert.equal(normalizedDefinition.value.eventName, "weapon_equipped", "event names should normalize to lowercase");
assert.deepEqual(
  normalizedDefinition.value.properties.map((property) => property.type),
  ["string", "number", "boolean"],
  "configured example types should be retained",
);

const manualDefinition = serializeEventDefinition({
  ...normalizedDefinition.value,
  discoveredPropertyNames: ["weapon.name", "damage", "critical", "unexpected"],
});
assert.deepEqual(
  manualDefinition.effectiveProperties.map((property) => property.name),
  ["weapon.name", "damage", "critical"],
  "Manual mode should expose only preset properties",
);
assert.deepEqual(manualDefinition.unexpectedPropertyNames, ["unexpected"], "Manual mode should flag but retain unknown keys");

const autoDefinition = serializeEventDefinition({
  ...normalizedDefinition.value,
  keyMode: "auto",
  properties: [{ name: "preset", type: "number" }],
  discoveredPropertyNames: Array.from({ length: clientPropertyLimit + 5 }, (_, index) => `observed${index}`),
});
assert.equal(
  autoDefinition.effectiveProperties.length,
  clientPropertyLimit,
  "Auto mode should remain capped at the configured property limit",
);
assert.equal(autoDefinition.effectiveProperties[0].name, "preset", "preset properties should stay first");

const normalizeEditorStart = appSource.indexOf("function normalizeEventDefinitionEditorProperties(");
const normalizeEditorEnd = appSource.indexOf("\nfunction setEventDefinitionBuilderVisible(", normalizeEditorStart);
const keyModeStart = appSource.indexOf("function getSelectedEventDefinitionKeyMode(");
const keyModeEnd = appSource.indexOf("\nfunction renderEventDefinitionPropertyEditor(", keyModeStart);
assert.ok(
  normalizeEditorStart >= 0
    && normalizeEditorEnd > normalizeEditorStart
    && keyModeStart >= 0
    && keyModeEnd > keyModeStart,
  "Manual-to-Auto editor helpers should remain extractable",
);
const manualDefinitionForPreview = {
  keyMode: "manual",
  properties: [{ name: "preset", type: "string" }],
  effectiveProperties: [{ name: "preset", type: "string" }],
  discoveredPropertyNames: ["preset", "definitionOnly", "sharedObserved"],
};
const { switchManualDefinitionToAuto } = Function(
  `"use strict";
  const MAX_EVENT_DEFINITION_PROPERTIES = ${clientPropertyLimit};
  let isEditingEventDefinition = true;
  let eventDefinitionIsDirty = false;
  let eventDefinitionProperties = [{ name: "preset", type: "string", discovered: false }];
  const eventKeyModeManual = { checked: false };
  const currentSelectedEvent = {
    name: "weapon_equipped",
    definition: ${JSON.stringify(manualDefinitionForPreview)},
    properties: [
      {
        name: "preset",
        type: "category",
        topValues: [{ valueType: "string" }],
      },
      {
        name: "sharedObserved",
        type: "number",
        topValues: [{ valueType: "number" }],
      },
    ],
    observedPropertyNames: ["preset", "sharedObserved", "responseOnly"],
  };
  const getSelectedEventCatalogItem = () => ({ definition: currentSelectedEvent.definition });
  const renderEventDefinitionPropertyEditor = () => {};
  let previewPropertyNames = [];
  const renderEventDefinitionCodePreviews = () => {
    previewPropertyNames = eventDefinitionProperties.map((property) => property.name);
  };
  ${appSource.slice(observedTypeStart, observedTypeEnd)}
  ${appSource.slice(normalizeEditorStart, normalizeEditorEnd)}
  ${appSource.slice(keyModeStart, keyModeEnd)}
  return {
    switchManualDefinitionToAuto() {
      handleEventDefinitionModeChange();
      return previewPropertyNames;
    },
  };`,
)();
assert.deepEqual(
  new Set(switchManualDefinitionToAuto()),
  new Set(["preset", "definitionOnly", "sharedObserved", "responseOnly"]),
  "switching Manual to Auto should include every definition and response-discovered key in the preview",
);

assert.match(serverSource, /url\.pathname === "\/api\/event-definitions" && req\.method === "GET"/, "definitions should have an authenticated GET route");
assert.match(serverSource, /url\.pathname === "\/api\/event-definitions" && req\.method === "POST"/, "definitions should have an authenticated save route");
assert.match(serverSource, /eventDefinitionMatch && req\.method === "DELETE"/, "definitions should have an authenticated delete route");
assert.match(serverSource, /remainingSlots = Math\.max\(MAX_EVENT_DEFINITIONS_PER_UNIVERSE/, "Mongo Auto discovery should enforce the definition cap");
assert.match(
  serverSource,
  /discoverEventDefinitionsFromPresence\(presence\.value\)\.catch\(/,
  "schema discovery failures should never interrupt heartbeat ingestion",
);
const discoveryStart = serverSource.indexOf("async function discoverEventDefinitionsFromPresence(");
const discoveryEnd = serverSource.indexOf("\nasync function readEventDefinitions(", discoveryStart);
assert.ok(discoveryStart >= 0 && discoveryEnd > discoveryStart, "Auto discovery should remain extractable");
const discoverySource = serverSource.slice(discoveryStart, discoveryEnd);
assert.match(
  discoverySource,
  /const deletionCutoffs = await getCustomEventDeletionCutoffs\(universeId\);[\s\S]*occurredAt <= deletedAt\) continue;/,
  "Auto discovery should ignore delayed event payloads at or before a durable deletion cutoff",
);
assert.match(
  discoverySource,
  /withEventDefinitionMutationLock\(ownerUserId,\s*universeId,[\s\S]*currentDeletionCutoffs = await getCustomEventDeletionCutoffs\(universeId\);[\s\S]*buildEventDefinitionDiscoveries\(incomingEvents,\s*currentDeletionCutoffs\)/,
  "Mongo Auto discovery should revalidate deletion cutoffs after acquiring its mutation lock",
);
assert.match(
  discoverySource,
  /withLocalEventDefinitionStoreLock\([\s\S]*currentDeletionCutoffs = await getCustomEventDeletionCutoffs\(universeId\);[\s\S]*buildEventDefinitionDiscoveries\(incomingEvents,\s*currentDeletionCutoffs\)/,
  "local Auto discovery should revalidate deletion cutoffs after acquiring its store lock",
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
  const MAX_CUSTOM_EVENT_RECENT_RESPONSE = 100;
  const MAX_CUSTOM_EVENT_PROPERTY_VALUES_RESPONSE = 100;
  const cleanInteger = (value) => Math.trunc(Number(value) || 0);
  const cleanString = (value, maxLength = 1000) => String(value ?? "").slice(0, maxLength);
  const serializeEventDefinition = (definition) => definition;
  const getDiscoveredPropertyNamesFromEvents = (events) => [
    ...new Set(events.flatMap((event) => Object.keys(event.properties || {}))),
  ];
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
const rawManualEvent = {
  id: "event-1",
  userId: 1,
  sessionId: "session-1",
  occurredAt: 1_000,
  properties: { preset: "Shotgun", unexpected: true },
};
const manualDetailRun = buildCustomEventDetail("weapon_equipped", [rawManualEvent], {
  definition: {
    keyMode: "manual",
    properties: [{ name: "preset", type: "string" }],
    effectiveProperties: [{ name: "preset", type: "string" }],
    unexpectedPropertyNames: ["unexpected"],
  },
  recentLimit: 7,
  propertyValueLimit: 4,
});
capturedAllowedPropertyNames = manualDetailRun.getAllowedNames();
assert.deepEqual(capturedAllowedPropertyNames, ["preset"], "Manual mode should summarize only preset property keys");
assert.deepEqual(
  manualDetailRun.result.properties.map((property) => property.name),
  ["preset"],
  "Manual mode should exclude unknown keys from property breakdowns",
);
assert.equal(
  manualDetailRun.result.recentEvents[0].properties.unexpected,
  true,
  "Manual display filtering should leave unknown keys in raw recent records",
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
assert.doesNotMatch(
  editableSetSource,
  /discoveredPropertyNames/,
  "editing a definition must not place discovered property names in the overwritable $set block",
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
  controls: 14,
  generatedFormats: ["json", "luau"],
  modes: ["auto", "manual"],
  propertyLimit: clientPropertyLimit,
});
