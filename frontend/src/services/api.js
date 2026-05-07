const BASE_URL = 'https://mvp-kanban.onrender.com/api'
//http://localhost:3000/api
export const getTasks = async () => {
  const res = await fetch(`${BASE_URL}/tasks`)
  return res.json()
}

export const createTask = async (nome, prazo) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, prazo }),
  })
  return res.json()
}

export const advanceTask = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}/advance`, {
    method: 'PATCH',
  })
  return res.json()
}

export const deleteTask = async (id) => {
  await fetch(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' })
}

export const updateTask = async (id, nome, prazo) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, prazo }),
  })
  return res.json()
}
