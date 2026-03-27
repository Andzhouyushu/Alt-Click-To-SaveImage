document.addEventListener('DOMContentLoaded', async () => {
  const pathInput = document.getElementById('savePath');
  const saveBtn = document.getElementById('saveBtn');
  const openFolderBtn = document.getElementById('openFolderBtn');
  const silentToggle = document.getElementById('silentToggle');
  const status = document.getElementById('status');
  
  // 加载设置
  const { savePath, silentMode } = await chrome.storage.local.get(['savePath', 'silentMode']);
  if (savePath) pathInput.value = savePath;
  
  // 设置开关状态
  const isSilent = silentMode !== false; // 默认开启
  if (isSilent) silentToggle.classList.add('active');
  
  // 开关点击事件
  silentToggle.addEventListener('click', () => {
    silentToggle.classList.toggle('active');
    const newState = silentToggle.classList.contains('active');
    chrome.storage.local.set({ silentMode: newState });
    showStatus(newState ? '🔇 已开启静默模式' : '🔔 已关闭静默模式', '#667eea');
  });
  
  // 保存设置
  saveBtn.addEventListener('click', async () => {
    let path = pathInput.value.trim();
    path = path.replace(/[<>:\"/\\|?*]/g, '_').replace(/^\/+|\/+$/g, '');
    if (!path) path = 'AltImages';
    
    await chrome.storage.local.set({ savePath: path });
    showStatus('✓ 设置已保存', '#10b981');
  });
  
  // 打开下载目录
  openFolderBtn.addEventListener('click', async () => {
    const { savePath = 'AltImages' } = await chrome.storage.local.get('savePath');
    chrome.downloads.showDefaultFolder();
    showStatus(`📁 图片保存在 "${savePath}" 文件夹中`, '#667eea', 3000);
  });
  
  function showStatus(msg, color, duration = 2000) {
    status.textContent = msg;
    status.style.color = color;
    status.classList.add('show');
    setTimeout(() => {
      status.classList.remove('show');
    }, duration);
  }
});