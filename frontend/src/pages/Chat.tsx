import './Chat.css'
import {getConversations,getEachChat} from '../utils/api'
import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import useMe from '../hooks/useMe'
import {useState,useEffect,useRef} from 'react'
import {toast} from 'react-hot-toast'
import type {SubmitEvent} from 'react'
import useSocket from "../hooks/useSocket"
import { useLocation } from 'react-router-dom'

export default function Messages(){
    const conversationId=useLocation().state?.conversationId||null

    const [chat,setChat]=useState<null|number>(conversationId)
    const [isTyping,setIsTyping]=useState<boolean>(false)
    const [typingTrigger,setTypingTrigger]=useState<number>(0)

    const messages=useRef<any>(null)
    
    const queryClient=useQueryClient()
    
    const socket=useSocket()
    useEffect(()=>{
        if(!socket){
            return
        }
        function recieveMessage(data:any){
            setIsTyping(false)
            queryClient.invalidateQueries({queryKey:['messages',data.conversationId]})
            queryClient.invalidateQueries({queryKey:['conversations']})
        }
        function handleError(err:any){
            toast.error(err.message)
        }
        function handleTypingSocket({conversationId}:{conversationId:number}){
            if(conversationId===chat){
                setIsTyping(true)
                setTypingTrigger(prev=>prev+1)
            }
        }
        socket.on('recieveMessage',recieveMessage)
        socket.on('error',handleError)
        socket.on('typingReciever',handleTypingSocket)
        return ()=>{
            socket.off('recieveMessage',recieveMessage)
            socket.off('error',handleError)
            socket.off('typingReciever',handleTypingSocket)
        }
    },[socket,chat])

    useEffect(()=>{
        const timeout=setTimeout(()=>setIsTyping(false),3000)
        return ()=>clearTimeout(timeout)
    },[typingTrigger])

    const query=useMe()

    const {data,isPending,error}=useQuery({
        queryFn:getConversations,
        queryKey:['conversations']
    })
    const chatQuery=useQuery({
        enabled:chat!==null,
        queryFn:()=>getEachChat(chat!),
        queryKey:['messages',chat!]
    })

    useEffect(()=>{
        if(messages.current){
            messages.current.scrollTop = messages.current.scrollHeight
        }
    },[chatQuery.data])
    
    const chatMutation=useMutation({
        mutationFn:async ({message,conversationId}:{message:string,conversationId:number})=>{
            if(!socket){
                throw new Error('Error connecting socket')
            }
            socket.emit('sendMessage',{
                conversationId,
                message
            })
        },
        onError:(err)=>toast.error(err.message)
    })

    function handleSubmit(e:SubmitEvent){
        e.preventDefault()
        const form=e.target
        const formData=new FormData(form)
        const message=String(formData.get('message'))
        if(!message||!message.trim()){
            return
        }
        chatMutation.mutate({message,conversationId:chat!})
        form.reset()
    }

    function handleTyping(){
        if(!socket){
            return
        }
        socket.emit('typingSender',{
            conversationId:chat
        })
    }

    if(isPending){
        return <LoadingSpinner/>
    }

    if(!data||error){
        return <ErrorMessage message={error?.message||'Unknown error'}/>
    }

    if(data.data.length===0){
        return (
            <div className="chat-empty-conversations">
                No conversations found. {query.data!.role === 'candidate' ? 'You will see your conversations here when a recruiter messages you' : 'Message a candidate to start a conversation'}
            </div>
        )
    }

    return (
        <div className={`chat-layout ${chat ? 'chat-open' : ''}`}>
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">Messages</div>
                {data.data.map(convo => (
                    <div
                        key={convo.id}
                        onClick={() => setChat(convo.id)}
                        className={`chat-sidebar-item ${chat === convo.id ? 'chat-sidebar-item-active' : ''}`}
                    >
                        <div className="chat-sidebar-name">{convo.name}</div>
                        <div className="chat-sidebar-date">{new Date(convo.lastMessagedAt).toDateString()}</div>
                    </div>
                ))}
            </div>
            <div className="chat-main">
                {!chat ? (
                    <div className="chat-empty-state">Select a conversation to start messaging</div>
                ) : chatQuery.isPending ? (
                    <div className="chat-loading"><LoadingSpinner /></div>
                ) : chatQuery.error || !chatQuery.data ? (
                    <div className="chat-error"><ErrorMessage message={chatQuery?.error?.message || 'Unknown error'} /></div>
                ) : (
                    <div className="chat-window">
                        <button className="chat-back-btn" onClick={() => setChat(null)}>← Back</button>
                        <div className="chat-messages" ref={messages}>
                            {chatQuery.data.data.length === 0
                                ? <div className="chat-no-messages">No messages yet — say something!</div>
                                : chatQuery.data.data.map((msg, index) => (
                                    <div key={index} className={`chat-message-row ${msg.senderId === query.data!.id ? 'right' : 'left'}`}>
                                        <img src={msg.profileUrl} alt="pfp" className="chat-avatar" />
                                        <div className="chat-bubble-wrap">
                                            <div className="chat-bubble">{msg.message}</div>
                                        </div>
                                    </div>
                                ))
                            }
                            {isTyping && (
                                <div className="chat-message-row left">
                                    <div className="chat-typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form className="chat-input-bar" onSubmit={handleSubmit}>
                            <input className="chat-input" onChange={handleTyping} name="message" placeholder="Type a message..." autoComplete="off" />
                            <button className="chat-send-btn" type="submit">Send</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}