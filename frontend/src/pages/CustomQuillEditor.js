import React, { useEffect, useRef, forwardRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// 完全重写的编辑器组件，使用非受控模式避免选区问题
const CustomQuillEditor = forwardRef(({ value, onChange, ...props }, ref) => {
  // 安全值处理
  const safeValue = typeof value === 'string' ? value : '';
  
  // 使用状态跟踪编辑器内容和挂载状态
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [initialContent] = useState(safeValue); // 保存初始内容以便正确初始化
  
  // 重要的引用，用于保存实际状态
  const quillRef = useRef(null);
  const contentRef = useRef(safeValue);
  const pendingOpsRef = useRef([]);
  const ignoreChangeRef = useRef(false);
  const editorInstanceRef = useRef(null);
  
  // 调试初始内容
  useEffect(() => {
    console.log('初始内容预览:', (safeValue || '').substring(0, 50));
  }, [safeValue]);
  
  // 编辑器初始化
  useEffect(() => {
    console.log('初始化编辑器，内容长度:', safeValue.length);
    
    // 延迟挂载，等待 DOM 稳定
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    
    return () => {
      clearTimeout(timer);
      editorInstanceRef.current = null;
    };
  }, [safeValue]);
  
  // 编辑器准备好后，应用初始内容
  const handleReady = (editor) => {
    try {
      editorInstanceRef.current = editor;
      console.log('编辑器实例准备就绪');
      
      // 特意等待一下，确保编辑器完全准备好
      setTimeout(() => {
        try {
          // 初始化内容
          if (safeValue) {
            console.log('应用初始内容');
            // 暂停变更通知
            ignoreChangeRef.current = true;
            
            // 安全设置内容 - 尝试直接设置HTML内容
            try {
              // 先清空内容
              editor.root.innerHTML = '';
              
              // 使用原生DOM API设置内容，确保最大兼容性
              editor.root.innerHTML = safeValue;
              
              // 备份到内容引用
              contentRef.current = safeValue;
              console.log('初始内容设置成功');
            } catch (e) {
              console.error('直接设置HTML失败，尝试备用方法', e);
              
              // 备用方法：clipboard API
              try {
                editor.clipboard.dangerouslyPasteHTML(safeValue);
                contentRef.current = safeValue;
              } catch (backupError) {
                console.error('备用设置内容也失败', backupError);
              }
            }
          } else {
            console.log('无初始内容');
            editor.root.innerHTML = '<p><br></p>';
          }
          
          // 通知编辑器更新
          try {
            editor.update();
          } catch (e) {
            console.error('编辑器更新失败', e);
          }
          
          // 恢复变更通知
          setTimeout(() => {
            ignoreChangeRef.current = false;
            setIsReady(true);
            
            // 处理挂起的操作
            if (pendingOpsRef.current.length > 0) {
              pendingOpsRef.current.forEach(op => op());
              pendingOpsRef.current = [];
            }
          }, 100);
        } catch (innerError) {
          console.error('设置初始内容过程中出错', innerError);
          setIsReady(true);
        }
      }, 200);
    } catch (e) {
      console.error('编辑器初始化错误', e);
      setIsReady(true);
    }
  };
  
  // 安全处理内容变更
  const handleChange = () => {
    if (ignoreChangeRef.current || !editorInstanceRef.current) return;
    
    try {
      // 获取 HTML 内容并通知父组件
      let html = '';
      
      // 尝试多种方法获取内容
      try {
        // 方法1：直接从DOM获取最新内容
        html = editorInstanceRef.current.root.innerHTML || '';
      } catch (e) {
        console.error('从DOM获取内容失败:', e);
        
        // 方法2：使用getText转换为纯文本
        try {
          const text = editorInstanceRef.current.getText() || '';
          html = text ? `<p>${text}</p>` : '<p><br></p>';
        } catch (e2) {
          console.error('获取文本内容失败:', e2);
          html = contentRef.current || '<p><br></p>'; // 使用缓存的内容
        }
      }
      
      // 调试输出
      console.log('编辑器内容变更:', html.substring(0, 50));
      
      // 检查内容是否真的为空（不仅仅是HTML标签）
      let isEmpty = false;
      try {
        // 创建DOM元素解析HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        isEmpty = !textContent.trim() && !html.includes('<img');
      } catch (e) {
        console.error('获取纯文本内容失败:', e);
        // 降级到简单检查
        isEmpty = html === '' || html === '<p><br></p>';
      }
      
      // 根据内容是否为空设置引用值
      if (isEmpty) {
        contentRef.current = '<p><br></p>';
      } else {
        contentRef.current = html;
      }
      
      if (onChange && typeof onChange === 'function') {
        onChange(contentRef.current);
        
        // 确保内容在DOM中正确设置
        setTimeout(() => {
          try {
            if (editorInstanceRef.current && editorInstanceRef.current.root) {
              if (!editorInstanceRef.current.root.innerHTML && contentRef.current !== '<p><br></p>') {
                console.log('修正编辑器内容');
                editorInstanceRef.current.root.innerHTML = contentRef.current;
              }
            }
          } catch (e) {
            console.error('尝试修正内容失败:', e);
          }
        }, 10);
      }
    } catch (e) {
      console.error('内容变更处理错误', e);
    }
  };
  
  // 处理 value prop 变化
  useEffect(() => {
    // 只在编辑器准备好后处理 value 变化
    if (!isReady || !editorInstanceRef.current) return;
    
    const newValue = typeof value === 'string' ? value : '';
    
    // 如果值为空且编辑器刚刚初始化，不做更新
    if (!newValue && isReady) return;
    
    // 避免不必要的更新
    if (newValue === contentRef.current) return;
    
    console.log('编辑器值变化', newValue.substring(0, 30));
    
    // 更新操作
    const updateContent = () => {
      try {
        if (editorInstanceRef.current) {
          // 暂停变更通知
          ignoreChangeRef.current = true;
          
          try {
            // 直接设置HTML
            editorInstanceRef.current.root.innerHTML = newValue;
            contentRef.current = newValue;
          } catch (e) {
            // 备用方法
            console.error('直接设置HTML失败，尝试备用方法', e);
            editorInstanceRef.current.setContents([]);
            editorInstanceRef.current.clipboard.dangerouslyPasteHTML(newValue);
            contentRef.current = newValue;
          }
          
          // 恢复变更通知
          setTimeout(() => {
            ignoreChangeRef.current = false;
          }, 0);
        }
      } catch (e) {
        console.error('更新内容失败', e);
        ignoreChangeRef.current = false;
      }
    };
    
    // 如果编辑器准备好了就立即更新，否则加入等待队列
    if (isReady && editorInstanceRef.current) {
      updateContent();
    } else {
      pendingOpsRef.current.push(updateContent);
    }
  }, [value, isReady]);
  
  // 暴露 API 给父组件
  React.useImperativeHandle(ref, () => ({
    getEditor: () => editorInstanceRef.current,
    
    focus: () => {
      const queue = () => {
        try {
          if (editorInstanceRef.current) {
            editorInstanceRef.current.focus();
          }
        } catch (e) {
          console.error('设置焦点失败', e);
        }
      };
      
      if (isReady && editorInstanceRef.current) {
        queue();
      } else {
        pendingOpsRef.current.push(queue);
      }
    },
    
    clear: () => {
      const queue = () => {
        try {
          if (editorInstanceRef.current) {
            ignoreChangeRef.current = true;
            editorInstanceRef.current.setContents([]);
            contentRef.current = '<p><br></p>';
            setTimeout(() => {
              ignoreChangeRef.current = false;
              if (onChange && typeof onChange === 'function') {
                onChange(contentRef.current);
              }
            }, 0);
          }
        } catch (e) {
          console.error('清空编辑器失败', e);
          ignoreChangeRef.current = false;
        }
      };
      
      if (isReady && editorInstanceRef.current) {
        queue();
      } else {
        pendingOpsRef.current.push(queue);
      }
    },
    
    insertText: (text) => {
      const queue = () => {
        try {
          if (editorInstanceRef.current && typeof text === 'string') {
            const length = editorInstanceRef.current.getLength();
            editorInstanceRef.current.insertText(length - 1, text);
            handleChange();
          }
        } catch (e) {
          console.error('插入文本失败', e);
        }
      };
      
      if (isReady && editorInstanceRef.current) {
        queue();
      } else {
        pendingOpsRef.current.push(queue);
      }
    },
    
    insertImage: (imageUrl) => {
      const queue = () => {
        try {
          if (editorInstanceRef.current && typeof imageUrl === 'string') {
            const length = editorInstanceRef.current.getLength();
            editorInstanceRef.current.insertEmbed(length - 1, 'image', imageUrl);
            handleChange();
          }
        } catch (e) {
          // 尝试备用方案
          console.error('插入图片失败，尝试备用方案', e);
          try {
            if (editorInstanceRef.current) {
              editorInstanceRef.current.focus();
              
              // 直接操作 HTML 插入图片
              const currentContent = editorInstanceRef.current.root.innerHTML || '';
              const imgTag = `<img src="${imageUrl}" alt="uploaded image" />`;
              editorInstanceRef.current.root.innerHTML = currentContent + imgTag;
              
              // 手动触发内容变更
              handleChange();
            }
          } catch (backupError) {
            console.error('备用插入图片也失败', backupError);
          }
        }
      };
      
      if (isReady && editorInstanceRef.current) {
        queue();
      } else {
        pendingOpsRef.current.push(queue);
      }
    },
    
    getValue: () => contentRef.current
  }));

  return mounted ? (
    <ReactQuill
      ref={quillRef}
      onReady={handleReady}
      onChange={handleChange}
      defaultValue={safeValue} // 同时使用默认值，提供额外保障
      modules={{
        clipboard: {
          matchVisual: false // 禁用视觉匹配，避免格式问题
        },
        ...props.modules
      }}
      {...props}
    />
  ) : (
    <div style={{ minHeight: props.style?.minHeight || 200, border: '1px solid #d9d9d9' }}>加载编辑器中...</div>
  );
});

export default CustomQuillEditor; 