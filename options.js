document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('passwordInput');
  const submitPasswordButton = document.getElementById('submitPasswordButton');
  const passwordPrompt = document.getElementById('passwordPrompt');
  const configContent = document.getElementById('configContent');
  const error = document.getElementById('error');

  const correctPassword = '!QAZ2wsx'; // 设置你的密码

  const defaultBlackList = [
      "*douyin.com*",
      "*baidu.com*",
      "*v.qq.com*",
      "*.iqiyi.com*",
      "*youku*",
      "*mgtv.com*",
      "*bilibili*",
      "*ixigua*",
      "*miguvideo*",
      "*yangshipin*",
      "*cctv*",
      "*sohu*",
      "*360.cn*",
      "*360.com*"
  ];

  passwordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      submitPasswordButton.click();
    }
  });

  submitPasswordButton.addEventListener('click', () => {
    if (passwordInput.value === correctPassword) {
      passwordPrompt.style.display = 'none';
      configContent.style.display = 'block';
    } else {
      error.style.display = 'block';
    }
  });

  const urlInput = document.getElementById('urlInput');
  const addUrlButton = document.getElementById('addUrlButton');
  const blacklistUl = document.getElementById('blacklist');

  urlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addUrlButton.click();
    }
  });

  // 加载黑名单
  chrome.storage.sync.get(['blacklist'], (result) => {
    let blacklist = result.blacklist || [];
    if (blacklist.length === 0) {
      blacklist = defaultBlackList;
      chrome.storage.sync.set({ blacklist }, () => {
        updateDynamicRules(blacklist);
      });
    }
    blacklist.forEach(addUrlToList);
  });

  // 添加 URL 到黑名单
  addUrlButton.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
      chrome.storage.sync.get(['blacklist'], (result) => {
        const blacklist = result.blacklist || defaultBlackList;
        if (!blacklist.includes(url)) {
          blacklist.push(url);
          chrome.storage.sync.set({ blacklist }, () => {
            addUrlToList(url);
            updateDynamicRules(blacklist);
          });
        }
      });
      urlInput.value = '';
    }
  });

  // 将 URL 添加到列表中
  function addUrlToList(url) {
    const li = document.createElement('li');
    li.textContent = url;
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      chrome.storage.sync.get(['blacklist'], (result) => {
        const blacklist = result.blacklist.filter(item => item !== url);
        chrome.storage.sync.set({ blacklist }, () => {
          li.remove();
          updateDynamicRules(blacklist);
        });
      });
    });
    li.appendChild(removeButton);
    blacklistUl.appendChild(li);
  }

  // 更新动态规则
  function updateDynamicRules(blacklist) {
    // 清除现有规则
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      const ruleIds = rules.map(rule => rule.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: []
      }, () => {
        // 添加新规则
        const newRules = blacklist.map((url, index) => ({
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
          removeRuleIds: [],
          addRules: newRules
        });
      });
    });
  }
});