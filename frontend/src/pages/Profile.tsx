import './Profile.css'
import useMe from '../hooks/useMe'
import LoadingSpinner from '../components/LoadingSpinner'
import {useForm} from 'react-hook-form'
import {putProfile,deleteProfile} from '../utils/api'
import {useMutation,useQueryClient} from '@tanstack/react-query'
import type { SubmitHandler } from 'react-hook-form'
import toast from 'react-hot-toast'
import {useState} from 'react'
import ErrorMessage from '../components/ErrorMessage'

type Input={profile:FileList}

export default function Profile(){
    const [isEditing,setIsEditing]=useState<boolean>(false)

    const {register,handleSubmit,formState:{errors}}=useForm<Input>()
    const {data,isPending,error}=useMe()
    const queryClient=useQueryClient()
    const mutation=useMutation({
        mutationFn:putProfile,
        onSuccess:()=>{
            toast.success('Profile photo updated successfully')
            queryClient.invalidateQueries({queryKey:['me']})
            setIsEditing(false)
        },
        onError:(err)=>toast.error(err.message)
    })
    const deleteMutation=useMutation({
        mutationFn:deleteProfile,
        onSuccess:()=>{
            toast.success('Profile photo deleted successfully')
            queryClient.invalidateQueries({queryKey:['me']})
            setIsEditing(false)
        },
        onError:(err)=>{
            toast.error(err.message)
        }
    })
    if(isPending){
        return <LoadingSpinner/>
    }
    if(!data||error){
        return <ErrorMessage message={error?error.message:'Unknown error'}/>
    }

    const onSubmit:SubmitHandler<Input>=(data:Input)=>{
        const formData = new FormData()
        formData.append('profile',data.profile[0])
        mutation.mutate(formData)
    }

    return (
        <div className="profile-wrap">
            <div className="profile-card">
                <div className="profile-avatar-section">
                    <img src={data.profileUrl} alt={data.name} className="profile-avatar"/>
                    <div className="profile-info">
                        <h1 className="profile-name">{data.name}</h1>
                        <p className="profile-role">{data.role.charAt(0).toUpperCase()+data.role.slice(1)}</p>
                    </div>
                </div>
                <div className="profile-actions">
                    {!data.isDefault&&<button className="profile-delete-btn" onClick={()=>deleteMutation.mutate()}>Remove Photo</button>}
                    <button className="profile-edit-btn" onClick={()=>setIsEditing(prev=>!prev)}>{isEditing?'Cancel':'Change Photo'}</button>
                </div>
                {isEditing&&(
                    <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
                        <input type="file" accept="image/*" {...register('profile',{required:"Please select a file"})} className="profile-file-input"/>
                        {errors.profile&&<p className="profile-error">{errors.profile.message}</p>}
                        <button className="profile-submit-btn" disabled={mutation.isPending}>
                            {mutation.isPending?<><span className="profile-spinner"/>Uploading...</>:'Upload Photo'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}