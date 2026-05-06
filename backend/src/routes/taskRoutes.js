import { Router } from 'express'
import {
  getTasks,
  createTask,
  advanceTask,
  deleteTask,
  updateTask,
} from '../controllers/taskController.js'

const router = Router()

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id/advance', advanceTask)
router.delete('/:id', deleteTask)
router.patch('/:id', updateTask)

export default router
