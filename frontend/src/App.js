import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import MyPage from './pages/MyPage';
import AuthPage from './pages/AuthPage';

//admin
import AdminProductPage from './pages/admin/AdminProductPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin/products" element={<AdminProductPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;