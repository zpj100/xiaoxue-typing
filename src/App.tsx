import { HashRouter, Route, Routes } from 'react-router-dom'
import Navigation from './components/Navbar'
import AboutPage from './pages/AboutPage'
import Home from './pages/Home'
import PlayPage from './pages/PlayPage'
import ProgressPage from './pages/ProgressPage'
import SubjectPage from './pages/SubjectPage'

export default function App() {
  return (
    <HashRouter>
      <a className="skip-link" href="#main">
        跳到正文
      </a>
      <Navigation />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chinese" element={<SubjectPage subject="chinese" />} />
          <Route path="/english" element={<SubjectPage subject="english" />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/play/:lessonId/:mode" element={<PlayPage />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
