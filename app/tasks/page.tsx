"use client";
import { useEffect, useState } from "react";
import "../tasks-responsive.css";
import { useTheme } from '../contexts/ThemeContext';
import CompactThemeSelector from '../components/CompactThemeSelector';
import DownloadButton from '../components/DownloadButton';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
}

export default function TasksPage() {
  const { effectiveTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Toast ko'rsatish funksiyasi
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Barcha tasklarni olish
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }

  // Yangi task qo'shish
  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority }),
    });
    if (res.ok) {
      setTitle("");
      setPriority('medium');
      fetchTasks();
      showToast("Vazifa muvaffaqiyatli qo'shildi!", 'success');
    } else {
      showToast("Xatolik yuz berdi!", 'error');
    }
  }

  // Task holatini o'zgartirish
  async function toggleTask(id: number, completed: boolean) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    if (res.ok) {
      fetchTasks();
      showToast("Vazifa holati o'zgartirildi!", 'success');
    }
  }

  // Task o'chirish
  async function deleteTask(id: number) {
    const task = tasks.find(t => t.id === id);
    if (confirm(`"${task?.title}" vazifasini rostdan ham o'chirmoqchimisiz?`)) {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTasks();
        showToast("Vazifa muvaffaqiyatli o'chirildi!", 'success');
      } else {
        showToast("Vazifani o'chirishda xatolik!", 'error');
      }
    }
  }

  // Edit rejimini yoqish
  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority || 'medium');
  }

  // Edit rejimini bekor qilish
  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditPriority('medium');
  }

  // Task tahrirlash
  async function updateTask(id: number) {
    if (!editTitle.trim()) return;
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title: editTitle.trim(),
        priority: editPriority 
      }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditTitle("");
      setEditPriority('medium');
      fetchTasks();
      showToast("Vazifa muvaffaqiyatli o'zgartirildi!", 'success');
    } else {
      showToast("Vazifani o'zgartirishda xatolik!", 'error');
    }
  }

  // Priority ikonini olish
  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  };

  // Priority nomini olish
  const getPriorityName = (priority?: string) => {
    switch (priority) {
      case 'high': return 'Yuqori';
      case 'medium': return "O'rta";
      case 'low': return 'Past';
      default: return "O'rta";
    }
  };

    // Filtrlangan tasklarni olish

  // Theme colors
  const getThemeColors = () => {
    if (effectiveTheme === 'dark') {
      return {
        background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
        containerBg: "#2c2c2c",
        cardBg: "#3a3a3a",
        textPrimary: "#ffffff",
        textSecondary: "#b0b0b0",
        border: "#444444",
        inputBg: "#404040",
        buttonPrimary: "#4a90e2",
        buttonSecondary: "#5a5a5a"
      };
    }
    return {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      containerBg: "white",
      cardBg: "white",
      textPrimary: "#333333",
      textSecondary: "#666666",
      border: "#e9ecef",
      inputBg: "white",
      buttonPrimary: "#007bff",
      buttonSecondary: "#6c757d"
    };
  };

  const colors = getThemeColors();

  // Filtrlangan tasklarni olish
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = (() => {
      switch (filter) {
        case 'active': return !task.completed;
        case 'completed': return task.completed;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Priority bo'yicha saralash
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];
    return bPriority - aPriority;
  });

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: colors.background,
      padding: "10px"
    }}>
      {/* Header */}
      <div className="task-header" style={{
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
        marginBottom: "40px",
        position: "relative"
      }}>

        
        <h1 style={{
          color: "white",
          fontSize: "3rem",
          fontWeight: "bold",
          marginBottom: "10px",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          <i className="fas fa-tasks" style={{ marginRight: "15px" }}></i>
          Vazifa Boshqaruvchisi
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: "1.1rem"
        }}>
          Vazifalaringizni oson va qulay boshqaring
        </p>
      </div>

      {/* Main Container */}
      <div className="task-container" style={{
        maxWidth: "600px",
        margin: "0 auto",
        background: colors.containerBg,
        borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        overflow: "visible",
        position: "relative"
      }}>
        {/* Add Task Form */}
        <div style={{
          padding: "30px",
          background: "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
        }}>
          <form onSubmit={addTask} className="task-form" style={{ 
            display: "flex", 
            gap: "12px",
            alignItems: "stretch",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", gap: "8px", flex: 1, minWidth: "280px" }}>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="✨ Vazifa qo'shing..."
                style={{
                  flex: 1,
                  padding: "15px 20px",
                  paddingLeft: "45px",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" fill=\"%23999\"><path d=\"M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z\"/></svg>')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "15px center",
                  backgroundSize: "16px 16px"
                }}
              />
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                style={{
                  padding: "15px 12px",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  outline: "none",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  cursor: "pointer"
                }}
              >
                <option value="low">🟢 Past</option>
                <option value="medium">🟡 O'rta</option>
                <option value="high">🔴 Yuqori</option>
              </select>
            </div>
            <button 
              type="submit"
              disabled={!title.trim()}
              style={{
                padding: "15px 25px",
                background: title.trim() ? "#4CAF50" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: title.trim() ? "pointer" : "not-allowed",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <i className="fas fa-plus"></i> Qo'shish
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="task-list" style={{ padding: "30px" }}>
          {/* Search Input */}
          {tasks.length > 0 && (
            <div className="task-search" style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  paddingLeft: "45px",
                  border: `2px solid ${colors.border}`,
                  borderRadius: "12px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" fill=\"%23999\"><path d=\"M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z\"/></svg>')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "15px center",
                  backgroundSize: "16px 16px"
                }}
                onFocus={e => e.target.style.borderColor = "#007bff"}
                onBlur={e => e.target.style.borderColor = "#e9ecef"}
              />
            </div>
          )}

          {/* Filter Buttons */}
          {tasks.length > 0 && (
            <div className="task-filters" style={{
              display: "flex",
              gap: "8px",
              marginBottom: "20px",
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
              {[
                { key: 'all', label: 'Barchasi', icon: 'fas fa-list', count: tasks.length },
                { key: 'active', label: 'Faol', icon: 'fas fa-clock', count: tasks.filter(t => !t.completed).length },
                { key: 'completed', label: 'Tugagan', icon: 'fas fa-check-circle', count: tasks.filter(t => t.completed).length }
              ].map(({ key, label, icon, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  style={{
                    padding: "8px 16px",
                    background: filter === key ? "#007bff" : "#f8f9fa",
                    color: filter === key ? "white" : "#666",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: filter === key ? "0 2px 4px rgba(0,123,255,0.3)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <i className={icon}></i> {label} ({count})
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px",
              color: "#666"
            }}>
              <div className="loading-spinner" style={{
                fontSize: "2rem",
                marginBottom: "10px"
              }}>⏳</div>
              <p>Yuklanmoqda...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px",
              color: "#999"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "15px"
              }}>
                {filter === 'completed' ? '�' : filter === 'active' ? '💪' : '�🎯'}
              </div>
              <h3 style={{ margin: "0 0 10px 0" }}>
                {filter === 'completed' 
                  ? 'Tugagan vazifalar yo\'q' 
                  : filter === 'active' 
                    ? 'Faol vazifalar yo\'q' 
                    : 'Vazifalar yo\'q'
                }
              </h3>
              <p>
                {filter === 'completed' 
                  ? 'Hali hech qanday vazifa tugallanmagan' 
                  : filter === 'active' 
                    ? 'Barcha vazifalar tugallangan! 🎉' 
                    : 'Birinchi vazifangizni qo\'shing va maqsadlaringizga erishaing!'
                }
              </p>
            </div>
          ) : (
            <div className="task-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredTasks.map((task, index) => (
                <div key={task.id} className="task-item" style={{
                  background: task.completed ? (effectiveTheme === 'dark' ? "#2a2a2a" : "#f8f9fa") : colors.cardBg,
                  border: `2px solid ${task.completed ? colors.border : "#e3f2fd"}`,
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  position: "relative"
                }}>
                  {/* Task number badge */}
                  <div style={{
                    position: "absolute",
                    top: "-8px",
                    left: "20px",
                    background: task.completed ? "#28a745" : "#007bff",
                    color: "white",
                    borderRadius: "12px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    #{index + 1}
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginTop: "10px"
                  }}>
                    {/* Checkbox */}
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer"
                    }}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer"
                        }}
                      />
                    </label>

                    {/* Task content */}
                    <div style={{ flex: 1 }}>
                      {editingId === task.id ? (
                        <div style={{ display: "flex", gap: "10px", alignItems: "stretch", flexDirection: "column" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                            <input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                border: `2px solid ${colors.buttonPrimary}`,
                                borderRadius: "8px",
                                fontSize: "16px",
                                outline: "none",
                                backgroundColor: colors.inputBg,
                                color: colors.textPrimary
                              }}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateTask(task.id);
                                } else if (e.key === 'Escape') {
                                  cancelEdit();
                                }
                              }}
                            />
                            <select
                              value={editPriority}
                              onChange={e => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                              style={{
                                padding: "8px 12px",
                                border: `2px solid ${colors.buttonPrimary}`,
                                borderRadius: "8px",
                                fontSize: "14px",
                                outline: "none",
                                backgroundColor: colors.inputBg,
                                color: colors.textPrimary,
                                cursor: "pointer"
                              }}
                            >
                              <option value="low">🟢 Past</option>
                              <option value="medium">🟡 O'rta</option>
                              <option value="high">🔴 Yuqori</option>
                            </select>
                          </div>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => updateTask(task.id)}
                              style={{
                                padding: "8px 16px",
                                background: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <i className="fas fa-save"></i> Saqlash
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                padding: "8px 16px",
                                background: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <i className="fas fa-times"></i> Bekor qilish
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="task-content">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                            <h4 style={{
                              margin: 0,
                              textDecoration: task.completed ? "line-through" : "none",
                              color: task.completed ? colors.textSecondary : colors.textPrimary,
                              fontSize: "18px",
                              fontWeight: "500",
                              flex: 1
                            }}>
                              {task.title}
                            </h4>
                            <span style={{
                              fontSize: "12px",
                              background: "#f8f9fa",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              color: "#666",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              {getPriorityIcon(task.priority)} {getPriorityName(task.priority)}
                            </span>
                          </div>
                          <p style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#999"
                          }}>
                            Qo'shilgan: {new Date(task.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {editingId !== task.id && (
                      <div className="task-actions" style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => startEdit(task)}
                          style={{
                            padding: "8px 12px",
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                          onMouseOver={e => e.currentTarget.style.background = "#0056b3"}
                          onMouseOut={e => e.currentTarget.style.background = "#007bff"}
                        >
                          <i className="fas fa-edit"></i> Tahrirlash
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{
                            padding: "8px 12px",
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                          onMouseOver={e => e.currentTarget.style.background = "#c82333"}
                          onMouseOut={e => e.currentTarget.style.background = "#dc3545"}
                        >
                          <i className="fas fa-trash"></i> O'chirish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer stats */}
        {tasks.length > 0 && (
          <div className="footer-container" style={{
            padding: "20px 30px",
            background: effectiveTheme === 'dark' ? "#2a2a2a" : "#f8f9fa",
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
            color: colors.textSecondary,
            position: "relative",
            overflow: "visible",
            zIndex: 1
          }}>
            <div className="footer-stats" style={{ display: "flex", gap: "20px" }}>
              <span><i className="fas fa-chart-bar"></i> Jami vazifalar: {tasks.length}</span>
              <span><i className="fas fa-check-circle" style={{color: "#28a745"}}></i> Bajarilgan: {tasks.filter(t => t.completed).length}</span>
              <span><i className="fas fa-clock" style={{color: "#ffc107"}}></i> Qolgan: {tasks.filter(t => !t.completed).length}</span>
            </div>
            {/* Control buttons positioned at end */}
            <div className="footer-controls" style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              position: "relative", 
              zIndex: 10 
            }}>
              <CompactThemeSelector />
              <DownloadButton 
                tasks={tasks} 
                filteredTasks={filteredTasks} 
                effectiveTheme={effectiveTheme} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Back to home link */}
      <div style={{
        textAlign: "center",
        marginTop: "30px"
      }}>
        <a 
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "16px",
            padding: "10px 20px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "25px",
            transition: "all 0.3s ease"
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
        >
          <i className="fas fa-home"></i> Bosh sahifaga qaytish
        </a>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification" style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: toast.type === 'success' ? "#28a745" : "#dc3545",
          color: "white",
          padding: "15px 20px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 1000,
          animation: "slideIn 0.3s ease-out",
          maxWidth: "300px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <i className={toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'}></i>
          {toast.message}
        </div>
      )}
    </div>
  );
}
