
import db from "./db.js";

function mapTodo(row) {
  if (!row) return null
  return { ...row, completed: row.completed === 1 }
}

export const resolvers = {
    Query: {
        users: () => db.prepare('SELECT * FROM users').all(),
        user: (_, { id }) => db.prepare('SELECT * FROM users WHERE id = ?').get(id) ?? null,
        todos: () => db.prepare('SELECT * FROM todos').all().map(mapTodo),
        todo: (_, { id }) => mapTodo(db.prepare('SELECT * FROM todos WHERE id = ?').get(id)) ?? null,
    },
    
    User: { 
        todos: (parent) => db.prepare('SELECT * FROM todos WHERE user_id = ?').all(parent.id).map(mapTodo),
    },

    ToDoItem: {
        user: (parent) => db.prepare('SELECT * FROM users WHERE id = ?').get(parent.user_id) ?? null,
    },

    Mutation: {
        createUser: (_, { name, email, login }) => { 
            const { lastInsertRowid } = db.prepare('INSERT INTO users (name, email, login) VALUES (?, ?, ?)').run(name, email, login);
            return db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid)
        },

        updateUser: (_, { id, name, email, login }) => {
            const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
            if (!existing) return null

            db.prepare('UPDATE users SET name = ?, email = ?, login = ? WHERE id = ?').run(name ?? existing.name, email ?? existing.email, login ?? existing.login, id)
            return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
        },

        deleteUser: (_, { id }) => {
            const { changes } = db.prepare('DELETE FROM users WHERE id = ?').run(id)
            return changes > 0
        },

        createTodo: (_, { title, userId }) => {
            const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
            if (!user) throw new Error(`Użytkownik o id=${userId} nie istnieje.`)

            const { lastInsertRowid } = db.prepare('INSERT INTO todos (title, completed, user_id) VALUES (?, 0, ?)').run(title, userId)

            return mapTodo(db.prepare('SELECT * FROM todos WHERE id = ?').get(lastInsertRowid))
        },
 
        updateTodo: (_, { id, title, completed }) => {
            const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id)
            if (!existing) return null

            const newCompleted = completed !== undefined && completed !== null ? (completed ? 1 : 0) : existing.completed

            db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?').run(title ?? existing.title, newCompleted, id)
            return mapTodo(db.prepare('SELECT * FROM todos WHERE id = ?').get(id))
        },
 
        deleteTodo: (_, { id }) => {
            const { changes } = db.prepare('DELETE FROM todos WHERE id = ?').run(id)
            return changes > 0
        },
    },
}







