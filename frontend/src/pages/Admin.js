import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Upload, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import instance from '../api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Admin() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // 个人信息相关
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm] = Form.useForm();
  const [profile, setProfile] = useState({});

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  // 权限校验
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      message.warning('请先登录');
      navigate('/login');
    }
  }, [navigate]);

  // 获取文章列表
  const fetchArticles = () => {
    setLoading(true);
    instance.get('/api/article').then(res => {
      setLoading(false);
      if (res.data.code === 0) setArticles(res.data.data || []);
      else message.error('获取文章失败');
    });
  };

  // 获取个人信息
  const fetchProfile = () => {
    instance.get('/api/profile').then(res => {
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

  // 新增/编辑文章
  const handleOk = () => {
    form.validateFields().then(async values => {
      if (!values.cover) values.cover = null;
      if (editing) {
        // 编辑
        instance.put(`/api/article/${editing.id}`, values).then(res => {
          if (res.data.code === 0) {
            message.success('修改成功');
            setModalOpen(false);
            setEditing(null);
            fetchArticles();
          }
        });
      } else {
        // 新增
        instance.post('/api/article', values).then(res => {
          if (res.data.code === 0) {
            message.success('新增成功');
            setModalOpen(false);
            fetchArticles();
          }
        });
      }
    });
  };

  // 删除文章
  const handleDelete = id => {
    instance.delete(`/api/article/${id}`).then(res => {
      if (res.data.code === 0) {
        message.success('删除成功');
        fetchArticles();
      }
    });
  };

  // 打开编辑弹窗
  const openEdit = record => {
    setEditing(record);
    setModalOpen(true);
    form.setFieldsValue(record);
  };

  // 打开新增弹窗
  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
    form.resetFields();
  };

  // 个人信息弹窗保存
  const handleProfileOk = () => {
    profileForm.validateFields().then(values => {
      instance.put('/api/profile', values).then(res => {
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
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}> 
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
            valuePropName="value"
            getValueFromEvent={val => val}
          >
            <ReactQuill
              theme="snow"
              style={{ minHeight: 200 }}
              modules={{
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
                        const file = input.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        // 上传到后端
                        const res = await fetch(`${apiUrl}/upload`, {
                          method: 'POST',
                          body: formData
                        });
                        const data = await res.json();
                        if (data.code === 0) {
                          const quill = this.quill;
                          const range = quill.getSelection();
                          quill.insertEmbed(range.index, 'image', `${apiUrl.replace('/api','')}${data.url}`);
                        }
                      };
                    }
                  }
                }
              }}
              onPaste={(e) => {
                const clipboardData = e.clipboardData;
                if (!clipboardData) return;
                
                // 检查剪贴板中是否包含图片
                const items = clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    
                    // 获取图片文件
                    const file = items[i].getAsFile();
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    // 上传图片
                    fetch(`${apiUrl}/upload`, {
                      method: 'POST',
                      body: formData
                    })
                    .then(res => res.json())
                    .then(data => {
                      if (data.code === 0) {
                        // 获取编辑器实例和当前选择位置
                        const quill = e.target.getEditor();
                        const range = quill.getSelection();
                        // 在当前光标位置插入图片
                        quill.insertEmbed(range ? range.index : 0, 'image', `${apiUrl.replace('/api','')}${data.url}`);
                      }
                    })
                    .catch(err => {
                      console.error('图片上传失败:', err);
                      message.error('图片上传失败');
                    });
                    
                    break;
                  }
                }
              }}
            />
          </Form.Item>
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
                return isImg;
              }}
              onChange={info => {
                if (info.file.status === 'done') {
                  form.setFieldValue('cover', info.file.response.url);
                  message.success('上传成功');
                }
              }}
            >
              {form.getFieldValue('cover') ? (
                <Image src={`${apiUrl.replace('/api','')}${form.getFieldValue('cover')}`} width={80} />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
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
                return isImg;
              }}
              onChange={info => {
                if (info.file.status === 'done') {
                  profileForm.setFieldValue('avatar', info.file.response.url);
                  message.success('上传成功');
                }
              }}
            >
              {profileForm.getFieldValue('avatar') ? (
                <Image src={`${apiUrl.replace('/api','')}${profileForm.getFieldValue('avatar')}`} width={80} />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="简介">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
