import express from 'express'
import { postConversation,getConversation } from '../controllers/conversationController'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { isRecruiter } from '../middlewares/isRole'

const router=express.Router()

router.post('/',isAuthenticated,isRecruiter,postConversation)
router.get('/',isAuthenticated,getConversation)

export default router
