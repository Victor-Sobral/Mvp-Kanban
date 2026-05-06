<script setup>
import { ref, onMounted } from 'vue'
import { getTasks, createTask, advanceTask, deleteTask, updateTask } from '@/services/api.js'

const modal = ref(null)
const colunaAtiva = ref(0)
const novaTarefa = ref({ nome: '', prazo: '' })
const carregando = ref(false)
const modalEditar = ref(null)
const tarefaEditando = ref({ _id: null, nome: '', prazo: '', colunaIndex: 0, tarefaIndex: 0 })

const statusMap = ['todo', 'progress', 'done']

const colunas = ref([
  { titulo: 'A Fazer', status: 'todo', tarefas: [] },
  { titulo: 'Em Andamento', status: 'progress', tarefas: [] },
  { titulo: 'Concluído', status: 'done', tarefas: [] },
])

// Carrega tarefas do banco ao iniciar
async function carregarTarefas() {
  carregando.value = true
  try {
    const tasks = await getTasks()
    // Limpa e redistribui por status
    colunas.value.forEach((c) => (c.tarefas = []))
    tasks.forEach((task) => {
      const coluna = colunas.value.find((c) => c.status === task.status)
      if (coluna) coluna.tarefas.push(task)
    })
  } catch (e) {
    console.error('Erro ao carregar tarefas:', e)
  } finally {
    carregando.value = false
  }
}

function abrirModal(colunaIndex) {
  colunaAtiva.value = colunaIndex
  novaTarefa.value = { nome: '', prazo: '' }
  modal.value.showModal()
}

function fecharModal() {
  modal.value.close()
}

async function adicionarTarefa() {
  if (!novaTarefa.value.nome.trim()) return
  try {
    const task = await createTask(novaTarefa.value.nome, novaTarefa.value.prazo || 'Sem prazo')
    colunas.value[0].tarefas.push(task) // sempre começa em "A Fazer"
    fecharModal()
  } catch (e) {
    console.error('Erro ao adicionar tarefa:', e)
  }
}

async function avancarTarefa(colunaIndex, tarefaIndex) {
  const tarefa = colunas.value[colunaIndex].tarefas[tarefaIndex]
  try {
    const atualizada = await advanceTask(tarefa._id)
    colunas.value[colunaIndex].tarefas.splice(tarefaIndex, 1)
    colunas.value[colunaIndex + 1].tarefas.push(atualizada)
  } catch (e) {
    console.error('Erro ao avançar tarefa:', e)
  }
}

async function removerTarefa(colunaIndex, tarefaIndex) {
  const tarefa = colunas.value[colunaIndex].tarefas[tarefaIndex]
  try {
    await deleteTask(tarefa._id)
    colunas.value[colunaIndex].tarefas.splice(tarefaIndex, 1)
  } catch (e) {
    console.error('Erro ao remover tarefa:', e)
  }
}

function abrirModalEditar(colunaIndex, tarefaIndex) {
  const tarefa = colunas.value[colunaIndex].tarefas[tarefaIndex]
  tarefaEditando.value = {
    _id: tarefa._id,
    nome: tarefa.nome,
    prazo: tarefa.prazo === 'Sem prazo' ? '' : tarefa.prazo,
    colunaIndex,
    tarefaIndex,
  }
  modalEditar.value.showModal()
}

function fecharModalEditar() {
  modalEditar.value.close()
}

async function salvarEdicao() {
  if (!tarefaEditando.value.nome.trim()) return
  try {
    const atualizada = await updateTask(
      tarefaEditando.value._id,
      tarefaEditando.value.nome,
      tarefaEditando.value.prazo || 'Sem prazo',
    )
    const { colunaIndex, tarefaIndex } = tarefaEditando.value
    colunas.value[colunaIndex].tarefas[tarefaIndex] = atualizada
    fecharModalEditar()
  } catch (e) {
    console.error('Erro ao editar tarefa:', e)
  }
}

onMounted(carregarTarefas)
</script>

