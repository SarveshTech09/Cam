'use client';

import { ConfigProvider, theme } from 'antd';
import type { ThemeConfig } from 'antd';
import { useTheme } from 'next-themes';
import { AuthProvider } from '@/lib/authContext';

interface ProvidersProps {
  children: React.ReactNode;
}

const defaultTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Button: {
      controlHeight: 36,
    },
  },
};

export default function Providers({ children }: ProvidersProps) {
  const { theme: mode } = useTheme();
  
  const antdTheme = mode === 'dark' ? 
    {
      ...defaultTheme,
      algorithm: theme.darkAlgorithm,
    } : 
    {
      ...defaultTheme,
      algorithm: theme.defaultAlgorithm,
    };

  return (
    <AuthProvider>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </AuthProvider>
  );
}