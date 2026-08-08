'use client';

import React, { useState, useEffect, KeyboardEvent } from 'react';
import { TodoWidgetConfig, TodoItem } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

export default function TodoWidget({ config }: { config: TodoWidgetConfig }) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dak-todos');
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse todos', e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('dak-todos', JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const handleAdd = () => {
    const text = inputValue.trim();
    if (!text) return;
    
    const newTodo: TodoItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
      text,
      completed: false,
      createdAt: Date.now()
    };
    
    setTodos(prev => [...prev, newTodo]);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  return (
    <WidgetShell title={config.title} titleUrl={config.titleUrl} hideHeader={config.hideHeader}>
      <div className={config.cssClass}>
        <div className="todo-input-row">
          <input
            type="text"
            className="todo-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
          />
          <button className="todo-add-btn" onClick={handleAdd}>Add</button>
        </div>
        
        {mounted && (
          <ul className="todo-list">
            {todos.map(todo => (
              <li key={todo.id} className="todo-item">
                <input 
                  type="checkbox" 
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className="todo-text" data-completed={todo.completed}>
                  {todo.text}
                </span>
                <button 
                  className="todo-delete-btn" 
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="Delete task"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WidgetShell>
  );
}
