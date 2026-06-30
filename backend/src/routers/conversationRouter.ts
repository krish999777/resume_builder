import express from 'express'
import { postConversation,getConversation,getEachConversation} from '../controllers/conversationController'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { isRecruiter } from '../middlewares/isRole'

const router=express.Router()

router.post('/',isAuthenticated,isRecruiter,postConversation)
router.get('/',isAuthenticated,getConversation)
router.get('/:id/messages',isAuthenticated,getEachConversation)

export default router
