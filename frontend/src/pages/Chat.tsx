import './Chat.css'
import {getConversations,getEachChat} from '../utils/api'
import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import useMe from '../hooks/useMe'
import {useState,useEffect} from 'react'
import {toast} from 'react-hot-toast'
import type {SubmitEvent} from 'react'
import useSocket from "../hooks/useSocket"

export default function Messages(){
    const [chat,setChat]=useState<null|number>(null)
    
    const queryClient=useQueryClient()
    
    const socket=useSocket()
    useEffect(()=>{
        if(!socket){
            return
        }
        socket.on('recieveMessage',data=>{
            console.log('recieved')
            queryClient.invalidateQueries({queryKey:['messages',data.conversationId]})
        })
    },[socket])

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
        <div className="chat-layout">
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
                        <div className="chat-messages">
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
                        </div>
                        <form className="chat-input-bar" onSubmit={handleSubmit}>
                            <input className="chat-input" name="message" placeholder="Type a message..." autoComplete="off" />
                            <button className="chat-send-btn" type="submit">Send</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}