import React from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * Global Toast configuration component
 */
const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#18181b', // zinc-900
          color: '#ffffff',
          border: '1px solid #27272a', // zinc-800
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#ea580c', // orange-600
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444', // red-500
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};

export default ToastProvider;
