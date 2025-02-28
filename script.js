const API_URL = "http://localhost:5000/tasks";
let editTaskModal = new bootstrap.Modal(document.getElementById("editTaskModal"));

// Fetch & Display Tasks
const fetchTasks = async () => {
  const res = await fetch(API_URL);
  const tasks = await res.json();
  const taskList = document.getElementById("taskList");

  taskList.innerHTML = "";
  tasks.forEach(task => {
      taskList.innerHTML += `
          <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                  <strong>${task.Title}</strong> - ${task.Description} <br>
                  <small class="text-muted">Created: ${task.created_at}</small>
              </div>
              <div>
                  <button class="btn btn-sm btn-warning me-2" onclick="openEditModal(${task.id}, '${task.Title}', '${task.Description}')">Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">Delete</button>
              </div>
          </li>
      `;
  });
};

// Add Task
document.getElementById("taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();

    if (!title || !description) return alert("Fields cannot be empty!");

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
    });

    document.getElementById("taskForm").reset();
    fetchTasks();
});

// Delete Task
const deleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTasks();
};

// Open Edit Task Modal
const openEditModal = (id, title, description) => {
    document.getElementById("editTaskId").value = id;
    document.getElementById("editTaskTitle").value = title;
    document.getElementById("editTaskDescription").value = description;

    editTaskModal.show();
};

// Update Task
const updateTask = async () => {
    const id = document.getElementById("editTaskId").value;
    const title = document.getElementById("editTaskTitle").value.trim();
    const description = document.getElementById("editTaskDescription").value.trim();

    if (!title || !description) return alert("Fields cannot be empty!");

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
    });

    editTaskModal.hide();
    fetchTasks();
};

// Load tasks on page load
fetchTasks();
