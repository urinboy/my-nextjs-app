"use client";
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function ThemeSelector() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Yorug\'', icon: 'fas fa-sun' },
    { value: 'dark', label: 'Qorong\'u', icon: 'fas fa-moon' },
    { value: 'system', label: 'Tizim', icon: 'fas fa-desktop' }
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.theme-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="theme-selector" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          background: effectiveTheme === 'dark' 
            ? 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'scale(1.1)' : 'scale(1)'
        }}
        onMouseOver={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseOut={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        <i className={currentTheme.icon}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="theme-dropdown" style={{
          position: 'absolute',
          top: '60px',
          right: '0',
          background: effectiveTheme === 'dark' ? '#2c2c2c' : 'white',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          border: `1px solid ${effectiveTheme === 'dark' ? '#444' : '#e9ecef'}`,
          minWidth: '160px'
        }}>
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => {
                setTheme(themeOption.value);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                background: theme === themeOption.value 
                  ? (effectiveTheme === 'dark' ? '#4a90e2' : '#007bff')
                  : 'transparent',
                color: theme === themeOption.value 
                  ? 'white' 
                  : (effectiveTheme === 'dark' ? '#ffffff' : '#333'),
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                marginBottom: '4px',
                textAlign: 'left'
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
              <i className={themeOption.icon} style={{ 
                width: '16px', 
                textAlign: 'center'
              }}></i>
              <span>{themeOption.label}</span>
              {theme === themeOption.value && (
                <i className="fas fa-check" style={{ 
                  marginLeft: 'auto',
                  fontSize: '12px'
                }}></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
