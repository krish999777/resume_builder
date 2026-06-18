import express from 'express'
import {signupController} from '../controllers/signupController'
import {loginController,logoutController,meController} from '../controllers/loginController'
import {isAuthenticated} from '../middlewares/isAuthenticated'

const router=express.Router()

router.post('/signup',signupController)
router.post('/login',loginController)
router.post('/logout',isAuthenticated,logoutController)
router.get('/me',isAuthenticated,meController)

export default router