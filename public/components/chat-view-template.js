window.RoSignalComponents = window.RoSignalComponents || {};
window.RoSignalComponents.templates = window.RoSignalComponents.templates || {};
window.RoSignalComponents.templates.chatView = `
<section class="viewPage chatAnalysisPage" data-view-panel="chat" hidden>
  <section class="chatMetricGrid" aria-label="Chat summary">
    <article class="chatMetricCard">
      <span class="chatMetricIcon chatMessageIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M5.5 5.5h13a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3v-3h-1A2.5 2.5 0 0 1 3 15V8a2.5 2.5 0 0 1 2.5-2.5Z" /><path d="M7.5 10h9M7.5 13.5h6" /></svg>
      </span>
      <div><span>Messages</span><strong id="chatMessageCount">0</strong></div>
    </article>
    <article class="chatMetricCard">
      <span class="chatMetricIcon chatPlayersIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 19c.3-4 2.3-6 5.5-6s5.2 2 5.5 6M14 14c3.5-.5 5.7 1.2 6.2 5" /></svg>
      </span>
      <div><span>Players chatting</span><strong id="chatPlayerCount">0</strong></div>
    </article>
  </section>

  <article class="panel chatRecentPanel">
    <header class="chatSectionHeader">
      <div><h2>Recent chat</h2><p>Latest messages received from Roblox.</p></div>
      <span class="chatLiveBadge" id="chatLiveBadge"><i aria-hidden="true"></i><b>Waiting</b></span>
    </header>
    <p class="srOnly" id="chatLogsStatus" aria-live="polite">Waiting for chat logs...</p>
    <div class="chatLogTableHeader" aria-hidden="true"><span>Player</span><span>Message</span><span>Time</span></div>
    <div class="chatLogList" id="chatLogList">
      <div class="chatRecentEmpty" role="status">
        <span class="chatRecentEmptyIcon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M5.5 5.5h13a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3v-3h-1A2.5 2.5 0 0 1 3 15V8a2.5 2.5 0 0 1 2.5-2.5Z" /></svg>
        </span>
        <strong>No chat messages yet</strong>
        <span>New Roblox chat will appear here automatically.</span>
      </div>
    </div>
    <footer class="chatPagination" id="chatPagination" aria-label="Chat message pages" hidden>
      <button type="button" id="chatPreviousPageButton" aria-label="Previous chat messages">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg><span>Previous</span>
      </button>
      <strong id="chatPageStatus">1–25 of 25</strong>
      <button type="button" id="chatNextPageButton" aria-label="Next chat messages">
        <span>Next</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg>
      </button>
    </footer>
  </article>
</section>
`;
window.RoSignalComponents.mountHTML('chat-view', window.RoSignalComponents.templates.chatView);
