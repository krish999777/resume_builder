import {v2 as cloudinary} from 'cloudinary'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routers/authRouter'
import resumeRouter from './routers/resumeRouter'
import profileRouter from './routers/profileRouter'
import errorHandleMiddleware from './middlewares/errorHandler'
import conversationRouter from './routers/conversationRouter'

dotenv.config()
const app=express()
app.use(express.json())
app.use(cors({
    origin:process.env.FRONTEND_URL||'http://localhost:5173',
    credentials:true
}))
app.use(cookieParser())

const cloud_name=process.env.CLOUD_NAME
const api_key=process.env.API_KEY
const api_secret=process.env.API_SECRET
if(!cloud_name||!api_key||!api_secret){
    console.log('.env variables missing')
    process.exit(1)
}
cloudinary.config({
    cloud_name,api_key,api_secret
})

app.use('/auth',authRouter)
app.use('/resume',resumeRouter)
app.use('/profile',profileRouter)
app.use('/conversation',conversationRouter)

app.use(errorHandleMiddleware)

const PORT=process.env.PORT||8000
app.listen(PORT,()=>console.log(`App listening on port ${PORT}`))