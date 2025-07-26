"use client";
import { useEffect, useState } from "react";
import "../tasks-responsive.css";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
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
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      setTitle("");
      fetchTasks();
      showToast("✅ Vazifa muvaffaqiyatli qo'shildi!", 'success');
    } else {
      showToast("❌ Xatolik yuz berdi!", 'error');
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
      showToast("🔄 Vazifa holati o'zgartirildi!", 'success');
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
        showToast("🗑️ Vazifa muvaffaqiyatli o'chirildi!", 'success');
      } else {
        showToast("❌ Vazifani o'chirishda xatolik!", 'error');
      }
    }
  }

  // Edit rejimini yoqish
  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
  }

  // Edit rejimini bekor qilish
  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
  }

  // Task tahrirlash
  async function updateTask(id: number) {
    if (!editTitle.trim()) return;
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditTitle("");
      fetchTasks();
      showToast("✏️ Vazifa muvaffaqiyatli o'zgartirildi!", 'success');
    } else {
      showToast("❌ Vazifani o'zgartirishda xatolik!", 'error');
    }
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      {/* Header */}
      <div className="task-header" style={{
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
        marginBottom: "40px"
      }}>
        <h1 style={{
          color: "white",
          fontSize: "3rem",
          fontWeight: "bold",
          marginBottom: "10px",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          📊 Vazifa Boshqaruvchisi
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
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}>
        {/* Add Task Form */}
        <div style={{
          padding: "30px",
          background: "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
        }}>
          <form onSubmit={addTask} className="task-form" style={{ 
            display: "flex", 
            gap: "12px",
            alignItems: "stretch"
          }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Yangi vazifa qo'shing..."
              style={{
                flex: 1,
                padding: "15px 20px",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                outline: "none",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}
            />
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
                transition: "all 0.3s ease"
              }}
            >
              🚀 Qo'shish
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div style={{ padding: "30px" }}>
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
          ) : tasks.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px",
              color: "#999"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "15px"
              }}>📝</div>
              <h3 style={{ margin: "0 0 10px 0" }}>Vazifalar yo'q</h3>
              <p>Birinchi vazifangizni qo'shing!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tasks.map((task, index) => (
                <div key={task.id} className="task-item" style={{
                  background: task.completed ? "#f8f9fa" : "white",
                  border: `2px solid ${task.completed ? "#e9ecef" : "#e3f2fd"}`,
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
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              border: "2px solid #007bff",
                              borderRadius: "8px",
                              fontSize: "16px",
                              outline: "none"
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
                          <button
                            onClick={() => updateTask(task.id)}
                            style={{
                              padding: "8px 12px",
                              background: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            ✅ Saqlash
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              padding: "8px 12px",
                              background: "#6c757d",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            ❌ Bekor qilish
                          </button>
                        </div>
                      ) : (
                        <div className="task-content">
                          <h4 style={{
                            margin: "0 0 5px 0",
                            textDecoration: task.completed ? "line-through" : "none",
                            color: task.completed ? "#6c757d" : "#333",
                            fontSize: "18px",
                            fontWeight: "500"
                          }}>
                            {task.title}
                          </h4>
                          <p style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#999"
                          }}>
                            Qo'shilgan: {new Date(task.createdAt).toLocaleDateString('uz-UZ')}
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
                            transition: "all 0.2s ease"
                          }}
                          onMouseOver={e => e.currentTarget.style.background = "#0056b3"}
                          onMouseOut={e => e.currentTarget.style.background = "#007bff"}
                        >
                          ✏️ Tahrirlash
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
                            transition: "all 0.2s ease"
                          }}
                          onMouseOver={e => e.currentTarget.style.background = "#c82333"}
                          onMouseOut={e => e.currentTarget.style.background = "#dc3545"}
                        >
                          🗑️ O'chirish
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
          <div style={{
            padding: "20px 30px",
            background: "#f8f9fa",
            borderTop: "1px solid #e9ecef",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
            color: "#6c757d"
          }}>
            <span>📊 Jami vazifalar: {tasks.length}</span>
            <span>✅ Bajarilgan: {tasks.filter(t => t.completed).length}</span>
            <span>⏳ Qolgan: {tasks.filter(t => !t.completed).length}</span>
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
          🏠 Bosh sahifaga qaytish
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
          maxWidth: "300px"
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
