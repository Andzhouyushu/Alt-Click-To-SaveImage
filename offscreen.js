// 离屏文档：仅用于获取跨域图片数据，然后传回 Service Worker 下载

chrome.runtime.onMessage.addListener((message) => {
  if (message.target === 'offscreen' && message.action === 'fetchImage') {
    fetchImage(message.imageUrl, message.filename);
  }
});

async function fetchImage(imageUrl, filename) {
  try {
    console.log('离屏文档获取图片:', imageUrl.substring(0, 50));
    
    // 使用 fetch 获取图片（离屏文档可以跨域）
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    // 获取图片数据和类型
    const blob = await response.blob();
    const contentType = blob.type || 'image/jpeg';
    
    // 转换为 Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      
      // 将数据发回 Service Worker 执行下载
      chrome.runtime.sendMessage({
        action: 'imageDataReady',
        imageData: base64data,
        filename: filename,
        contentType: contentType
      });
      
      console.log('图片数据已传回 Service Worker');
    };
    reader.readAsDataURL(blob);
    
  } catch (error) {
    console.error('获取图片失败:', error);
    
    // 失败时尝试直接让 Service Worker 下载原 URL
    chrome.runtime.sendMessage({
      action: 'imageDataReady',
      imageData: imageUrl,  // 传回原 URL
      filename: filename,
      contentType: ''
    });
  }
}