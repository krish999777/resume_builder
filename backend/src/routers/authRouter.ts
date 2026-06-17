import express from 'express'
import {signupController} from '../controllers/signupController'
import {loginController,logoutController} from '../controllers/loginController'
import {isAuthenticated} from '../middlewares/isAuthenticated'

const router=express.Router()

router.post('/signup',signupController)
router.post('/login',loginController)
router.get('/logout',isAuthenticated,logoutController)

export default router