import { useContext } from "react"
import { SocketContext } from "../utils/SocketContext"

export default function useSocket(){
    const socket=useContext(SocketContext)
    return socket
}