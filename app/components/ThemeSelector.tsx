"use client";
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function ThemeSelector() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const themes = [
    { value: 'light', label: 'Yorug\'', icon: 'fas fa-sun' },
    { value: 'dark', label: 'Qorong\'u', icon: 'fas fa-moon' },
    { value: 'system', label: 'Tizim', icon: 'fas fa-desktop' }
  ] as const;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      background: effectiveTheme === 'dark' ? '#2c2c2c' : 'white',
      borderRadius: '12px',
      padding: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: `1px solid ${effectiveTheme === 'dark' ? '#444' : '#e9ecef'}`
    }}>
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}>
        {themes.map((themeOption) => (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              background: theme === themeOption.value 
                ? (effectiveTheme === 'dark' ? '#4a90e2' : '#007bff')
                : 'transparent',
              color: theme === themeOption.value 
                ? 'white' 
                : (effectiveTheme === 'dark' ? '#ffffff' : '#666'),
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              minWidth: '70px',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              if (theme !== themeOption.value) {
                e.currentTarget.style.background = effectiveTheme === 'dark' ? '#3a3a3a' : '#f8f9fa';
              }
            }}
            onMouseOut={(e) => {
              if (theme !== themeOption.value) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <i className={themeOption.icon}></i>
            <span style={{ display: isMobile ? 'none' : 'inline' }}>
              {themeOption.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
