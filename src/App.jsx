import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/home';
import AllProducts from './pages/allProducts';
import AllOrders from './pages/allOrders';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/all-products' element={<AllProducts/>}/>
          <Route path='/allorders' element={<AllOrders/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
