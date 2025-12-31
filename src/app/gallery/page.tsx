'use client';

import React, { useState, useEffect } from "react";
import { Card, Flex, theme, Typography, Row, Col, Image, Button } from "antd";
import { EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from 'next/navigation';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const { useToken } = theme;
const { Text, Link } = Typography;

export default function App() {
  const { token } = useToken();
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Load images from Firebase on component mount
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log('Gallery - Auth state changed:', user ? 'User is logged in' : 'User is logged out');
    });

    // Load images after auth state is determined
    loadImagesFromFirebase();

    // Cleanup subscription
    return () => unsubscribe();
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
    } catch (error) {
      console.error('Error loading images:', error);
      alert('Failed to load images: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    card: {
      width: "300px",
      marginBottom: token.marginLG,
    },
    paragraph: {
      color: token.colorTextSecondary,
    },
    actionButton: {
      margin: `0 ${token.marginXS}px`,
      cursor: 'pointer',
    },
    header: {
      marginBottom: token.marginLG,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
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
        <h2>Gallery</h2>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/home')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <Row gutter={[16, 16]} justify="center">
        {images.map((image) => (
          <Col key={image.id} xs={24} sm={12} md={8} lg={6}>
            <Card 
              style={styles.card}
              cover={
                <Image
                  alt={image.title}
                  src={image.imageUrl}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              }
              actions={[
                <EyeOutlined key="preview" onClick={() => console.log('Preview image:', image.id)} style={styles.actionButton} />,
              ]}
            >
              <Flex vertical gap={token.marginXXS}>
                <Text strong>{image.title}</Text>
                <Text style={styles.paragraph} ellipsis={{ tooltip: true }}>
                  {image.description}
                </Text>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}