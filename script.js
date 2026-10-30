const STORAGE_KEY = 'todo-app-items';
const todoForm = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const todoList = document.querySelector('#todo-list');
const itemsLeft = document.querySelector('#items-left');
const clearCompletedBtn = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');
const todoTemplate = document.querySelector('#todo-item-template');

let currentFilter = 'all';

function getTasks() {
  const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return Array.isArray(tasks) ? tasks : [];
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateSummary(tasks) {
  const remaining = tasks.filter((task) => !task.completed).length;
  itemsLeft.textContent = `${remaining} item${remaining === 1 ? '' : 's'} left`;
}

function renderTasks() {
  const tasks = getTasks();
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  todoList.innerHTML = '';

  if (filteredTasks.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.className = 'empty-state';
    emptyState.textContent =
      currentFilter === 'all'
        ? 'No tasks yet. Add one above!'
        : currentFilter === 'active'
          ? 'No active tasks.'
          : 'No completed tasks.';
    todoList.appendChild(emptyState);
    updateSummary(tasks);
    return;
  }

  filteredTasks.forEach((task) => {
    const clone = todoTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = clone.querySelector('input[type="checkbox"]');
    const text = clone.querySelector('.todo-text');
    const deleteBtn = clone.querySelector('.delete-btn');

    clone.classList.toggle('completed', task.completed);
    checkbox.checked = task.completed;
    text.textContent = task.text;

    checkbox.addEventListener('change', () => toggleTask(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    todoList.appendChild(clone);
  });

  updateSummary(tasks);
}

function addTask(text) {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  const tasks = getTasks();
  tasks.push({
    id: Date.now() + Math.random(),
    text: trimmedText,
    completed: false,
  });

  saveTasks(tasks);
  renderTasks();
}

function toggleTask(id) {
  const tasks = getTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks(updatedTasks);
  renderTasks();
}

function deleteTask(id) {
  const tasks = getTasks().filter((task) => task.id !== id);
  saveTasks(tasks);
  renderTasks();
}

function clearCompletedTasks() {
  const tasks = getTasks().filter((task) => !task.completed);
  saveTasks(tasks);
  renderTasks();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) =>
      btn.classList.toggle('active', btn === button)
    );

    renderTasks();
  });
});

clearCompletedBtn.addEventListener('click', clearCompletedTasks);

renderTasks();
