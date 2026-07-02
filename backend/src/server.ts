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
import {createServer} from 'http'
import {Server} from 'socket.io'
import {verifyToken} from './utils/jwt'
import {parseCookie} from 'cookie'
import {prisma} from './lib/prisma'

dotenv.config()
const app=express()

const server=createServer(app)
const io=new Server(server,{
    cors:{
        origin:process.env.FRONTEND_URL||'resume-builder-eight-lilac.vercel.app',
        credentials:true
    },
})
io.use((socket,next)=>{
    const rawCookie=socket.handshake.headers.cookie
    if(!rawCookie){
        return next(new Error('Cookie not sent'))
    }
    const cookie=parseCookie(rawCookie)
    const token=cookie.token
    if(!token){
        return next(new Error('Cookie does not contain token'))
    }
    const payload=verifyToken(token)
    if(!payload){
        return next(new Error('Not valid'))
    }
    socket.data.role=payload.role
    socket.data.id=payload.id
    next()
})
io.on("connection",async (socket)=>{
    console.log("A client connected!")
    const id=socket.data.id
    const role=socket.data.role
    const conversations=await prisma.conversation.findMany({
        where:{
            recruiterId:role==='recruiter'?id:undefined,
            candidateId:role==='candidate'?id:undefined
        },
        select:{
            id:true
        }
    })
    socket.join(conversations.map(convo=>`conversation:${convo.id}`))
})

app.use(express.json())
app.use(cors({
    origin:process.env.FRONTEND_URL||'https://resume-builder-eight-lilac.vercel.app',
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
server.listen(PORT,()=>console.log(`App listening on port ${PORT}`))