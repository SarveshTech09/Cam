'use client';

import React from "react";
import { Button, Form, Grid, Input, theme, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

interface FormValues {
  password: string;
  confirmPassword: string;
}

export default function App() {
  const { token } = useToken();
  const screens = useBreakpoint();

  const onFinish = (values: FormValues) => {
    console.log("Received values of form: ", values);
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

          <Title style={styles.title}>Set new password</Title>
          <Text style={styles.text}>
            Please enter your new password below.
          </Text>
        </div>
        <Form
          name="set_new_password"
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your new password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="New Password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: "Please confirm your new password!",
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
              placeholder="Confirm New Password"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: "0px" }}>
            <Button block type="primary" htmlType="submit">
              Reset password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}