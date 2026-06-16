import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRouter from './routers/authRouter'

dotenv.config()
const app=express()
app.use(express.json())
app.use(cors())

app.use('/auth',authRouter)

const PORT=process.env.PORT||8000
app.listen(PORT,()=>console.log(`App listening on port ${PORT}`))