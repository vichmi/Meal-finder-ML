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
import Profile from './pages/Profile.tsx'
import { useContext } from 'react';
import { UserContext, UserProvider } from './contexts/UserContext.tsx';
import { ProtectedRoute } from './pages/ProtectedRoute.tsx'
import CreateRecipe from './pages/CreateRecipe.tsx'
import CreateRecipeButton from './components/CreateRecipeButton.tsx'
import Bookmarks from './pages/Bookmarks.tsx'
import ShoppingList from './pages/ShoppingList.tsx'

function RedirectTo404() {
  useEffect(() => {
    window.location.pathname = '/404';
  }, []);
  return null;
}
function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <NavbarPrimary />
        <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />
            <Route path='/search' element={<Search />} />
            <Route path='/recipe/:id' element={<Recipe />} />
            <Route path='/fridge' element={
                <ProtectedRoute>  
                  <Fridge />
                </ProtectedRoute>
            } />
            <Route
              path='/profile'
              element={
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path='/createRecipe'
              element={
                <ProtectedRoute>
                    <CreateRecipe />
                </ProtectedRoute>
              }
            />
            <Route
              path='/bookmarks'
              element={
                <ProtectedRoute>
                    <Bookmarks />
                </ProtectedRoute>
              }
            />
            <Route
              path='/shoppingList'
              element={
                <ProtectedRoute>
                    <ShoppingList />
                </ProtectedRoute>
              }
            />
            <Route path='/404' element={<NotFound />} />
            <Route path='*' element={<RedirectTo404 />} />
          </Routes>
        </div>
      <CreateRecipeButton />
      <Footer />
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
