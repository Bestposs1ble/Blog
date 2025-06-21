import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Upload, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import instance from '../api';
import 'react-quill/dist/quill.snow.css';
import CustomQuillEditor from './CustomQuillEditor';

export default function Admin() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  // 新增：单独管理富文本内容
  const [quillValue, setQuillValue] = useState('');
  const quillEditorRef = useRef(null);
  const editorDomRef = useRef(null); // 用于跟踪编辑器DOM元素

  // 个人信息相关
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm] = Form.useForm();
  const [profile, setProfile] = useState({});

  const navigate = useNavigate();

  // 根据环境设置API地址
  const apiUrl = '/api';

  // 权限校验
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      message.warning('请先登录');
      navigate('/login');
    }
  }, [navigate]);

  // 监听编辑器DOM挂载
  useEffect(() => {
    if (modalOpen) {
      // 当Modal打开时，监听编辑器DOM挂载
      const checkEditorMounted = () => {
        const editorEl = document.querySelector('.ql-editor');
        if (editorEl && !editorDomRef.current) {
          editorDomRef.current = editorEl;
          console.log('编辑器DOM已挂载');
          
          // 设置初始内容
          if (editing) {
            const safeContent = typeof editing.content === 'string' ? editing.content : '<p><br></p>';
            if (safeContent && safeContent !== '<p><br></p>') {
              console.log('通过DOM设置编辑内容');
              editorEl.innerHTML = safeContent;
            }
          } else {
            editorEl.innerHTML = '<p><br></p>';
          }
        }
      };
      
      // 定期检查DOM挂载
      const intervalId = setInterval(checkEditorMounted, 100);
      
      return () => {
        clearInterval(intervalId);
        editorDomRef.current = null; // 清理引用
      };
    }
  }, [modalOpen, editing]);

  // 获取文章列表
  const fetchArticles = () => {
    setLoading(true);
    instance.get('/article').then(res => {
      setLoading(false);
      if (res.data.code === 0) setArticles(res.data.data || []);
      else message.error('获取文章失败');
    });
  };

  // 获取个人信息
  const fetchProfile = () => {
    instance.get('/profile').then(res => {
      if (res.data.code === 0) {
        setProfile(res.data.data || {});
        profileForm.setFieldsValue(res.data.data || {});
      }
    });
  };

  useEffect(() => {
    fetchArticles();
    fetchProfile();
  }, []);

  // 保存文章
  const handleOk = () => {
    form.validateFields().then(async values => {
      try {
        // 直接从DOM获取编辑器内容
        let finalContent = '';
        const editor = document.querySelector('.ql-editor');
        
        if (editor) {
          // 从DOM获取内容
          finalContent = editor.innerHTML || '';
          console.log('从DOM获取编辑器内容:', finalContent.substring(0, 50));
        } else if (quillEditorRef.current) {
          // 备用方法：从ref获取内容
        try {
            const quillEditor = quillEditorRef.current.getEditor();
            if (quillEditor && quillEditor.root) {
              finalContent = quillEditor.root.innerHTML;
              console.log('从ref获取编辑器内容:', finalContent.substring(0, 50));
            } else {
              finalContent = quillEditorRef.current.getValue() || values.content || '';
            }
          } catch (e) {
            console.error('从ref获取编辑器内容失败:', e);
            // 使用表单中的值
            finalContent = values.content || '';
          }
        } else {
          // 最终备选：使用表单中的值
          finalContent = values.content || '';
        }
        
        // 检查内容是否为空（仅含有空白字符、空段落或只有格式化标签）
        let hasContent = false;
        
        // 方法1：检查纯文本
        try {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = finalContent;
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          hasContent = textContent.trim().length > 0;
          console.log('纯文本内容检查:', textContent.trim(), hasContent);
        } catch (e) {
          console.error('纯文本检查失败:', e);
      }
      
        // 方法2：检查是否有图片
        if (!hasContent) {
          hasContent = finalContent.includes('<img');
          console.log('图片检查:', hasContent);
        }
        
        // 如果没有实际内容就提示并返回
        if (!hasContent) {
          finalContent = '<p><br></p>';
          message.warning('文章内容不能为空');
          return;
      }
      
      // 最终提交的数据
      const submitData = {
        ...values,
          content: finalContent || '<p><br></p>'
      };
      
      // 处理空封面
      if (!submitData.cover) submitData.cover = null;
      
      console.log('准备提交文章数据:', {
        title: submitData.title,
        contentLength: submitData.content.length,
          contentHasData: submitData.content !== '<p><br></p>',
        contentPreview: submitData.content.substring(0, 30),
        cover: submitData.cover
      });
      
        // 提交数据
      if (editing) {
        // 编辑
          const response = await instance.put(`/article/${editing.id}`, submitData);
          if (response.data.code === 0) {
              message.success('修改成功');
              setModalOpen(false);
              setEditing(null);
              fetchArticles();
            } else {
            message.error('修改失败: ' + (response.data.msg || '未知错误'));
            }
      } else {
        // 新增
          const response = await instance.post('/article', submitData);
          if (response.data.code === 0) {
              message.success('新增成功');
              setModalOpen(false);
              fetchArticles();
            } else {
            message.error('新增失败: ' + (response.data.msg || '未知错误'));
            }
        }
      } catch (err) {
        console.error('提交文章请求失败:', err);
        message.error('操作失败: ' + (err.response?.data?.msg || err.message || '请求错误'));
      }
    }).catch(errors => {
      console.error('表单验证错误:', errors);
      message.error('请检查表单填写是否正确');
    });
  };

  // 删除文章
  const handleDelete = id => {
    instance.delete(`/article/${id}`).then(res => {
      if (res.data.code === 0) {
        message.success('删除成功');
        fetchArticles();
      }
    });
  };

  // 打开编辑弹窗
  const openEdit = record => {
    // 确保所有表单字段重置，再进行设置
    form.resetFields();

    // 确保内容字符串有效
    const safeContent = typeof record.content === 'string' ? record.content : '';
    console.log('打开编辑窗口，内容长度:', safeContent.length, '预览:', safeContent.substring(0, 50));

    // 先设置状态，但不立即打开对话框
    setEditing(record);
    setModalOpen(false); // 确保关闭状态
    
    // 先设置编辑器值
    setQuillValue(safeContent);
    
    // 设置表单所有字段（除内容外）
    form.setFieldsValue({
      title: record.title,
      cover: record.cover,
      // 不在这里设置content，因为它会在quill组件渲染时被传入
    });
    
    // 延迟打开对话框，确保组件有时间更新
    setTimeout(() => {
      setModalOpen(true);
      
      // 二次延迟，确保内容被填充
      setTimeout(() => {
        try {
          // 设置隐藏的内容表单字段
          form.setFieldsValue({
            content: safeContent
          });
          
          // 确保编辑器内容已正确设置
        if (quillEditorRef.current) {
          try {
            const editor = quillEditorRef.current.getEditor();
            if (editor && editor.root) {
                // 先清空再设置内容，避免格式问题
                editor.root.innerHTML = '';
                setTimeout(() => {
                editor.root.innerHTML = safeContent;
                }, 50);
              }
            } catch (e) {
              console.error('设置编辑器内容失败', e);
            }
          }
        } catch (e) {
          console.error('二次设置表单内容失败', e);
        }
      }, 300);
    }, 100);
  };

  // 打开新增弹窗
  const openAdd = () => {
    // 先重置所有状态
    setEditing(null);
    form.resetFields();
    setQuillValue('');
    
    // 延迟打开对话框
    setTimeout(() => {
      setModalOpen(true);
      
      // 确保内容字段为空
      form.setFieldsValue({ content: '<p><br></p>' });
      
      // 确保编辑器内容正确初始化
      setTimeout(() => {
        if (quillEditorRef.current) {
          try {
            const editor = quillEditorRef.current.getEditor();
            if (editor && editor.root) {
              // 确保编辑器内容为空白段落
              editor.root.innerHTML = '<p><br></p>';
            }
          } catch (e) {
            console.error('初始化编辑器内容失败', e);
            
            // 直接操作DOM
            try {
              const editorEl = document.querySelector('.ql-editor');
              if (editorEl) {
                editorEl.innerHTML = '<p><br></p>';
              }
            } catch (domError) {
              console.error('DOM操作初始化编辑器失败', domError);
            }
          }
        }
      }, 300);
    }, 100);
  };

  // 个人信息弹窗保存
  const handleProfileOk = () => {
    profileForm.validateFields().then(values => {
      instance.put('/profile', values).then(res => {
        if (res.data.code === 0) {
          message.success('保存成功');
          setProfileModalOpen(false);
          fetchProfile();
        }
      });
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      {/* 顶部按钮栏 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button onClick={() => navigate('/logs')} style={{ marginRight: 8 }}>
          访客统计
        </Button>
        <Button onClick={() => setProfileModalOpen(true)} style={{ marginRight: 8 }}>
          个人信息
        </Button>
        <Button onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}>
          退出登录
        </Button>
      </div>
      <Button type="primary" onClick={openAdd} style={{ marginBottom: 16 }}>
        新增文章
      </Button>
      <Table
        rowKey="id"
        dataSource={articles}
        loading={loading}
        columns={[
          { title: '标题', dataIndex: 'title' },
          { title: '创建时间', dataIndex: 'created_at' },
          {
            title: '操作',
            render: (_, record) => (
              <>
                <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
                <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
                  <Button type="link" danger>删除</Button>
                </Popconfirm>
              </>
            )
          }
        ]}
      />

      {/* 新增/编辑文章弹窗 */}
      <Modal
        title={editing ? '编辑文章' : '新增文章'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        afterClose={() => {
          // 彻底清理资源
          if (quillEditorRef.current) {
            try {
              quillEditorRef.current.clear();
            } catch (e) {
              console.error('清理编辑器失败', e);
            }
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}> 
            <Input />
          </Form.Item>
          {/* 隐藏内容表单项，只做数据同步用 */}
          <Form.Item name="content" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>内容</label>
            <CustomQuillEditor
              ref={quillEditorRef}
              theme="snow"
              value={quillValue}
              onChange={val => {
                try {
                  // 确保值总是字符串
                  const safeVal = typeof val === 'string' ? val : '';
                  
                  // 如果编辑器内容为空，确保输出至少有一个空段落
                  const finalVal = safeVal.trim() === '' ? '<p><br></p>' : safeVal;
                  
                  // 更新状态和表单
                  setQuillValue(finalVal);
                  form.setFieldsValue({ content: finalVal });
                  
                  // 添加防御性检查，确保内容设置正确
                  setTimeout(() => {
                    const editorContent = document.querySelector('.ql-editor');
                    if (editorContent && !editorContent.innerHTML.trim() && finalVal !== '<p><br></p>') {
                      console.log('检测到内容未正确设置，尝试手动设置');
                      editorContent.innerHTML = finalVal;
                    }
                  }, 0);
                } catch (err) {
                  console.error('富文本编辑器错误:', err);
                }
              }}
              style={{ minHeight: 200 }}
              modules={{
                clipboard: {
                  matchVisual: false // 禁用视觉匹配以避免格式问题
                },
                toolbar: {
                  container: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ],
                  handlers: {
                    image: function () {
                      const input = document.createElement('input');
                      input.setAttribute('type', 'file');
                      input.setAttribute('accept', 'image/*');
                      input.click();
                      input.onchange = async () => {
                        if (!input.files || !input.files[0]) return;
                        
                        const file = input.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        try {
                          message.loading({
                            content: '图片上传中...',
                            key: 'imgUpload',
                            duration: 0
                          });
                          
                          // 上传到后端
                          const res = await fetch(`${apiUrl}/upload`, {
                            method: 'POST',
                            body: formData
                          });
                          
                          if (!res.ok) {
                            throw new Error('网络请求失败');
                          }
                          
                          const data = await res.json();
                          
                          if (data.code === 0) {
                            message.success({
                              content: '图片上传成功',
                              key: 'imgUpload',
                              duration: 1
                            });
                            
                            // 生成正确的图片URL
                            const imageUrl = (() => {
                              if (data.url.startsWith('http')) return data.url;
                              if (data.url.startsWith('/uploads/')) return data.url;
                              return `/uploads/${data.url.replace(/^\/+/,'')}`;
                            })();
                            
                            // 图片上传成功，延迟一点点再插入，确保编辑器已准备好
                            setTimeout(() => {
                              try {
                                if (quillEditorRef.current) {
                                  quillEditorRef.current.insertImage(imageUrl);
                                }
                              } catch (err) {
                                console.error('图片插入错误:', err);
                              }
                            }, 10); 
                          } else {
                            throw new Error(data.msg || '上传失败');
                          }
                        } catch (err) {
                          console.error('图片上传失败:', err);
                          message.error({
                            content: '图片上传失败: ' + (err.message || '未知错误'),
                            key: 'imgUpload'
                          });
                        }
                      };
                    }
                  }
                }
              }}
              onPaste={(e) => {
                try {
                  const clipboardData = e.clipboardData;
                  if (!clipboardData) return;
                  
                  // 检查剪贴板中是否包含图片
                  const items = clipboardData.items;
                  let hasImage = false;
                  
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                      hasImage = true;
                      e.preventDefault(); // 阻止默认粘贴行为
                      
                      // 获取图片文件
                      const file = items[i].getAsFile();
                      if (!file) continue;
                      
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      // 显示上传中状态
                      message.loading({
                        content: '粘贴图片上传中...',
                        key: 'pasteUpload',
                        duration: 0
                      });
                      
                      // 上传图片
                      fetch(`${apiUrl}/upload`, {
                        method: 'POST',
                        body: formData
                      })
                      .then(res => {
                        if (!res.ok) {
                          throw new Error('网络请求失败');
                        }
                        return res.json();
                      })
                      .then(data => {
                        if (data.code === 0) {
                          message.success({
                            content: '图片粘贴成功',
                            key: 'pasteUpload',
                            duration: 1
                          });
                          
                          try {
                            // 生成正确的图片 URL
                            const imageUrl = (() => {
                              if (data.url.startsWith('http')) return data.url;
                              if (data.url.startsWith('/uploads/')) return data.url;
                              return `/uploads/${data.url.replace(/^\/+/,'')}`;
                            })();
                            
                            // 延迟一点点再插入，确保编辑器已准备好
                            setTimeout(() => {
                              // 使用自定义方法插入图片
                              if (quillEditorRef.current) {
                                quillEditorRef.current.insertImage(imageUrl);
                              }
                            }, 10);
                          } catch (err) {
                            console.error('插入图片错误:', err);
                          }
                        } else {
                          throw new Error(data.msg || '上传失败');
                        }
                      })
                      .catch(err => {
                        console.error('图片上传失败:', err);
                        message.error({
                          content: '图片上传失败: ' + (err.message || '未知错误'),
                          key: 'pasteUpload'
                        });
                      });
                      break;
                    }
                  }
                  
                  // 如果没有图片，让默认粘贴行为继续
                  if (!hasImage) return;
                } catch (err) {
                  console.error('粘贴图片错误:', err);
                  // 遇到错误也让默认粘贴继续
                }
              }}
            />
          </div>
          <Form.Item name="cover" label="封面图">
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              action={`${apiUrl}/upload`}
              beforeUpload={file => {
                const isImg = file.type.startsWith('image/');
                if (!isImg) {
                  message.error('只能上传图片文件');
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('图片必须小于2MB!');
                }
                return isImg && isLt2M;
              }}
              onChange={info => {
                if (info.file.status === 'done') {
                  if (info.file.response && info.file.response.code === 0) {
                    form.setFieldValue('cover', info.file.response.url);
                    message.success('上传成功');
                  } else {
                    message.error('上传失败: ' + (info.file.response ? info.file.response.msg : '未知错误'));
                    form.setFieldValue('cover', null);
                  }
                } else if (info.file.status === 'error') {
                  message.error('上传失败: 服务器错误');
                  form.setFieldValue('cover', null);
                }
              }}
            >
              {form.getFieldValue('cover') ? (
                <Image 
                  src={(() => {
                    const cover = form.getFieldValue('cover');
                    if (!cover) return '';
                    if (cover.startsWith('http')) return cover;
                    if (cover.startsWith('/uploads/')) return cover;
                    return `/uploads/${cover.replace(/^\/+/,'')}`;
                  })()}
                  width={80}
                />
              ) : (
                <div>上传</div>
              )}
            </Upload>
            <div>封面图预览</div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 个人信息弹窗 */}
      <Modal
        title="个人信息"
        open={profileModalOpen}
        onOk={handleProfileOk}
        onCancel={() => setProfileModalOpen(false)}
        destroyOnClose
      >
        <Form form={profileForm} layout="vertical">
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="头像">
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              action={`${apiUrl}/upload`}
              beforeUpload={file => {
                const isImg = file.type.startsWith('image/');
                if (!isImg) {
                  message.error('只能上传图片文件');
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('图片必须小于2MB!');
                }
                return isImg && isLt2M;
              }}
              onChange={info => {
                if (info.file.status === 'done') {
                  if (info.file.response && info.file.response.code === 0) {
                    profileForm.setFieldValue('avatar', info.file.response.url);
                    message.success('上传成功');
                  } else {
                    message.error('上传失败: ' + (info.file.response ? info.file.response.msg : '未知错误'));
                    profileForm.setFieldValue('avatar', null);
                  }
                } else if (info.file.status === 'error') {
                  message.error('上传失败: 服务器错误');
                  profileForm.setFieldValue('avatar', null);
                }
              }}
            >
              {profileForm.getFieldValue('avatar') ? (
                <Image
                  src={(() => {
                    const avatar = profileForm.getFieldValue('avatar');
                    if (!avatar) return '';
                    if (avatar.startsWith('http')) return avatar;
                    if (avatar.startsWith('/uploads/')) return avatar;
                    return `/uploads/${avatar.replace(/^\/+/, '')}`;
                  })()}
                  width={80}
                />
              ) : (
                <div>上传</div>
              )}
            </Upload>
            <div>头像预览</div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}