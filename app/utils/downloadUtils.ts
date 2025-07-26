interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
}

// JSON formatda yuklab olish
export const downloadAsJSON = (tasks: Task[], filename?: string) => {
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `vazifalar-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// CSV formatda yuklab olish
export const downloadAsCSV = (tasks: Task[], filename?: string) => {
  const headers = ['ID', 'Vazifa', 'Holat', 'Daraja', 'Qo\'shilgan sana'];
  const csvContent = [
    headers.join(','),
    ...tasks.map(task => [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`, // CSV escape for quotes
      task.completed ? 'Tugallangan' : 'Faol',
      task.priority === 'high' ? 'Yuqori' : task.priority === 'medium' ? 'O\'rta' : 'Past',
      `"${new Date(task.createdAt).toLocaleDateString('en-GB')}"`
    ].join(','))
  ].join('\n');

  // Add BOM for UTF-8 support in Excel
  const BOM = '\uFEFF';
  const dataBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `vazifalar-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// SQL formatda yuklab olish
export const downloadAsSQL = (tasks: Task[], filename?: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // SQL dump header
  let sqlContent = `-- Vazifalar SQL Export
-- Yaratilgan sana: ${new Date().toLocaleString('uz-UZ')}
-- Jami vazifalar: ${tasks.length}

-- Jadval yaratish
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ma'lumotlarni tozalash (ixtiyoriy)
-- DELETE FROM tasks;

-- Ma'lumotlarni qo'shish
`;

  // INSERT statements yaratish
  tasks.forEach((task, index) => {
    const title = task.title.replace(/'/g, "''"); // SQL injection oldini olish
    const completed = task.completed ? 1 : 0;
    const priority = task.priority || 'medium';
    const createdAt = new Date(task.createdAt).toISOString().slice(0, 19).replace('T', ' ');
    
    sqlContent += `INSERT INTO tasks (id, title, completed, priority, created_at) VALUES (${task.id}, '${title}', ${completed}, '${priority}', '${createdAt}');\n`;
  });

  // Footer comments
  sqlContent += `\n-- Export tugallandi
-- Jami qo'shilgan yozuvlar: ${tasks.length}
-- Bajarilgan vazifalar: ${tasks.filter(t => t.completed).length}
-- Bajarilmagan vazifalar: ${tasks.filter(t => !t.completed).length}`;

  const dataBlob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `vazifalar-${new Date().toISOString().split('T')[0]}.sql`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
