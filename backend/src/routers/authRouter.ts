import express from 'express'
import {signupController} from '../controllers/signupController'
import {loginController} from '../controllers/loginController'

const router=express.Router()

router.post('/signup',signupController)
router.post('/login',loginController)

export default router