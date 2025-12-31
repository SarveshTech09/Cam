'use client';

import React, { useState } from "react";
import { Button, Form, Grid, Input, theme, Typography, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title, Link } = Typography;

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function App() {
  const { token } = useToken();
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const { user, error } = await signUp(values.name, values.email, values.password);

      if (error) {
        message.error(error);
      } else if (user) {
        message.success('Account created successfully!');
        console.log("User created:", user);
        // Redirect to home page after successful signup
        router.push('/home');
      }
    } catch (error) {
      console.error("Sign up error:", error);
      message.error('An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    formWrapper: {
      margin: "0 auto",
      maxWidth: "320px",
      padding: `${token.sizeXXL}px ${token.padding}px`,
      width: "100%"
    },
    header: {
      marginBottom: token.marginXL,
      textAlign: "center" as const
    },
    section: {
      alignItems: "center",
      backgroundColor: token.colorBgContainer,
      display: "flex" as const
    },
    text: {
      color: token.colorTextSecondary
    },
    title: {
      fontSize: screens.md ? token.fontSizeHeading2 : token.fontSizeHeading3
    }
  };

  return (
    <section style={styles.section}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="0.464294" width="24" height="24" rx="4.8" fill="#1890FF" />
            <path
              d="M14.8643 3.6001H20.8643V9.6001H14.8643V3.6001Z"
              fill="white"
            />
            <path
              d="M10.0643 9.6001H14.8643V14.4001H10.0643V9.6001Z"
              fill="white"
            />
            <path
              d="M4.06427 13.2001H11.2643V20.4001H4.06427V13.2001Z"
              fill="white"
            />
          </svg>

          <Title style={styles.title}>Create Account</Title>
          <Text style={styles.text}>
            Please enter your details to create an account.
          </Text>
        </div>
        <Form
          name="signup_form"
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
            />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                type: "email",
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please confirm your password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Confirm Password"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: "0px" }}>
            <Button block type="primary" htmlType="submit" loading={loading}>
              Sign up
            </Button>
            <div style={{ marginTop: token.marginLG, textAlign: "center" as const }}>
              <Text style={styles.text}>Already have an account?</Text>{" "}
              <Link href="/" underline>Sign in</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}