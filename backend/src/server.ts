import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routers/authRouter'
import resumeRouter from './routers/resumeRouter'
import profileRouter from './routers/profileRouter'

dotenv.config()
const app=express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use('/auth',authRouter)
app.use('/resume',resumeRouter)
app.use('/profile',profileRouter)

const PORT=process.env.PORT||8000
app.listen(PORT,()=>console.log(`App listening on port ${PORT}`))