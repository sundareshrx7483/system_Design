import express from "express";
import { addTodo, deleteTodo, getSingleTodo, getTodos, updateTodo } from "../controllers/todoController.js";
const route=express.Router();

route.post("/todos",addTodo);

route.get("/todos",getTodos);

route.get("/todos/:id",getSingleTodo);

route.patch("/todos/:id",updateTodo);

route.delete("/todos/:id",deleteTodo)

export default route