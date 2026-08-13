window.RoSignalComponents = window.RoSignalComponents || {};
window.RoSignalComponents.templates = window.RoSignalComponents.templates || {};
window.RoSignalComponents.templates.connectView = `
<section class="viewPage" data-view-panel="connect" hidden>
  <section class="connectUniversePanel">
    <div class="connectUniverseHeader">
      <div>
        <span class="groupEyebrow">Setup</span>
        <h2>Connect your game</h2>
        <p>Choose your Roblox experience, connect Studio, then move straight into the tools you need.</p>
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
          <span class="groupEyebrow">Studio connection</span>
          <h3>Connect RoSignal in Studio</h3>
          <p>Install the plugin once, open your experience, then use Connect &amp; Install. Pairing and credential handoff are automatic.</p>
        </div>
        <a class="button secondary compact" href="/api/studio-plugin/download" download="RoSignalInstaller.plugin.lua">Download plugin</a>
      </div>
      <p class="status studioPairingStatus" id="studioPairingStatus" aria-live="polite">Auto-pairing from Studio is available.</p>
      <div class="studioPairingList" id="studioPairingList"></div>
    </article>

    <article class="setupChecklistCard" id="setupChecklistCard">
      <div class="setupChecklistHeader">
        <div class="setupChecklistIntro">
          <h3>Connection progress</h3>
          <p>Finish these once. RoSignal will keep checking them for you.</p>
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
        <li><span></span><div><strong>Connect a game</strong><p>Pick one owned public game from Roblox.</p></div></li>
        <li><span></span><div><strong>Connect Studio</strong><p>Open the plugin and use Connect &amp; Install.</p></div></li>
        <li><span></span><div><strong>Publish and play</strong><p>Enable HTTP requests, publish, and join the game.</p></div></li>
        <li><span></span><div><strong>Confirm signals</strong><p>RoSignal detects movement, events, or other incoming data.</p></div></li>
      </ol>
    </article>

    <article class="panel connectNextSteps">
      <header>
        <span class="groupEyebrow">After setup</span>
        <h3>Choose what you want to do next</h3>
        <p>You do not need to learn the whole dashboard. Start with the job you are trying to do.</p>
      </header>
      <nav class="connectNextGrid" aria-label="RoSignal next steps">
        <a href="#overview" data-dashboard-view="overview"><strong>See player behavior</strong><span>Open the map and inspect where players move, die, leave, and trigger events.</span><em>Map →</em></a>
        <a href="#events" data-dashboard-view="events"><strong>Track something specific</strong><span>Define an event and immediately start breaking down the properties you log.</span><em>Events →</em></a>
        <a href="#funnels" data-dashboard-view="funnels"><strong>Measure a player journey</strong><span>Turn your tracked events into an ordered conversion funnel.</span><em>Funnels →</em></a>
        <a href="#player-data" data-dashboard-view="player-data"><strong>Work with a player</strong><span>Inspect or update player data through your connected Studio or server bridge.</span><em>Player Data →</em></a>
      </nav>
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
