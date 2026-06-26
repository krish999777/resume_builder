import './Resume.css'
import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query'
import {useNavigate} from 'react-router-dom'
import {getResume,deleteResume} from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Resume(){
    const navigate=useNavigate()
    const queryClient=useQueryClient()
    const {data,isPending,error}=useQuery({
        queryFn:getResume,
        queryKey:['resume'],
        
    })
    const deleteMutation=useMutation({
        mutationFn:deleteResume,
        onSuccess:()=>{
            toast.success('Deleted resume successfuly')
            queryClient.invalidateQueries({
                queryKey:['resume']
            })
        },
        onError:()=>{
            toast.error('Unable to delete resume')
        }
    })
    if(isPending){
        return <LoadingSpinner/>
    }
    if(error||!data){
        return(
            <div className="resume-error-wrap">
                <div className="resume-error-icon">⚠️</div>
                <h2 className="resume-error-title">Something went wrong</h2>
                <p className="resume-error-message">{error instanceof Error ? error.message : 'Failed to load resume'}</p>
                <button className="resume-error-retry" onClick={()=>window.location.reload()}>Try Again</button>
            </div>
        )
    }
    if(!data.data){
        return(
            <div className="resume-empty-wrap">
                <div className="resume-empty-icon">📄</div>
                <h2 className="resume-empty-title">No resume yet</h2>
                <p className="resume-empty-body">Create your resume to get discovered by recruiters</p>
                <button className="resume-empty-btn" onClick={()=>navigate('/resume/create')}>Create Resume</button>
            </div>
        )
    }
    return(
        <div className="resume-wrap">
            <div className="resume-header">
                <div className="resume-header-left">
                    <h1 className="resume-name">{data.data.user.name}</h1>
                    <h2 className="resume-title">{data.data.title}</h2>
                    {data.data.linkedin && <a className="resume-linkedin" href={data.data.linkedin} target="_blank" rel="noreferrer">{data.data.linkedin}</a>}
                </div>
                <div className="resume-header-right">
                    <span className={`resume-visibility ${data.data.visibility?'resume-visibility-public':'resume-visibility-private'}`}>
                        {data.data.visibility?'Public':'Private'}
                    </span>
                    <div className="resume-header-buttons">
                        <button className="resume-edit-btn" onClick={()=>navigate('/resume/edit')}>Edit Resume</button>
                        <button className="resume-export-btn" onClick={()=>navigate('/resume/export')}>Export PDF</button>
                        <button className="resume-delete-btn" onClick={()=>{
                            if(confirm('Are you sure you want to delete resume?')){
                                deleteMutation.mutate()
                            }
                        }}>Delete Resume</button>
                    </div>
                </div>
            </div>
            <section className="resume-section">
                <h3 className="resume-section-title">Summary</h3>
                <p className="resume-summary">{data.data.summary}</p>
            </section>
            <section className="resume-section">
                <h3 className="resume-section-title">Skills</h3>
                <div className="resume-skills">
                    {data.data.skills.map((skill,index)=>(
                        <span key={index} className="resume-skill-tag">{skill}</span>
                    ))}
                </div>
            </section>
            {data.data.experience.length>0&&(
                <section className="resume-section">
                    <h3 className="resume-section-title">Experience</h3>
                    {data.data.experience.map(item=>(
                        <div key={item.id} className="resume-card">
                            <div className="resume-card-header">
                                <div>
                                    <h4 className="resume-card-title">{item.company}</h4>
                                    <p className="resume-card-subtitle">{item.role}</p>
                                </div>
                                <span className="resume-card-date">{new Date(item.startDate).toLocaleDateString()} — {item.endDate?new Date(item.endDate).toLocaleDateString():'Present'}</span>
                            </div>
                        </div>
                    ))}
                </section>
            )}
            {data.data.education.length>0&&(
                <section className="resume-section">
                    <h3 className="resume-section-title">Education</h3>
                    {data.data.education.map(item=>(
                        <div key={item.id} className="resume-card">
                            <div className="resume-card-header">
                                <div>
                                    <h4 className="resume-card-title">{item.institution}</h4>
                                    {item.degree&&<p className="resume-card-subtitle">{item.degree}</p>}
                                </div>
                                <span className="resume-card-date">{new Date(item.startDate).toLocaleDateString()} — {item.endDate?new Date(item.endDate).toLocaleDateString():'Present'}</span>
                            </div>
                        </div>
                    ))}
                </section>
            )}
            {data.data.projects.length>0&&(
                <section className="resume-section">
                    <h3 className="resume-section-title">Projects</h3>
                    {data.data.projects.map(item=>(
                        <div key={item.id} className="resume-card">
                            <h4 className="resume-card-title">{item.name}</h4>
                            <p className="resume-card-body">{item.description}</p>
                            <div className="resume-card-links">
                                {item.deployedLink&&<a href={item.deployedLink} target="_blank" rel="noreferrer" className="resume-card-link">Live</a>}
                                {item.sourceCode&&<a href={item.sourceCode} target="_blank" rel="noreferrer" className="resume-card-link">Source</a>}
                            </div>
                        </div>
                    ))}
                </section>
            )}
            {data.data.achievements.length>0&&(
                <section className="resume-section">
                    <h3 className="resume-section-title">Achievements</h3>
                    {data.data.achievements.map(item=>(
                        <div key={item.id} className="resume-card">
                            <h4 className="resume-card-title">{item.name}</h4>
                            <p className="resume-card-body">{item.description}</p>
                        </div>
                    ))}
                </section>
            )}
        </div>
    )
}