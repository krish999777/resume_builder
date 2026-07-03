import './Chat.css'
import {getConversations,getEachChat} from '../utils/api'
import {useQuery} from '@tanstack/react-query'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import useMe from '../hooks/useMe'
import {useState} from 'react'

export default function Messages(){
    const [chat,setChat]=useState<null|number>(null)

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
                        chatQuery.data.data.length===0
                        ?
                        (<div>No messages found, start a conversation</div>)
                        :
                        (
                        <div>
                            {chatQuery.data.data.map((chat,index)=>(
                                <div key={index} className={chat.senderId===query.data!.id?'Left':'Right'}>
                                    <div><img src={chat.profileUrl} alt="pfp"/></div>
                                    <div>{chat.name}</div>
                                    <div>{chat.message}</div>
                                    <div>{new Date(chat.sentAt).toDateString()}</div>
                                </div>
                            ))}
                        </div>
                        )
                        }
                    </div>
                )}
            </div>
        </div>
    )
}