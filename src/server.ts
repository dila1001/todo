import { Response, createServer, Model } from "miragejs";
import { TodoItem } from "./components/TodoList";

export function makeServer({ environment = "test" } = {}) {
  let server = createServer({
    environment,

    models: {
      todo: Model.extend<Partial<TodoItem>>({}),
    },

    seeds(server) {
      server.create("todo", { id: "1", text: "Buy groceries", done: false });
      server.create("todo", { id: "2", text: "Make bed", done: true });
      server.create("todo", { id: "3", text: "Water plants", done: false });
    },

    routes() {
      this.get("/api/todos");

      this.post("/api/todos", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);

        return schema.create("todo", attrs);
      });

      this.put("/api/todos/:id", (schema, request) => {
        const todoItemId = request.params.id;
        const oldTodoItem = schema.find("todo", todoItemId);

        // Validation
        if (oldTodoItem === undefined || oldTodoItem === null)
          return new Response(
            400,
            {},
            { errors: [`No item with id: ${todoItemId}`] }
          );

        const newTodoItem = JSON.parse(request.requestBody);
        oldTodoItem.update(newTodoItem);

        return newTodoItem;
      });

      this.del("/api/todos/:id", (schema, request) => {
        const todoItemId = request.params.id;
        const todoItem = schema.find("todo", todoItemId);

        // Validation
        if (todoItem === undefined || todoItem === null)
          return new Response(
            400,
            {},
            { errors: [`No item with id: ${todoItemId}`] }
          );

        todoItem.destroy();
        return new Response(200, {}, { success: true });
      });
    },
  });

  return server;
}
