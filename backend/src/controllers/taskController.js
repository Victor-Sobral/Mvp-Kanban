import Task from '../models/Task.js'

// GET /api/tasks — busca todas as tarefas
export const getTasks = async (req, res) => {
  /* REQ entrada das informções vindas do front, RES volta das requisções enviada pelo BD */
  try {
    const tasks = await Task.find().sort({
      createdAt: 1,
    }) /* Tas.find = responsável pela pesquisa no Bd / sort = responsável pela ordenação da mais antiga para a mais nova */
    res.status(200).json(tasks) /* confirmação se tudo rodar certo */
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar tarefas', error: error.message })
  }
}

// POST /api/tasks — cria uma nova tarefa
export const createTask = async (req, res) => {
  try {
    const { nome, prazo } = req.body

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ message: 'O nome da tarefa é obrigatório' })
    }

    const task = await Task.create({ nome, prazo })
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar tarefa', error: error.message })
  }
}

// PATCH /api/tasks/:id/advance — avança a tarefa para o próximo status
export const advanceTask = async (req, res) => {
  try {
    const ordem = ['todo', 'progress', 'done'] //define a ordem da evolução da tarefa
    const task = await Task.findById(req.params.id) //busca a tarefa pelo parametro id (req.params.id)

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' })
    }

    const indexAtual = ordem.indexOf(task.status) //verifica em que lista a tarefa se encontra

    if (indexAtual === ordem.length - 1) {
      //confirma se a tarefa já esta no ultimo estágio
      return res.status(400).json({ message: 'A tarefa já está no status final' })
    }

    task.status = ordem[indexAtual + 1]
    await task.save()

    res.status(200).json(task)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao avançar tarefa', error: error.message })
  }
}

// DELETE /api/tasks/:id — remove uma tarefa
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' })
    }

    res.status(200).json({ message: 'Tarefa removida com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover tarefa', error: error.message })
  }
}

// PATCH /api/tasks/:id — edita nome e prazo da tarefa
export const updateTask = async (req, res) => {
  try {
    const { nome, prazo } = req.body

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ message: 'O nome da tarefa é obrigatório' })
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { nome, prazo },
      { new: true }, // retorna o registro já atualizado
    )

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' })
    }

    res.status(200).json(task) //confirma a atualização com sucesso
  } catch (error) {
    res.status(500).json({ message: 'Erro ao editar tarefa', error: error.message })
  }
}
