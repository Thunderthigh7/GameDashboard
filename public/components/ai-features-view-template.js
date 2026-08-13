window.RoSignalComponents = window.RoSignalComponents || {};
window.RoSignalComponents.templates = window.RoSignalComponents.templates || {};
window.RoSignalComponents.templates.aiFeaturesView = `
<section class="viewPage aiRunsPage" data-view-panel="ai-runs" hidden>
  <div class="aiFeaturesTopGrid">
    <article class="panel aiRunControls">
      <div class="sectionHeader">
        <div><h2>AI Runs</h2><p>Automation and saved analysis history.</p></div>
      </div>
      <button class="aiButton aiRunButton" id="runChatInsightsButton" type="button">AI Insights</button>
      <p class="status aiRunStatus">AI can analyze movement, deaths, leaves, and chat when samples are available.</p>
      <div class="aiAutomationControls">
        <label class="toggleControl" for="aiAutomationToggle">
          <input id="aiAutomationToggle" type="checkbox" checked />
          <span>Auto hourly</span>
        </label>
        <span class="status compactStatus" id="aiAutomationStatus">Checking automation...</span>
      </div>
      <div class="aiReportHistory">
        <label for="aiReportSelect">Saved runs</label>
        <select id="aiReportSelect" disabled><option value="">Latest saved report</option></select>
      </div>
    </article>

    <article class="panel chatInsights chatBotPanel aiFeaturesChatPanel">
      <div class="chatBotHeader">
        <div><h2>AI Chat</h2><p><span></span>Live</p></div>
      </div>
      <p class="status" id="chatInsightsStatus">Checking analytics data...</p>
      <div class="chatBotMessages" id="aiChatMessages">
        <article class="botMessage assistantMessage">
          <span aria-hidden="true"></span>
          <div><strong>RoSignal AI <small>Ready</small></strong><p>Welcome. Ask me anything about player behavior, traffic patterns, or game insights.</p></div>
        </article>
        <div class="typingDots" id="aiChatTyping" aria-hidden="true" hidden><span></span><span></span><span></span></div>
      </div>
      <div class="chatComposer">
        <input id="aiChatInput" type="text" value="" maxlength="800" placeholder="Ask anything about your data..." aria-label="Ask anything about your data">
        <button id="aiChatSendButton" type="button" aria-label="Send chat prompt"></button>
      </div>
      <small>AI responses may not always be accurate.</small>
      <span class="insightMode" id="chatInsightsMode">Not analyzed</span>
    </article>
  </div>

  <article class="panel chatQuestionPanel aiRunsQuestionPanel">
    <header class="chatSectionHeader"><div><h2>Top player questions</h2><p>Similar player questions grouped from the latest analysis.</p></div></header>
    <div class="chatQuestionTableHeader" aria-hidden="true"><span>#</span><span>Question</span><span>Messages</span><span>Players</span></div>
    <div class="commonQuestionList" id="commonQuestionList" aria-live="polite">
      <div class="chatQuestionEmpty" role="status"><strong>No analyzed questions yet</strong><span>Player questions will appear here after an AI analysis.</span></div>
      <div class="chatQuestionPlaceholder" aria-hidden="true"><span>1</span><i></i><i></i><i></i></div>
      <div class="chatQuestionPlaceholder" aria-hidden="true"><span>2</span><i></i><i></i><i></i></div>
      <div class="chatQuestionPlaceholder" aria-hidden="true"><span>3</span><i></i><i></i><i></i></div>
      <div class="chatQuestionPlaceholder" aria-hidden="true"><span>4</span><i></i><i></i><i></i></div>
      <div class="chatQuestionPlaceholder" aria-hidden="true"><span>5</span><i></i><i></i><i></i></div>
    </div>
  </article>
</section>
`;
window.RoSignalComponents.mountHTML('ai-features-view', window.RoSignalComponents.templates.aiFeaturesView);
