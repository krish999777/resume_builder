import './Navbar.css'
import { NavLink } from 'react-router-dom'

export default function Navbar({ userData }: {
    userData: {
        id: number,
        role: 'recruiter' | 'candidate',
        name: string,
        profileUrl: string
    }
}) {
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
                <button className="navbar-logout-btn" onClick={() => {}}>Logout</button>
            </div>
        </nav>
    )
}