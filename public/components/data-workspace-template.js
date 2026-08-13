window.RoSignalComponents = window.RoSignalComponents || {};
window.RoSignalComponents.templates = window.RoSignalComponents.templates || {};
window.RoSignalComponents.templates.dataWorkspace = `
<section class="viewPage playerDataPage" data-view-panel="player-data" hidden>
  <section class="playerDataHero panel">
    <div>
      <span class="groupEyebrow">Automatic DataStore access</span>
      <h2>Player data</h2>
      <p>The connected Studio plugin discovers standard DataStores and player-key patterns, then loads and saves the selected player value directly. No live server is required.</p>
    </div>
    <div class="playerDataBridgeBadge" id="playerDataBridgeBadge" data-state="waiting">
      <span></span>
      <strong>Waiting for Studio plugin</strong>
    </div>
  </section>

  <section class="panel playerDataWorkspace">
    <header class="playerModerationSectionHeader">
      <div>
        <h2>Find a player</h2>
        <p>Username and user ID both work. Keep the paired experience open in Studio with Studio API access enabled. The player must be offline so a live session cannot overwrite your change.</p>
      </div>
      <button class="button secondary compact" id="refreshPlayerDataButton" type="button">Scan DataStores</button>
    </header>
    <div class="playerDataCatalogControls">
      <label>
        <span>DataStore</span>
        <select id="playerDataStoreSelect" aria-label="Discovered DataStore"></select>
      </label>
      <label>
        <span>Player key pattern</span>
        <select id="playerDataKeyPatternSelect" aria-label="Discovered player key pattern"></select>
      </label>
      <p id="playerDataCatalogStatus">Waiting for Studio to discover DataStores.</p>
    </div>
    <div class="playerDataLookupControls">
      <label class="srOnly" for="playerDataTargetInput">Roblox username or user ID</label>
      <input id="playerDataTargetInput" type="text" maxlength="64" autocomplete="off" spellcheck="false" placeholder="Username or user ID">
      <button class="button compact" id="playerDataLoadButton" type="button">Load data</button>
    </div>
    <p class="status playerDataStatus" id="playerDataStatus" aria-live="polite">Select a connected universe and enter a player.</p>

    <div class="playerDataEditor" id="playerDataEditor" hidden>
      <div class="playerDataEditorHeader">
        <div>
          <span>Editing</span>
          <strong id="playerDataEditorTarget">Player data</strong>
          <small id="playerDataEditorMeta"></small>
        </div>
        <span class="playerDataByteCount" id="playerDataByteCount">0 B</span>
      </div>
      <label class="srOnly" for="playerDataJsonEditor">Player JSON</label>
      <textarea id="playerDataJsonEditor" spellcheck="false" autocomplete="off" disabled></textarea>
      <footer>
        <p>Saving requires a successful fresh load first. Requests and decrypted results expire after 15 minutes.</p>
        <button class="button compact" id="playerDataSaveButton" type="button" disabled>Validate &amp; save</button>
      </footer>
    </div>
  </section>

  <section class="panel playerDataHistoryPanel">
    <header class="playerModerationSectionHeader">
      <div>
        <h2>Recent requests</h2>
        <p>Read and write status only. Player JSON is encrypted temporarily and automatically expires.</p>
      </div>
    </header>
    <div class="playerDataRequestList" id="playerDataRequestList"></div>
  </section>

  <section class="panel playerDataAdapterPanel" data-player-data-adapter-slot></section>
</section>
`;
window.RoSignalComponents.mountHTML('player-data-view', window.RoSignalComponents.templates.dataWorkspace);
