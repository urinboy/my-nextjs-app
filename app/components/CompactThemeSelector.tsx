"use client";
import { useTheme } from '../contexts/ThemeContext';

export default function CompactThemeSelector() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const handleThemeToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return 'fas fa-sun';
      case 'dark': return 'fas fa-moon';
      case 'system': return 'fas fa-desktop';
      default: return 'fas fa-sun';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Yorug\'';
      case 'dark': return 'Qorong\'u';
      case 'system': return 'Tizim';
      default: return 'Yorug\'';
    }
  };

  return (
    <button
      onClick={handleThemeToggle}
      style={{
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        border: 'none',
        background: effectiveTheme === 'dark' 
          ? 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
      }}
      title={`${getThemeLabel()} rejimi (bosganda o'zgaradi)`}
    >
      <i 
        className={getThemeIcon()} 
        style={{
          transition: 'transform 0.3s ease',
          animation: 'themeIconSpin 0.5s ease-out'
        }}
      ></i>
    </button>
  );
}
