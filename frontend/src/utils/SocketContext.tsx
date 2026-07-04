import {createContext} from 'react'
import {io} from 'socket.io-client'
import type {Socket} from 'socket.io-client'
import useMe from '../hooks/useMe'
import type {ReactNode} from 'react'
import {useState,useEffect} from 'react'

export const SocketContext=createContext<Socket|null>(null)

export function SocketProvider({children}:{children:ReactNode}){
    const [socket,setSocket]=useState<Socket|null>(null)

    const {data:user}=useMe()
    useEffect(()=>{
        if(user){
            const newSocket = io(import.meta.env.VITE_BACKEND_URL,{
                withCredentials:true
            })
            setSocket(newSocket)
            return () => {newSocket.disconnect()}
        }else{
            setSocket(null)
        }
    },[user])
    return(
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}