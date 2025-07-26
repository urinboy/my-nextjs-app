"use client";
import { useState } from 'react';
import { downloadAsJSON, downloadAsCSV, downloadAsSQL } from '../utils/downloadUtils';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
}

interface DownloadButtonProps {
  tasks: Task[];
  filteredTasks: Task[];
  effectiveTheme: 'light' | 'dark';
}

export default function DownloadButton({ tasks, filteredTasks, effectiveTheme }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Debug uchun log
  console.log('DownloadButton render:', { isOpen, tasks: tasks.length });

  const downloadOptions = [
    {
      format: 'json',
      label: 'JSON fayl',
      icon: 'fas fa-code',
      description: 'Dasturchilar uchun'
    },
    {
      format: 'csv',
      label: 'CSV fayl',
      icon: 'fas fa-table',
      description: 'Excel uchun'
    },
    {
      format: 'sql',
      label: 'SQL ma\'lumotlar',
      icon: 'fas fa-database',
      description: 'Ma\'lumotlar bazasi'
    }
  ];

  const handleDownload = async (format: string, downloadAll: boolean = true) => {
    setIsDownloading(true);
    const tasksToDownload = downloadAll ? tasks : filteredTasks;
    const timestamp = new Date().toISOString().split('T')[0];
    const prefix = downloadAll ? 'barcha-vazifalar' : 'filtrlangan-vazifalar';

    try {
      switch (format) {
        case 'json':
          downloadAsJSON(tasksToDownload, `${prefix}-${timestamp}.json`);
          break;
        case 'csv':
          downloadAsCSV(tasksToDownload, `${prefix}-${timestamp}.csv`);
          break;
        case 'sql':
          downloadAsSQL(tasksToDownload, `${prefix}-ma-lumotlar-${timestamp}.sql`);
          break;
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Download error:', error);
      alert('Yuklab olishda xatolik yuz berdi!');
    } finally {
      setIsDownloading(false);
    }
  };

  // Click outside to close
  const handleClickOutside = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.download-dropdown')) return;
    setIsOpen(false);
  };

  if (tasks.length === 0) return null;

  return (
    <>
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={handleClickOutside}
        />
      )}
      
      <div className="download-dropdown" style={{
        position: 'relative',
        display: 'inline-block'
      }}>
        {/* Main Download Button - Only Icon */}
        <button
          onClick={() => {
            console.log('Button clicked, current isOpen:', isOpen);
            setIsOpen(!isOpen);
          }}
          disabled={isDownloading}
          style={{
            width: '45px',
            height: '45px',
            background: effectiveTheme === 'dark' 
              ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
              : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '16px',
            cursor: isDownloading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease',
            opacity: isDownloading ? 0.7 : 1,
            position: 'relative',
            zIndex: 1001
          }}
          onMouseOver={(e) => {
            if (!isDownloading) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!isDownloading) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
            }
          }}
          title="Yuklab olish"
        >
          <i className={isDownloading ? 'fas fa-spinner fa-spin' : 'fas fa-download'}></i>
        </button>

        {/* Dropdown Menu - Modal Style */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 9998,
                animation: 'fadeIn 0.2s ease-out'
              }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal Dialog */}
            <div 
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: effectiveTheme === 'dark' ? '#2c2c2c' : 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: `2px solid ${effectiveTheme === 'dark' ? '#444' : '#e9ecef'}`,
                minWidth: '320px',
                maxWidth: '400px',
                zIndex: 9999,
                animation: 'modalSlideIn 0.3s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div style={{
              padding: '8px 12px',
              borderBottom: `1px solid ${effectiveTheme === 'dark' ? '#444' : '#e9ecef'}`,
              marginBottom: '8px'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 'bold',
                color: effectiveTheme === 'dark' ? '#ffffff' : '#333'
              }}>
                Format tanlang
              </h4>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: effectiveTheme === 'dark' ? '#b0b0b0' : '#666'
              }}>
                {tasks.length} ta vazifa mavjud ({filteredTasks.length} ta ko&apos;rsatilgan)
              </p>
            </div>

            {/* Download Options */}
            {downloadOptions.map((option) => (
              <div key={option.format} style={{ marginBottom: '8px' }}>
                <div style={{
                  background: effectiveTheme === 'dark' ? '#3a3a3a' : '#f8f9fa',
                  borderRadius: '8px',
                  padding: '8px',
                  border: `1px solid ${effectiveTheme === 'dark' ? '#444' : '#e9ecef'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <i className={option.icon} style={{
                      color: effectiveTheme === 'dark' ? '#4a90e2' : '#007bff',
                      width: '16px'
                    }}></i>
                    <span style={{
                      fontWeight: 'bold',
                      fontSize: '13px',
                      color: effectiveTheme === 'dark' ? '#ffffff' : '#333'
                    }}>
                      {option.label}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: effectiveTheme === 'dark' ? '#b0b0b0' : '#666',
                      marginLeft: 'auto'
                    }}>
                      {option.description}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleDownload(option.format, true)}
                      disabled={isDownloading}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        background: effectiveTheme === 'dark' ? '#4a90e2' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Barcha ({tasks.length})
                    </button>
                    
                    {filteredTasks.length < tasks.length && (
                      <button
                        onClick={() => handleDownload(option.format, false)}
                        disabled={isDownloading}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          background: 'transparent',
                          color: effectiveTheme === 'dark' ? '#4a90e2' : '#007bff',
                          border: `1px solid ${effectiveTheme === 'dark' ? '#4a90e2' : '#007bff'}`,
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Filtr ({filteredTasks.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}