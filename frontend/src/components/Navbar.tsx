import './Navbar.css'
import { NavLink,useNavigate } from 'react-router-dom'
import {postLogout} from '../utils/api'
import {useMutation,useQueryClient} from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function Navbar({ userData }: {
    userData: {
        id: number,
        role: 'recruiter' | 'candidate',
        name: string,
        profileUrl: string
    }
}) {
    const queryClient=useQueryClient()
    const navigate=useNavigate()
    const mutation=useMutation({
        mutationFn:postLogout,
        onSuccess:()=>{
            queryClient.resetQueries({queryKey:['me']})
            toast.success("Logged out successfully")
            navigate('/login')
        }
    })
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="navbar-brand-icon">📄</span>
                <span className="navbar-brand-name">ResumeHub</span>
            </div>
            <div className="navbar-links">
                {userData.role === 'candidate'
                    ? <NavLink to="/resume" className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`}>My Resume</NavLink>
                    : <NavLink to="/resumes" className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`}>Browse Resumes</NavLink>
                }
                <NavLink to="/profile" className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`}>Profile</NavLink>
            </div>
            <div className="navbar-user">
                <img src={userData.profileUrl} alt={userData.name} className="navbar-avatar" />
                <span className="navbar-username">{userData.name}</span>
                <button className="navbar-logout-btn" onClick={() => {
                    mutation.mutate()
                }}>Logout</button>
            </div>
        </nav>
    )
}