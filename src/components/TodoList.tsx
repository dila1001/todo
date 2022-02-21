import React, { useState, useEffect } from "react";
import Todo from "./Todo";

export interface TodoItemTemplate {
  text: string;
  done: boolean;
}
export interface TodoItem extends TodoItemTemplate {
  id: string;
}

export interface TodoProps extends TodoItem {
  toggle: (todoItem: TodoItem) => void;
  del: (todoId: string) => void;
}

type Display = "All" | "Active" | "Completed";

function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [taskValue, setTaskValue] = useState<string>("");
  const [display, setDisplay] = useState<Display>("All");

  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data.todos))
      .catch((err) => console.log(err));
  }, []);

  function createTodo(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const newTodo: TodoItemTemplate = { text: taskValue, done: false };

    fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
    })
      .then((res) => res.json())
      .then((data) => setTodos([...todos, data.todo]));

    setTaskValue("");
  }

  // https://streakyc.github.io/react-draggable-list/example/

  function updateTodoItem(todoItem: TodoItem) {
    setTodos((prevTodos) => {
      return prevTodos.map((item) => {
        return item.id === todoItem.id ? todoItem : item;
      });
    });
  }

  const checkTodoItem = (todoItem: TodoItem) => {
    todoItem.done = !todoItem.done;
    updateTodoItem(todoItem);
    fetch(`/api/todos/${todoItem.id}`, {
      method: "PUT",
      body: JSON.stringify(todoItem),
    }).catch((err) => {
      console.log(err);
      // If the API call fails then revert to the previous state
      todoItem.done = !todoItem.done;
      updateTodoItem(todoItem);
    });
  };

  function deleteItem(todoId: string) {
    const oldTodos = todos;
    const removedList = todos.filter((todo) => todo.id !== todoId);
    setTodos(removedList);
    fetch(`/api/todos/${todoId}`, { method: "DELETE" }).catch((err) => {
      console.log(err);
      // If the API call fails then revert to the previous state
      setTodos((todos) => oldTodos);
    });
  }

  function list() {
    let filteredTodoItems: TodoItem[];

    switch (display) {
      case "Completed":
        filteredTodoItems = todos.filter((todo) => todo.done === true);
        break;
      case "Active":
        filteredTodoItems = todos.filter((todo) => todo.done === false);
        break;
      default:
        // Skip filtering
        filteredTodoItems = todos;
        break;
    }
    return filteredTodoItems.map((todo) => (
      <Todo
        key={todo.id}
        id={todo.id}
        text={todo.text}
        done={todo.done}
        toggle={() => checkTodoItem(todo)}
        del={() => deleteItem(todo.id)}
      />
    ));
  }

  return (
    <div>
      <form className="form-floating mb-3 d-flex" onSubmit={createTodo}>
        <input
          type="text"
          className="form-control me-2"
          name="task"
          placeholder="What's the plan for today?"
          value={taskValue}
          onChange={(e) => setTaskValue(e.target.value)}
        />
        <label htmlFor="task">What's the plan for today?</label>
        <button className="btn btn-custom w-25" type="submit">
          Add
        </button>
      </form>

      <ul className="nav nav-pills mb-3">
        <li className="nav-item">
          <a
            className={display === "All" ? "nav-link active" : "nav-link"}
            onClick={() => setDisplay("All")}
          >
            All
          </a>
        </li>
        <li className="nav-item">
          <a
            className={display === "Active" ? "nav-link active" : "nav-link"}
            onClick={() => setDisplay("Active")}
          >
            Active
          </a>
        </li>
        <li className="nav-item">
          <a
            className={display === "Completed" ? "nav-link active" : "nav-link"}
            onClick={() => setDisplay("Completed")}
          >
            Completed
          </a>
        </li>
      </ul>
      {todos.length > 0 && <ul className="list-group">{list()}</ul>}
    </div>
  );
}

export default TodoList;
