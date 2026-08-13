window.RoSignalComponents = window.RoSignalComponents || {};
window.RoSignalComponents.templates = window.RoSignalComponents.templates || {};
window.RoSignalComponents.templates.connectView = `
<section class="viewPage" data-view-panel="connect" hidden>
  <section class="connectUniversePanel">
    <div class="connectUniverseHeader">
      <div>
        <h2>Connect Universe</h2>
        <p>Connect and manage the Roblox games sending data to RoSignal.</p>
      </div>
      <div class="connectUniverseHeaderActions">
        <button class="button secondary compact createDemoUniverseButton" id="createDemoUniverseButton" type="button" hidden>
          <span aria-hidden="true">&#10022;</span>
          Create demo universe
        </button>
        <button class="button compact connectNewGameButton" id="connectNewGameButton" type="button">
          <span aria-hidden="true">+</span>
          Connect new game
        </button>
        <p class="status demoUniverseStatus" id="demoUniverseStatus" aria-live="polite" hidden></p>
      </div>
    </div>

    <section class="connectedGamesManager">
      <div class="connectedGameList" id="connectedGameList"></div>
    </section>

    <article class="panel studioInstallerPanel" id="studioInstallerPanel">
      <div class="studioInstallerHeader">
        <div>
          <span class="groupEyebrow">Studio setup</span>
          <h3>Install RoSignal automatically</h3>
          <p>Open the Studio plugin and click Connect &amp; Install. Pairing and credential handoff happen automatically.</p>
        </div>
        <a class="button secondary compact" href="/api/studio-plugin/download" download="RoSignalInstaller.plugin.lua">Download plugin</a>
      </div>
      <p class="status studioPairingStatus" id="studioPairingStatus" aria-live="polite">Auto-pairing from Studio is available.</p>
      <div class="studioPairingList" id="studioPairingList"></div>
    </article>

    <article class="setupChecklistCard" id="setupChecklistCard">
      <div class="setupChecklistHeader">
        <div class="setupChecklistIntro">
          <h3>First-run setup</h3>
          <p>Complete these steps to finish connecting your game.</p>
        </div>
        <div class="setupChecklistProgress">
          <span id="setupProgressText">0 / 4 complete</span>
          <div class="setupProgressTrack" id="setupProgressTrack" role="progressbar" aria-label="First-run setup progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <span id="setupProgressBar"></span>
          </div>
          <strong id="setupProgressPercent">0%</strong>
        </div>
      </div>
      <ol class="setupChecklist" id="setupChecklist">
        <li><span></span><div><strong>Connect a game</strong><p>Pick one owned public game from the list.</p></div></li>
        <li><span></span><div><strong>Install RoSignal</strong><p>Open Studio and click Connect &amp; Install. No code entry is required.</p></div></li>
        <li><span></span><div><strong>Start a live server</strong><p>Enable Allow HTTP Requests, publish, and join the game.</p></div></li>
        <li><span></span><div><strong>Confirm signals</strong><p>Movement, deaths, leaves, or chat should become active.</p></div></li>
      </ol>
    </article>

    <div class="discordRuleDialog connectGameDialog" id="connectGameDialog" hidden>
      <button class="discordRuleDialogBackdrop" id="connectGameDialogBackdrop" type="button" aria-label="Close connect game"></button>
      <section class="discordRuleDialogCard connectGameDialogCard" role="dialog" aria-modal="true" aria-labelledby="connectGameDialogTitle">
        <header>
          <button class="discordWebhookBuilderBackButton discordRuleBackButton" id="connectGameDialogCloseButton" type="button" aria-label="Back to connected games">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 7-5 5 5 5"/></svg>
          </button>
          <div>
            <span>Roblox universe</span>
            <h2 id="connectGameDialogTitle">Connect game</h2>
          </div>
        </header>
        <div class="connectGameDialogBody">
          <div class="connectGameFormSection" id="connectGameFormSection">
            <p>Select one of the Roblox games owned by your account.</p>
            <form class="projectForm connectUniverseForm" id="projectForm">
              <div class="fieldGroup">
                <label for="ownedGameSelect">Game</label>
                <select id="ownedGameSelect" disabled>
                  <option value="">Loading owned games...</option>
                </select>
              </div>
              <button class="button compact" id="createProjectButton" type="submit">Connect game</button>
            </form>
            <div class="connectUniverseActions">
              <button class="button secondary compact refreshGamesButton" id="refreshOwnedGamesButton" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M18.1 9A7 7 0 0 0 6.4 6.4L4 9M5.9 15A7 7 0 0 0 17.6 17.6L20 15"/></svg>
                Refresh games
              </button>
              <p class="status" id="ownedGamesStatus">Loading Roblox games...</p>
            </div>
          </div>
          <div class="projectSecretBox" id="projectSecretBox" hidden>
            <strong>Manual or Rojo fallback</strong>
            <span id="projectSecretTarget"></span>
            <p>The Studio installer fills this automatically. Only paste this into <code>Settings.Secret</code> when installing manually or through Rojo.</p>
            <code id="projectSecretValue"></code>
            <button class="button compact" id="copyProjectSecretButton" type="button">Copy secret</button>
          </div>
        </div>
      </section>
    </div>
  </section>
</section>
`;
window.RoSignalComponents.mountHTML('connect-view', window.RoSignalComponents.templates.connectView);
