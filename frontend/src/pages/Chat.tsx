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
        return <div>No conversations found. {query.data!.role==='candidate'?'You will see your conversations here when a recruiter messages you':'Message a candidate to start a conversation'}</div>//style this when i tell you to do the css
    }

    return(
        <div>
            <div>
                {data.data.map(convo=>(
                    <div key={convo.id} onClick={()=>setChat(convo.id)}>
                        <div>{convo.name}</div>
                        <div>{new Date(convo.lastMessagedAt).toDateString()}</div>
                    </div>
                ))}
            </div>
            <div>
                {!chat?'Select a chat':(
                    <div>
                        {chatQuery.isPending
                        ?
                        <LoadingSpinner/>
                        :
                        chatQuery.error||!chatQuery.data
                        ?
                        (<div><ErrorMessage message={chatQuery?.error?.message||'Unknown error'}/></div>)
                        :
                        (
                        <div>
                            {chatQuery.data.data.length===0?'No messages found, start a conversation':chatQuery.data.data.map((chat,index)=>(
                                <div key={index} className={chat.senderId===query.data!.id?'right':'left'}>
                                    <div><img src={chat.profileUrl} alt="pfp"/></div>
                                    <div>{chat.name}</div>
                                    <div>{chat.message}</div>
                                    <div>{new Date(chat.sentAt).toDateString()}</div>
                                </div>
                            ))}
                            <div>
                                <form onSubmit={handleSubmit}>
                                    <input name="message"/>
                                    <button>Send</button>
                                </form>
                            </div>
                        </div>
                        )
                        }
                    </div>
                )}
            </div>
        </div>
    )
}