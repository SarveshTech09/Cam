'use client';

import React, { useState } from "react";
import { Button, Checkbox, Form, Grid, Input, theme, Typography, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from '@/lib/authContext';

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title, Link } = Typography;

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function App() {
  const { token } = useToken();
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const { user, error } = await signIn(values.email, values.password);

      if (error) {
        message.error(error);
      } else if (user) {
        message.success('Login successful!');
        console.log("User logged in:", user);
        // In a real app, you would redirect to dashboard or store user session
      }
    } catch (error) {
      console.error("Sign in error:", error);
      message.error('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    footer: {
      marginTop: token.marginLG,
      textAlign: "center" as const,
      width: "100%"
    },
    forgotPassword: {
      float: "right" as const
    },
    header: {
      marginBottom: token.marginXL,
      textAlign: "center" as const
    },
    panel: {
      backgroundColor: token.colorBgContainer,
      borderRadius: screens.md ? token.borderRadiusLG : "0",
      boxShadow: screens.md ? token.boxShadowTertiary : "none",
      margin: "0 auto",
      padding: screens.md ? `${token.paddingXL}px` : `${token.sizeXXL}px ${token.padding}px`,
      width: "360px"
    },
    section: {
      alignItems: "center",
      backgroundColor: screens.md ? token.colorBgLayout : token.colorBgContainer,
      display: "flex",
      height: screens.md ? "100vh" : "auto",
      padding: screens.md ? `${token.sizeXXL}px 0px` : "0px"
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
      <div style={styles.panel}>
        <div style={styles.header}>
          <svg
            width="33"
            height="32"
            viewBox="0 0 33 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="0.125" width="32" height="32" rx="6.4" fill="#1890FF" />
            <path
              d="M19.3251 4.80005H27.3251V12.8H19.3251V4.80005Z"
              fill="white"
            />
            <path d="M12.925 12.8H19.3251V19.2H12.925V12.8Z" fill="white" />
            <path d="M4.92505 17.6H14.525V27.2001H4.92505V17.6Z" fill="white" />
          </svg>

          <Title style={styles.title}>Sign in</Title>
          <Text style={styles.text}>
            Welcome back to AntBlocks UI! Please enter your details below to
            sign in.
          </Text>
        </div>
        <Form
          name="normal_login"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                type: "email",
                required: true,
                message: "Please input your Email!",
              },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a style={styles.forgotPassword} href="/forgot-password">
              Forgot password?
            </a>
          </Form.Item>
          <Form.Item style={{ marginBottom: "0px" }}>
            <Button block={true} type="primary" htmlType="submit" loading={loading}>
              Log in
            </Button>
            <div style={styles.footer}>
              <Text style={styles.text}>Don't have an account?</Text>{" "}
              <Link href="/signup" underline>Sign up now</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}