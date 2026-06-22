import express from 'express'
import multer from 'multer'
import type {Request} from 'express'
import {putProfileController,deleteProfileController} from '../controllers/profileController'
import {isAuthenticated} from '../middlewares/isAuthenticated'

const router=express.Router()

const upload=multer({
    storage:multer.memoryStorage(),
    fileFilter:(req:Request,file,cb)=>{
        const acceptedTypes=['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if(acceptedTypes.includes(file.mimetype)){
            cb(null,true)
        }else{
            cb(new Error('Only images are accepted'))
        }
    },
    limits:{
        fileSize:5*1024*1024,
    }
})

router.put('/',isAuthenticated,upload.single('profile'),putProfileController)
router.delete('/',isAuthenticated,deleteProfileController)

export default router