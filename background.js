/**
 * Alt+Click 图片保存器
 * 作者：WilliamJoy
 * 版本：1.0.0
 * powered by kimi
 */

// 离屏文档管理
let creatingOffscreen;
async function setupOffscreenDocument(path) {
  if (await hasDocument()) return;
  
  if (creatingOffscreen) {
    await creatingOffscreen;
  } else {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: path,
      reasons: ['DOM_PARSER', 'BLOBS'],
      justification: '获取跨域图片数据',
    });
    await creatingOffscreen;
    creatingOffscreen = null;
  }
}

async function hasDocument() {
  if (typeof clients === 'undefined') return false;
  const matchedClients = await clients.matchAll();
  return matchedClients.some(client => 
    client.url.includes('offscreen.html')
  );
}

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveImage') {
    handleSaveImage(request.imageUrl, request.filename);
    sendResponse({ success: true });
  } else if (request.action === 'imageDataReady') {
    performDownload(request.imageData, request.filename, request.contentType);
  }
  return true;
});

// 处理图片保存
async function handleSaveImage(imageUrl, filename) {
  try {
    const { savePath = 'AltImages' } = await chrome.storage.local.get('savePath');
    const safeFilename = filename.replace(/[<>:\"/\\|?*]/g, '_');
    const fullPath = `${savePath}/${safeFilename}`;
    
    console.log('准备保存:', fullPath);
    
    // 如果是 Base64 或 Blob URL，直接下载
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      await performDownload(imageUrl, fullPath);
    } else {
      // 跨域图片：使用离屏文档获取
      await setupOffscreenDocument('offscreen.html');
      
      setTimeout(() => {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          action: 'fetchImage',
          imageUrl: imageUrl,
          filename: fullPath
        });
      }, 100);
    }
    
  } catch (error) {
    console.error('保存失败:', error);
  }
}

// 执行实际下载
async function performDownload(urlOrData, filename, contentType = '') {
  try {
    let downloadUrl = urlOrData;
    
    // 如果是 ArrayBuffer 数据，转换为 Blob URL
    if (urlOrData instanceof ArrayBuffer || (typeof urlOrData === 'object' && urlOrData.type === 'arraybuffer')) {
      const buffer = urlOrData.data || urlOrData;
      const blob = new Blob([buffer], { type: contentType || 'image/jpeg' });
      downloadUrl = URL.createObjectURL(blob);
    }
    
    const downloadId = await chrome.downloads.download({
      url: downloadUrl,
      filename: filename,
      saveAs: false,
      conflictAction: 'uniquify'
    });
    
    console.log('下载开始, ID:', downloadId);
    
    // 监听下载状态
    chrome.downloads.onChanged.addListener(function listener(delta) {
      if (delta.id === downloadId && delta.state) {
        if (delta.state.current === 'complete') {
          console.log('下载完成:', filename);
          if (downloadUrl.startsWith('blob:')) {
            URL.revokeObjectURL(downloadUrl);
          }
        } else if (delta.state.current === 'interrupted') {
          console.error('下载中断:', delta.error);
        }
        chrome.downloads.onChanged.removeListener(listener);
      }
    });
    
  } catch (error) {
    console.error('下载失败:', error);
    // 降级：保存到根目录
    const simpleName = filename.split('/').pop();
    chrome.downloads.download({
      url: urlOrData,
      filename: simpleName,
      saveAs: false,
      conflictAction: 'uniquify'
    });
  }
}

// 安装初始化
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ savePath: 'AltImages' });
});