<template>
  <div class="flex gap-4 p-4">
    <div v-for="(coluna, colunaIndex) in colunas" :key="colunaIndex" class="flex-1">
      <ul class="list bg-base-100 rounded-box shadow-md">
        <!-- Cabeçalho -->
        <li class="p-4 pb-2 flex items-center justify-between">
          <span class="text-2xl font-semibold tracking-wide">{{ coluna.titulo }}</span>
          <button
            v-if="colunaIndex === 0"
            class="btn btn-sm btn-ghost"
            @click="abrirModal(colunaIndex)"
          >
            +
          </button>
        </li>

        <!-- Indicador de carregamento -->
        <li v-if="carregando" class="p-4 text-sm opacity-40 italic">Carregando...</li>

        <!-- Tarefas -->
        <li v-for="(tarefa, tarefaIndex) in coluna.tarefas" :key="tarefa._id" class="list-row">
          <div class="text-4xl font-thin tabular-nums opacity-40">
            {{ String(tarefaIndex + 1).padStart(2, '0') }}
          </div>

          <div class="text-2xl list-col-grow">
            <div class="font-medium">{{ tarefa.nome }}</div>
            <div class="text-medium uppercase font-semibold opacity-60">
              Prazo: {{ tarefa.prazo }}
            </div>
          </div>

          <!-- Botão excluir -->
          <button
            class="btn btn-square btn-ghost text-error"
            @click="removerTarefa(colunaIndex, tarefaIndex)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>

          <!-- Botão editar (não aparece na última coluna) -->
          <button
            v-if="colunaIndex < colunas.length - 1"
            class="btn btn-square btn-ghost"
            @click="abrirModalEditar(colunaIndex, tarefaIndex)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#eef207"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-pencil-icon lucide-pencil"
            >
              <path
                d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
              />
              <path d="m15 5 4 4" />
            </svg>
          </button>

          <!-- Botão avançar (não aparece na última coluna) -->
          <button
            v-if="colunaIndex < colunas.length - 1"
            class="btn btn-square btn-ghost"
            @click="avancarTarefa(colunaIndex, tarefaIndex)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#02ca19"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-circle-arrow-right-icon lucide-circle-arrow-right"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m12 16 4-4-4-4" />
              <path d="M8 12h8" />
            </svg>
          </button>
        </li>

        <!-- Coluna vazia -->
        <li
          v-if="!carregando && coluna.tarefas.length === 0"
          class="p-4 text-medium opacity-40 italic"
        >
          Nenhuma tarefa listada.
        </li>
      </ul>
    </div>
  </div>

  <!-- Modal para criar tarefa-->
  <dialog ref="modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Nova Tarefa</h3>
      <div class="flex flex-col gap-3">
        <label class="input input-bordered flex items-center gap-2">
          Nome
          <input
            v-model="novaTarefa.nome"
            type="text"
            class="grow"
            placeholder="Digite aqui a sua nova tarefa"
          />
        </label>
        <label class="input input-bordered flex items-center gap-2">
          Prazo
          <input v-model="novaTarefa.prazo" type="date" class="grow" />
        </label>
      </div>
      <div class="modal-action">
        <button class="btn" @click="fecharModal">Cancelar</button>
        <button class="btn btn-primary" @click="adicionarTarefa">Adicionar</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="fecharModal">close</button>
    </form>
  </dialog>

  <!-- Modal Editar tarefa-->
  <dialog ref="modalEditar" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Editar Tarefa</h3>
      <div class="flex flex-col gap-3">
        <label class="input input-bordered flex items-center gap-2">
          Nome
          <input
            v-model="tarefaEditando.nome"
            type="text"
            class="grow"
            placeholder="Nome da tarefa"
          />
        </label>
        <label class="input input-bordered flex items-center gap-2">
          Prazo
          <input v-model="tarefaEditando.prazo" type="date" class="grow" />
        </label>
      </div>
      <div class="modal-action">
        <button class="btn" @click="fecharModalEditar">Cancelar</button>
        <button class="btn btn-primary" @click="salvarEdicao">Salvar</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="fecharModalEditar">close</button>
    </form>
  </dialog>
</template>
