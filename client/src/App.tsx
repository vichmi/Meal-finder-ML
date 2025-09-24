import Home from './pages/Home.tsx'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Recipe from './pages/Recipe'
import Fridge from './pages/Fridge'
import NotFound from './pages/NotFound'
import { BrowserRouter, Routes, Route } from 'react-router';
import { useEffect } from 'react';
import NavbarPrimary from './components/NavbarPrimary'
import Footer from './components/Footer'
import Search from './pages/Search.tsx'

function RedirectTo404() {
  useEffect(() => {
    // client-side redirect to /404
    window.location.pathname = '/404';
  }, []);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <NavbarPrimary />
      <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/search' element={<Search />} />
          <Route path='/recipe/:id' element={<Recipe />} />
          <Route path='/fridge' element={<Fridge />} />
          <Route path='/404' element={<NotFound />} />
          <Route path='*' element={<RedirectTo404 />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}

export default App
