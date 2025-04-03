// DOM Elements
const taskTitle = document.getElementById("taskTitle");
const taskInput = document.getElementById("taskInput");
const dueDate = document.getElementById("dueDate");
const priority = document.getElementById("priority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const darkModeToggle = document.getElementById("darkModeToggle");
const searchInput = document.getElementById("searchInput");
const filterPriority = document.getElementById("filterPriority");
const filterStatus = document.getElementById("filterStatus");
const sortTasks = document.getElementById("sortTasks");

// Load tasks from local storage on page load
document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);

// Save tasks to local storage
function saveTasksToLocalStorage() {
    const tasks = [];
    document.querySelectorAll(".task-card").forEach((taskCard) => {
        tasks.push({
            title: taskCard.querySelector(".task-title").textContent,
            description: taskCard.querySelector(".task-description").textContent,
            dueDate: taskCard.querySelector(".task-date").textContent.replace("Due: ", ""),
            priority: [...taskCard.classList].find((cls) => cls.startsWith("priority-")),
            minimized: taskCard.classList.contains("minimized"),
            completed: taskCard.classList.contains("completed"),
        });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load tasks from local storage
function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
        createTaskElement(task.title, task.description, task.dueDate, task.priority, task.minimized, task.completed);
    });
}

// Create a task element
function createTaskElement(title, description, dueDateValue, priorityClass, isMinimized = false, isCompleted = false) {
    const li = document.createElement("li");
    li.className = `task-card ${priorityClass}`;
    if (isMinimized) li.classList.add("minimized");
    if (isCompleted) li.classList.add("completed");

    // Task Title (always visible)
    const taskTitle = document.createElement("h3");
    taskTitle.className = "task-title";
    taskTitle.textContent = title;
    li.appendChild(taskTitle);

    // Task Details (hidden when minimized)
    const taskDetails = document.createElement("div");
    taskDetails.className = "task-details";
    taskDetails.innerHTML = `
        <p class="task-date">Due: ${dueDateValue || "No deadline"}</p>
        <p class="task-description">${description}</p>
    `;
    li.appendChild(taskDetails);

    // Buttons Container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "task-buttons";

    // Minimize/Expand Button
    const minimizeBtn = document.createElement("button");
    minimizeBtn.innerHTML = li.classList.contains("minimized")
        ? '<i class="fas fa-plus"></i> Expand'
        : '<i class="fas fa-minus"></i> Minimize';
    minimizeBtn.className = "minimize-btn";
    minimizeBtn.addEventListener("click", () => {
        li.classList.toggle("minimized");
        minimizeBtn.innerHTML = li.classList.contains("minimized")
            ? '<i class="fas fa-plus"></i> Expand'
            : '<i class="fas fa-minus"></i> Minimize';
        saveTasksToLocalStorage();
    });
    buttonsContainer.appendChild(minimizeBtn);

    // Complete Button
    const completeBtn = document.createElement("button");
    completeBtn.innerHTML = '<i class="fas fa-check"></i> Complete';
    completeBtn.className = "complete-btn";
    completeBtn.addEventListener("click", () => {
        li.classList.toggle("completed");
        saveTasksToLocalStorage();
    });
    buttonsContainer.appendChild(completeBtn);

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
        li.remove();
        saveTasksToLocalStorage();
    });
    buttonsContainer.appendChild(deleteBtn);

    li.appendChild(buttonsContainer);

    // Append the task card to the task list
    taskList.appendChild(li);
}

// Add Task
addTaskBtn.addEventListener("click", () => {
    const title = taskTitle.value.trim();
    const description = taskInput.value.trim();
    const taskDueDate = dueDate.value;
    const taskPriority = priority.value;

    if (!title) {
        alert("Please enter a task title!");
        return;
    }

    createTaskElement(title, description, taskDueDate, `priority-${taskPriority}`);
    taskTitle.value = "";
    taskInput.value = "";
    dueDate.value = "";
    priority.value = "low";
});

// Dark Mode Toggle
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// Filter tasks based on search and filter inputs
function filterTasks() {
    const searchText = searchInput.value.toLowerCase();
    const selectedPriority = filterPriority.value;
    const selectedStatus = filterStatus.value;

    document.querySelectorAll(".task-card").forEach((taskCard) => {
        const title = taskCard.querySelector(".task-title").textContent.toLowerCase();
        const priority = [...taskCard.classList].find((cls) => cls.startsWith("priority-")).replace("priority-", "");
        const isCompleted = taskCard.classList.contains("completed");

        let matchesSearch = title.includes(searchText);
        let matchesPriority = selectedPriority === "all" || priority === selectedPriority;
        let matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "completed" && isCompleted) ||
            (selectedStatus === "incomplete" && !isCompleted);

        if (matchesSearch && matchesPriority && matchesStatus) {
            taskCard.style.display = "flex";
        } else {
            taskCard.style.display = "none";
        }
    });
}

// Attach event listeners to search and filter inputs
searchInput.addEventListener("input", filterTasks);
filterPriority.addEventListener("change", filterTasks);
filterStatus.addEventListener("change", filterTasks);

// Sort tasks
sortTasks.addEventListener("change", () => {
    const sortBy = sortTasks.value;
    const tasks = Array.from(document.querySelectorAll(".task-card"));

    tasks.sort((a, b) => {
        if (sortBy === "priority") {
            const priorityOrder = { "priority-low": 1, "priority-medium": 2, "priority-high": 3 };
            return priorityOrder[a.classList[1]] - priorityOrder[b.classList[1]];
        } else if (sortBy === "dueDate") {
            const dateA = new Date(a.querySelector(".task-date").textContent.replace("Due: ", "") || "9999-12-31");
            const dateB = new Date(b.querySelector(".task-date").textContent.replace("Due: ", "") || "9999-12-31");
            return dateA - dateB;
        } else if (sortBy === "status") {
            return a.classList.contains("completed") - b.classList.contains("completed");
        }
        return 0;
    });

    tasks.forEach((task) => taskList.appendChild(task)); // Reorder tasks in the DOM
});
