/**
 * Alt+Click 图片保存器 - 内容脚本
 * 作者：WilliamJoy
 * 版本：1.0.0
 * powered by kimi
 */



(function() {
  'use strict';
  
  // 检测扩展上下文是否失效
  function isExtensionValid() {
    try {
      chrome.runtime.getURL('');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  let isAltPressed = false;
  
  // 键盘事件
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Alt' || e.altKey) {
      isAltPressed = true;
      document.body.classList.add('alt-image-saver-active');
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Alt') {
      isAltPressed = false;
      document.body.classList.remove('alt-image-saver-active');
    }
  });
  
  window.addEventListener('blur', () => {
    isAltPressed = false;
    document.body.classList.remove('alt-image-saver-active');
  });
  
  // 图片点击处理
  document.addEventListener('click', handleImageClick, true);
  
  function handleImageClick(e) {
    if (!isAltPressed) return;
    
    // 检查扩展是否有效
    if (!isExtensionValid()) {
      showErrorTip(e.clientX, e.clientY, '扩展已更新，请刷新页面');
      return;
    }
    
    const img = findImageElement(e.target);
    if (!img) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const imageUrl = getImageUrl(img);
    if (!imageUrl) {
      showErrorTip(e.clientX, e.clientY, '无法获取图片地址');
      return;
    }
    
    const filename = generateFilename(imageUrl, img);
    
    // 发送消息
    try {
      chrome.runtime.sendMessage({
        action: 'saveImage',
        imageUrl: imageUrl,
        filename: filename
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('发送失败:', chrome.runtime.lastError);
          showErrorTip(e.clientX, e.clientY, '发送失败，请刷新页面');
        } else {
          showSuccessTip(e.clientX, e.clientY, filename);
        }
      });
    } catch (err) {
      showErrorTip(e.clientX, e.clientY, '扩展错误，请刷新页面');
    }
  }
  
  // 查找图片元素
  function findImageElement(target) {
    if (target.tagName === 'IMG') return target;
    if (target.querySelector('img')) return target.querySelector('img');
    const parent = target.closest('img');
    if (parent) return parent;
    
    // 检查背景图
    const style = window.getComputedStyle(target);
    const bgImage = style.backgroundImage;
    if (bgImage && bgImage !== 'none') {
      const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (match) {
        return { src: match[1], isBg: true, element: target };
      }
    }
    return null;
  }
  
  function getImageUrl(img) {
    if (img.isBg) return img.src;
    return img.dataset.src || img.dataset.original || img.src || img.currentSrc;
  }
  
  function generateFilename(url, img) {
    const timestamp = Date.now();
    let ext = 'jpg';
    let name = 'image';
    
    try {
      if (url.startsWith('data:')) {
        const mimeMatch = url.match(/data:image\/(\w+);/);
        if (mimeMatch) {
          ext = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];
        }
        name = 'base64_image';
      } else {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const originalName = pathname.split('/').pop();
        
        if (originalName && originalName.includes('.')) {
          const parts = originalName.split('.');
          ext = parts.pop().toLowerCase();
          if (ext.length > 4) ext = 'jpg';
          name = parts.join('.').substring(0, 50);
        }
      }
    } catch (e) {}
    
    name = name.replace(/[<>:\"/\\|?*]/g, '_');
    return `${name}_${timestamp}.${ext}`;
  }
  
  function showSuccessTip(x, y, filename) {
    showTip(x, y, `✓ 已保存: ${filename.substring(0, 20)}...`, '#10b981');
  }
  
  function showErrorTip(x, y, msg) {
    showTip(x, y, `✗ ${msg}`, '#ef4444');
  }
  
  function showTip(x, y, text, color) {
    const tip = document.createElement('div');
    tip.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y - 50}px;
      background: ${color};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-family: system-ui, sans-serif;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 2147483647;
      pointer-events: none;
      transform: translateX(-50%);
      animation: tipPop 0.3s ease;
      white-space: nowrap;
    `;
    tip.textContent = text;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes tipPop {
        0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
        50% { transform: translateX(-50%) scale(1.1); }
        100% { transform: translateX(-50%) scale(1); opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(tip);
    
    setTimeout(() => {
      tip.style.opacity = '0';
      tip.style.transition = 'opacity 0.3s';
      setTimeout(() => tip.remove(), 300);
    }, 2000);
  }
  
  // 添加悬停样式
  const style = document.createElement('style');
  style.textContent = `
    .alt-image-saver-active { cursor: crosshair !important; }
    .alt-image-saver-active img { cursor: crosshair !important; }
    .alt-image-saver-active img:hover {
      outline: 3px solid #667eea !important;
      outline-offset: 2px !important;
      filter: brightness(1.1) !important;
    }
  `;
  document.head.appendChild(style);
})();