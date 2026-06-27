import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import Root from './pages/Root'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import Resume from './pages/Resume'
import CreateResume from './pages/CreateResume'
import EditResume from './pages/EditResume'
import ExportResume from './pages/ExportResume'
import Profile from './pages/Profile'
import Resumes from './pages/Resumes'
import EachResume from './pages/EachResume'

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Root/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/resume' element={
          <ProtectedRoute role='candidate'>
            <Resume/>
          </ProtectedRoute>
        }/>
        <Route path='/resume/create' element={
          <ProtectedRoute role='candidate'>
            <CreateResume/>
          </ProtectedRoute>
        }/>
        <Route path='/resume/edit' element={
          <ProtectedRoute role='candidate'>
            <EditResume/>
          </ProtectedRoute>
        }/>
        <Route path='/resume/export' element={
          <ProtectedRoute role='candidate'>
            <ExportResume/>
          </ProtectedRoute>
        }/>
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile/>
          </ProtectedRoute>
        }/>
        <Route path='/resumes' element={
          <ProtectedRoute role='recruiter'>
            <Resumes/>
          </ProtectedRoute>
        }/>
        <Route path='/resumes/:userId' element={
          <ProtectedRoute role='recruiter'>
            <EachResume/>
          </ProtectedRoute>
        }/>
        <Route path='*' element={<Navigate to='/'/>}/>
      </Routes>
    </BrowserRouter>
  )
}