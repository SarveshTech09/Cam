'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Space, Card, Row, Col, Statistic, Divider } from 'antd';
import { UserOutlined, MailOutlined, TeamOutlined, AppstoreOutlined, LogoutOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function HomePage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleMenuClick = (key: string) => {
    setActiveMenu(key);
    if (key === 'gallery') {
      router.push('/gallery');
    } else if (key === 'upload') {
      router.push('/upload');
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <AppstoreOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'gallery',
      icon: <PictureOutlined />,
      label: 'Gallery',
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: 'Upload',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Users',
    },
    {
      key: 'messages',
      icon: <MailOutlined />,
      label: 'Messages',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Text>Loading...</Text>
      </div>
    );
  }

  if (!user) {
    return null; // Return nothing while redirecting
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header" style={{ background: '#fff', padding: 0, display: 'flex', alignItems: 'center' }}>
        <div className="logo" style={{ padding: '0 24px', fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
          CAM App
        </div>
        <div style={{ marginLeft: 'auto', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <Text strong>Welcome, {user.name || user.email}</Text>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleSignOut}
            style={{ marginLeft: 16 }}
          >
            Sign Out
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          style={{ background: '#fff', marginTop: 16, marginLeft: 16, borderRadius: 8 }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['dashboard']}
            selectedKeys={[activeMenu]}
            onClick={({ key }) => handleMenuClick(key)}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '24px', marginLeft: 16 }}>
          <Content style={{ padding: 24, margin: 0, minHeight: 280, background: '#fff', borderRadius: 8 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Images"
                    value={12}
                    precision={0}
                    styles={{ content: { color: '#3f8600' } }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Active Sessions"
                    value={123}
                    precision={0}
                    styles={{ content: { color: '#3f8600' } }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Messages"
                    value={456}
                    precision={0}
                    styles={{ content: { color: '#cf1322' } }}
                  />
                </Card>
              </Col>
            </Row>
            <Divider />
            <div style={{ padding: '24px 0' }}>
              <Title level={2}>Welcome to Your Dashboard</Title>
              <Text>
                This is your personalized home page. Here you can manage your account, 
                view statistics, and access various features of the application.
              </Text>
            </div>
            
            <div style={{ marginTop: 24 }}>
              <Title level={4}>Recent Activity</Title>
              <Space vertical style={{ width: '100%' }}>
                <Card size="small">
                  <Text>User {user.name || user.email} logged in</Text>
                  <Text type="secondary" style={{ float: 'right' }}>Just now</Text>
                </Card>
                <Card size="small">
                  <Text>Gallery updated with new images</Text>
                  <Text type="secondary" style={{ float: 'right' }}>2 hours ago</Text>
                </Card>
                <Card size="small">
                  <Text>New message received</Text>
                  <Text type="secondary" style={{ float: 'right' }}>Yesterday</Text>
                </Card>
              </Space>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}