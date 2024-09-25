chrome.runtime.onInstalled.addListener(() => {
  //const extensionId = chrome.runtime.id;
  //const redirectUrl = `chrome-extension://${extensionId}/blocked.html`;

  chrome.storage.sync.get(['blacklist'], (result) => {
    const blacklist = result.blacklist || [];
    const rules = blacklist.map((url, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: `chrome-extension://${chrome.runtime.id}/blocked.html`
        }
      },
      condition: {
        urlFilter: `*${url}*`,
        resourceTypes: ['main_frame']
      }
    }));

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(rule => rule.id),
      addRules: rules
    });
  });
});