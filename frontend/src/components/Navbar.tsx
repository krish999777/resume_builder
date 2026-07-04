import './Navbar.css'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { postLogout } from '../utils/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function Navbar({ userData }: {
    userData: {
        id: number,
        role: 'recruiter' | 'candidate',
        name: string,
        profileUrl: string
    }
}) {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const mutation = useMutation({
        mutationFn: postLogout,
        onSuccess: () => {
            queryClient.resetQueries({ queryKey: ['me'] })
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
            <button 
                className="navbar-toggle" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation menu"
            >
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            </button>
            <div className={`navbar-menu ${isMenuOpen ? 'navbar-menu-open' : ''}`}>
                <div className="navbar-links">
                    {userData.role === 'candidate'
                        ? <NavLink to="/resume" className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`} onClick={() => setIsMenuOpen(false)}>My Resume</NavLink>
                        : <NavLink to="/resumes" className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`} onClick={() => setIsMenuOpen(false)}>Browse Resumes</NavLink>
                    }
                    <NavLink to="/profile" className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`} onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
                    <NavLink to="/messages" className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`} onClick={() => setIsMenuOpen(false)}>Messages</NavLink>
                </div>
                <div className="navbar-user">
                    <img src={userData.profileUrl} alt={userData.name} className="navbar-avatar" />
                    <span className="navbar-username">{userData.name}</span>
                    <button className="navbar-logout-btn" onClick={() => {
                        setIsMenuOpen(false)
                        mutation.mutate()
                    }}>Logout</button>
                </div>
            </div>
        </nav>
    )
}