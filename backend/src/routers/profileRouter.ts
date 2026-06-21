import express from 'express'
import {putProfileController} from '../controllers/profileController'

const router=express.Router()

router.put('/',putProfileController)

export default router