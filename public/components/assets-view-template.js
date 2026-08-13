window.RoSignalComponents = window.RoSignalComponents || {};
window.RoSignalComponents.templates = window.RoSignalComponents.templates || {};
window.RoSignalComponents.templates.assetsView = `
<section class="viewPage assetsPage" data-view-panel="assets" hidden>
  <section class="assetAuthorization panel" id="assetAuthorization">
    <div>
      <span class="assetEyebrow">Roblox publishing</span>
      <h2 id="assetAuthorizationTitle">Connect Roblox to publish assets</h2>
      <p id="assetAuthorizationCopy">Saved batches work immediately. Authorize Roblox when you are ready to publish them.</p>
    </div>
    <div class="assetAuthorizationActions">
      <button class="button compact" id="assetAuthorizeButton" type="button">Authorize Roblox</button>
      <button class="button secondary compact" id="assetDisconnectButton" type="button" hidden>Disconnect</button>
    </div>
  </section>

  <div class="assetWorkspace">
    <section class="panel assetUploadPanel">
      <header class="assetSectionHeader">
        <div>
          <span class="assetEyebrow">New saved batch</span>
          <h2>Bulk upload</h2>
          <p>Drop a folder or select up to 100 supported Roblox asset files.</p>
        </div>
      </header>
      <input id="assetFileInput" type="file" multiple accept=".png,.jpg,.jpeg,.bmp,.tga,.mp3,.ogg,.wav,.flac,.fbx,.gltf,.glb,.rbxm,.rbxmx,.mp4,.mov" hidden>
      <button class="assetDropZone" id="assetDropZone" type="button">
        <span class="assetDropIcon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" /></svg>
        </span>
        <strong>Drop files or a folder here</strong>
        <span>Images, audio, models, animations, and video up to 20 MB each</span>
      </button>
      <div class="assetBatchEditor" id="assetBatchEditor" hidden>
        <div class="assetBatchToolbar">
          <label class="assetBatchNameField" for="assetBatchName">
            <span>Batch name</span>
            <input id="assetBatchName" type="text" maxlength="80" placeholder="Summer update assets">
          </label>
          <div class="assetBatchSummary" id="assetBatchSummary">0 files</div>
        </div>
        <div class="assetStagingList" id="assetStagingList"></div>
        <div class="assetBatchActions">
          <button class="button secondary compact" id="assetClearBatchButton" type="button">Clear</button>
          <button class="button compact" id="assetSaveBatchButton" type="button">Save batch</button>
        </div>
      </div>
      <p class="assetStatus" id="assetUploadStatus" aria-live="polite"></p>
    </section>

    <section class="panel assetLibraryPanel">
      <header class="assetSectionHeader assetLibraryHeader">
        <div>
          <span class="assetEyebrow">Reusable library</span>
          <h2>Saved batches</h2>
          <p>Return later or publish the whole saved batch together.</p>
        </div>
        <button class="button secondary compact" id="assetRefreshButton" type="button">Refresh</button>
      </header>
      <div class="assetLibraryLayout">
        <div class="assetPackList" id="assetPackList"></div>
        <div class="assetPackDetail" id="assetPackDetail">
          <div class="assetEmptyState">
            <strong>No saved batch selected</strong>
            <span>Create a bulk upload batch to keep its files and publishing history together.</span>
          </div>
        </div>
      </div>
      <p class="assetStatus" id="assetLibraryStatus" aria-live="polite"></p>
    </section>
  </div>
</section>
`;
window.RoSignalComponents.mountHTML('assets-view', window.RoSignalComponents.templates.assetsView);
