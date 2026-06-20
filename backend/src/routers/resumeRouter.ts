import express from 'express'
import {createResumeController,getResumeController,getEachResumeController,putResumeController} from '../controllers/resumeController'
import {isCandidate,isRecruiter} from '../middlewares/isRole'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router=express.Router()

router.post('/',isAuthenticated,isCandidate,createResumeController)
router.get('/',isAuthenticated,getResumeController)
router.get('/:userId',isAuthenticated,isRecruiter,getEachResumeController)
router.put('/',isAuthenticated,isCandidate,putResumeController)

export default router