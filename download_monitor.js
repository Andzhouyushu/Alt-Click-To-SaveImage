// 监听下载事件，给出明确的路径提示
chrome.downloads.onCreated.addListener((item) => {
  console.log('下载创建:', item);
  
  // 获取完整路径
  chrome.downloads.search({id: item.id}, (results) => {
    if (results && results[0]) {
      const downloadItem = results[0];
      console.log('完整路径:', downloadItem.filename);
      
      // 可以在这里显示更详细的通知
      showPathNotification(downloadItem.filename);
    }
  });
});

function showPathNotification(fullPath) {
  // 提取文件夹和文件名
  const pathParts = fullPath.split(/[\\\/]/);
  const fileName = pathParts.pop();
  const folder = pathParts.pop() || 'Downloads';
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '图片已保存',
    message: `位置: ${folder}\\${fileName}`,
    priority: 1
  });
}