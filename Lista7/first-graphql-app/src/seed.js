import axios from 'axios'
import db from './db.js'

const BASE_URL = 'https://jsonplaceholder.typicode.com'

export async function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM users').get()
  if (count > 0) {
    console.log(`[seed] Database already contains ${count} users – skipping seed.`)
    return
  }

  console.log('[seed] Importing data from JSONPlaceholder...')

  const [{ data: users }, { data: todos }] = await Promise.all([
    axios.get(`${BASE_URL}/users`),
    axios.get(`${BASE_URL}/todos`),
  ])

  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (id, name, email, login) VALUES (?, ?, ?, ?)'
  )
  const insertTodo = db.prepare(
    'INSERT OR IGNORE INTO todos (id, title, completed, user_id) VALUES (?, ?, ?, ?)'
  )

  db.transaction(() => {
    for (const u of users) {
      insertUser.run(u.id, u.name, u.email, u.username)
    }
    for (const t of todos) {
      insertTodo.run(t.id, t.title, t.completed ? 1 : 0, t.userId)
    }
  })()

  console.log(`[seed] Imported ${users.length} users and ${todos.length} todos.`)
}