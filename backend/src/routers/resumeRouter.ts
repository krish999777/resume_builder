import express from 'express'
import {createResumeController} from '../controllers/resumeController'
import {isCandidate,isRecruiter} from '../middlewares/isRole'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router=express.Router()

router.post('/',isAuthenticated,isCandidate,createResumeController)

export default router