import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome da tarefa é obrigatório'],
      trim: true,
    },
    prazo: {
      type: String,
      default: 'Sem prazo',
    },
    status: {
      type: String,
      enum: [
        'todo',
        'progress',
        'done',
      ] /* enum = O campo status só aceitará exatamente um dos valores presentes no array */,
      default: 'todo',
    },
  },
  {
    timestamps: true, // cria createdAt e updatedAt automaticamente
  },
)

export default mongoose.model('Task', taskSchema)
