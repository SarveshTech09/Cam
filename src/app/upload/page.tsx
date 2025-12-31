'use client';

import React, { useState, useEffect } from "react";
import { Card, Flex, theme, Typography, Form, Input, Button, Upload, message, Divider, Row, Col, Image, Modal, Space } from "antd";
import { UploadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ArrowLeftOutlined, MoreOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import { useRouter } from 'next/navigation';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Only using auth and db, not storage
import { onAuthStateChanged } from 'firebase/auth';

const { useToken } = theme;
const { Text, Title } = Typography;

export default function App() {
  const { token } = useToken();
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [mainFileList, setMainFileList] = useState<any[]>([]);
  const [modalFileList, setModalFileList] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // New loading state for auth
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mainForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [actionVisible, setActionVisible] = useState<string | null>(null); // Track which card's actions are visible
  const [user, setUser] = useState<any>(null); // Track user authentication state

  // Load images from Firebase on component mount
  useEffect(() => {
    console.log('Setting up auth state listener');
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false); // Set auth loading to false once auth state is determined
      console.log('Auth state changed:', user ? 'User is logged in' : 'User is logged out', user);
    });

    // Load images after auth state is determined
    loadImagesFromFirebase();

    // Cleanup subscription
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const loadImagesFromFirebase = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'images'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setImages(imagesData);
    } catch (error: any) {
      console.error('Error loading images:', error);
      // Check if it's a permissions error
      if (error.code === 'permission-denied') {
        // Use a simple alert instead of message.error due to context issue
        alert('Permission denied: Please check Firebase Security Rules. Make sure you are logged in and Firestore rules allow authenticated access.');
      } else {
        alert('Failed to load images: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewTitle(file.name || previewTitle);
  };

  const getBase64 = (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (values: any, source: 'main' | 'modal') => {
    console.log('Upload function called with values:', values);
    console.log('Source:', source);
    console.log('Current user state:', user);
    
    // Use the appropriate fileList based on source
    const currentFileList = source === 'main' ? mainFileList : modalFileList;
    console.log('Current file list:', currentFileList);
    
    if (!currentFileList || currentFileList.length === 0) {
      console.log('No file selected');
      alert('Please select an image to upload');
      return;
    }

    // Check if user is authenticated using the tracked user state
    if (!user) {
      console.log('User not authenticated');
      alert('Please log in to upload images');
      return;
    }

    console.log('User authenticated:', user.uid);

    try {
      // Convert the image file to Base64
      const file = currentFileList[0].originFileObj as RcFile; // Cast to RcFile to match getBase64 function
      
      const base64Image = await getBase64(file);
      
      // Save image data to Firestore (including the Base64 string)
      const newImageData = {
        title: values.title,
        description: values.description,
        imageUrl: base64Image, // Store Base64 string directly
        createdAt: new Date(),
        userId: user.uid, // Store the user ID who uploaded
      };
      
      console.log('Saving to Firestore...');
      const docRef = await addDoc(collection(db, 'images'), newImageData);
      console.log('Document saved with ID:', docRef.id);
      
      // Add to local state
      setImages(prev => [{
        id: docRef.id,
        ...newImageData,
        createdAt: new Date() // Convert to Date object for display
      }, ...prev]); // Add new image at the beginning
      
      alert('Image uploaded successfully!');
      
      // Close the modal and reset the appropriate form
      if (source === 'modal') {
        setIsModalVisible(false);
        modalForm.resetFields();
        setModalFileList([]);
      } else {
        mainForm.resetFields();
        setMainFileList([]);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      // Check for specific permission errors
      if (error.code === 'permission-denied') {
        alert('Permission denied: Please check Firebase Security Rules. Make sure you are logged in and Firestore rules allow authenticated uploads.');
      } else {
        alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleMainPageUpload = async (values: any) => {
    console.log('Main page upload triggered with values:', values);
    handleUpload(values, 'main');
  };

  const handleModalUpload = async (values: any) => {
    console.log('Modal upload triggered with values:', values);
    handleUpload(values, 'modal');
  };

  const handleEdit = (id: string) => {
    console.log('Edit image with id:', id);
    alert('Edit functionality would be implemented here');
    setActionVisible(null); // Hide actions after clicking
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'images', id));
      
      // Remove from local state
      setImages(prev => prev.filter(image => image.id !== id));
      
      alert('Image deleted successfully!');
      setActionVisible(null); // Hide actions after clicking
    } catch (error: any) {
      console.error('Delete error:', error);
      if (error.code === 'permission-denied') {
        alert('Permission denied: Cannot delete image');
      } else {
        alert('Failed to delete image');
      }
    }
  };

  const showUploadModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    modalForm.resetFields();
    setModalFileList([]);
  };

  const toggleActions = (id: string) => {
    setActionVisible(actionVisible === id ? null : id);
  };

  const styles = {
    card: {
      maxWidth: "600px",
      margin: "0 auto",
    },
    previewImage: {
      width: "100%",
      maxHeight: "400px",
      objectFit: "contain" as const,
    },
    uploadArea: {
      border: `1px dashed ${token.colorBorder}`,
      borderRadius: token.borderRadius,
      padding: token.paddingLG,
      textAlign: "center" as const,
    },
    header: {
      marginBottom: token.marginLG,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actionButton: {
      margin: `0 ${token.marginXS}px`,
      cursor: 'pointer',
    },
    actionDropdown: {
      position: 'absolute' as const,
      top: '10px',
      right: '10px',
      zIndex: 10,
      background: 'rgba(0,0,0,0.7)',
      borderRadius: '4px',
      padding: '4px',
    },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Text>Loading images...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: token.paddingLG }}>
      <div style={styles.header}>
        <h2>Upload Images</h2>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/home')}
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Debug info - remove in production */}
      <div style={{ marginBottom: token.marginLG, padding: token.paddingSM, backgroundColor: token.colorBgLayout }}>
        <Text>Auth Status: {authLoading ? 'Checking...' : (user ? 'Logged In' : 'Not Logged In')}</Text>
        <br />
        <Text>User ID: {user?.uid || 'N/A'}</Text>
      </div>

      {/* Upload form */}
      <Card style={{ marginBottom: token.marginLG }}>
        <Title level={4}>Add New Image</Title>
        <Form
          form={mainForm}
          name="main-upload-form"
          layout="vertical"
          onFinish={handleMainPageUpload}
          autoComplete="off"
        >
          <Form.Item
            label="Image Title"
            name="title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter image title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter image description" 
            />
          </Form.Item>

          <Form.Item
            label="Image"
            name="image"
            rules={[{ required: true, message: 'Please upload an image!' }]}
          >
            <Upload
              listType="picture-card"
              fileList={mainFileList}
              onPreview={handlePreview}
              onChange={({ fileList: newFileList }) => setMainFileList(newFileList)}
              beforeUpload={() => false} // Prevent automatic upload
            >
              {mainFileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: token.marginXS }}>Click to upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={!user || authLoading}>
              {authLoading ? 'Checking authentication...' : (user ? 'Upload Image' : 'Please Login to Upload')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Display all images */}
      <div>
        <Title level={3}>All Images</Title>
        <Row gutter={[16, 16]} justify="center">
          {images.map((image) => (
            <Col key={image.id} xs={24} sm={12} md={8} lg={6}>
              <Card 
                style={{ width: "300px", marginBottom: token.marginLG, position: 'relative' }}
                cover={
                  <Image
                    alt={image.title}
                    src={image.imageUrl}
                    height={200}
                    style={{ objectFit: 'cover' }}
                  />
                }
              >
                <div style={{ position: 'relative' }}>
                  <Button 
                    type="text" 
                    icon={<MoreOutlined />} 
                    size="small"
                    style={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => toggleActions(image.id)}
                  />
                  
                  {actionVisible === image.id && (
                    <div style={styles.actionDropdown}>
                      <Space direction="vertical" size="small">
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<EyeOutlined />} 
                          onClick={() => {
                            console.log('Preview image:', image.id);
                            setActionVisible(null);
                          }}
                        >
                          View
                        </Button>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<EditOutlined />} 
                          onClick={() => handleEdit(image.id)}
                        >
                          Edit
                        </Button>
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<DeleteOutlined />} 
                          onClick={() => handleDelete(image.id)}
                          danger
                        >
                          Delete
                        </Button>
                      </Space>
                    </div>
                  )}
                </div>
                
                <Flex vertical gap={token.marginXXS}>
                  <Text strong>{image.title}</Text>
                  <Text style={{ color: token.colorTextSecondary }} ellipsis={{ tooltip: true }}>
                    {image.description}
                  </Text>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Upload Modal */}
      <Modal
        title="Upload New Image"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={modalForm}
          name="modal-upload-form"
          layout="vertical"
          onFinish={handleModalUpload}
          autoComplete="off"
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter image title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter image description" 
            />
          </Form.Item>

          <Form.Item
            label="Image"
            name="image"
            rules={[{ required: true, message: 'Please upload an image!' }]}
          >
            <Upload
              listType="picture-card"
              fileList={modalFileList}
              onPreview={handlePreview}
              onChange={({ fileList: newFileList }) => setModalFileList(newFileList)}
              beforeUpload={() => false} // Prevent automatic upload
            >
              {modalFileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: token.marginXS }}>Click to upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Flex gap={token.marginXS}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" block disabled={!user || authLoading}>
                {authLoading ? 'Checking authentication...' : (user ? 'Upload Image' : 'Please Login to Upload')}
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}