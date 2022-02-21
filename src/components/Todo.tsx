import { TodoProps } from "./TodoList";

function Todo(props: TodoProps) {
  const strike = {
    textDecoration: props.done ? "line-through" : "none",
  };

  return (
    <li className="list-group-item d-flex align-items-center" style={strike}>
      <input
        className="form-check-input me-1 p-2"
        type="checkbox"
        checked={props.done}
        onChange={() => props.toggle(props)}
      />
      <span className="p-2">{props.text}</span>
      <button
        type="button"
        className="btn-close ms-auto p-2"
        onClick={() => props.del(props.id)}
      ></button>
    </li>
  );
}

export default Todo;
