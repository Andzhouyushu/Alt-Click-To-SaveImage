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

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request.action || request.target);
  
  if (request.action === 'saveImage') {
    handleSaveImage(request.imageUrl, request.filename);
    sendResponse({ received: true });
    return false;
  } 
  else if (request.action === 'imageDataReady') {
    performDownload(request.imageData, request.filename, request.contentType);
    sendResponse({ received: true });
    return false;
  }
  else if (request.target === 'offscreen') {
    sendResponse({ received: true });
    return false;
  }
  
  sendResponse({ received: true });
  return false;
});

// 处理图片保存
async function handleSaveImage(imageUrl, filename) {
  try {
    const { savePath = 'AltImages' } = await chrome.storage.local.get('savePath');
    const safeFilename = filename.replace(/[<>:\"/\\|?*]/g, '_');
    const fullPath = `${savePath}/${safeFilename}`;
    
    console.log('准备保存:', fullPath);
    
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      await performDownload(imageUrl, fullPath);
    } else {
      await setupOffscreenDocument('offscreen.html');
      
      setTimeout(() => {
        chrome.runtime.sendMessage({
          target: 'offscreen',
          action: 'fetchImage',
          imageUrl: imageUrl,
          filename: fullPath
        }).catch(err => console.error('发送失败:', err));
      }, 100);
    }
  } catch (error) {
    console.error('保存失败:', error);
  }
}

// 执行下载
async function performDownload(urlOrData, filename, contentType) {
  try {
    let downloadUrl = urlOrData;
    
    if (urlOrData.startsWith && urlOrData.startsWith('data:')) {
      downloadUrl = urlOrData;
    }
    
    const downloadId = await chrome.downloads.download({
      url: downloadUrl,
      filename: filename,
      saveAs: false,
      conflictAction: 'uniquify'
    });
    
    console.log('下载开始, ID:', downloadId);
    
    // 获取短文件名用于通知
    const shortName = filename.split('/').pop();
    
    // 显示开始下载通知
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⬇️ 开始下载',
      message: shortName
    });
    
    // 监听下载状态
    chrome.downloads.onChanged.addListener(function listener(delta) {
      if (delta.id === downloadId && delta.state) {
        if (delta.state.current === 'complete') {
          console.log('下载完成:', filename);
          
          // 显示完成通知
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: '✓ 下载完成',
            message: shortName
          });
          
        } else if (delta.state.current === 'interrupted') {
          console.error('下载中断:', delta.error);
          
          // 显示失败通知
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: '✗ 下载失败',
            message: shortName
          });
        }
        
        // 移除监听器
        chrome.downloads.onChanged.removeListener(listener);
      }
    });
    
  } catch (error) {
    console.error('下载失败:', error);
    
    // 显示错误通知
    const simpleName = filename.split('/').pop();
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '✗ 下载出错',
      message: simpleName
    });
    
    // 降级保存到根目录
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
