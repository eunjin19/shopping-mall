// App.js
import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Admin
import AdminProductPage from './pages/admin/AdminProductPage';

// Context 생성
export const UserContext = createContext(null);

// AdminRoute 컴포넌트
const AdminRoute = ({ user, children }) => {
  // if (!user || user.role !== "admin") {
  //   alert("관리자만 접근할 수 있습니다.");
  //   return <Navigate to="/" replace />;
  // }
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  // localStorage에서 user 정보 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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

              {/* 관리자 페이지 보호 */}
              <Route
                path="/admin/products"
                element={
                  <AdminRoute user={user}>
                    <AdminProductPage />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
