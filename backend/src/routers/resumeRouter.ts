import express from 'express'
import {createResumeController,getResumeController,getEachResumeController} from '../controllers/resumeController'
import {isCandidate,isRecruiter} from '../middlewares/isRole'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router=express.Router()

router.post('/',isAuthenticated,isCandidate,createResumeController)
router.get('/',isAuthenticated,getResumeController)
router.get('/:userId',isAuthenticated,isRecruiter,getEachResumeController)

export default router