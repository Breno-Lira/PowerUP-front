import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Perfil } from './pages/Perfil';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Treinos } from './pages/Treinos';
import { Nutricao } from './pages/Nutricao';
import { Feedback } from './pages/Feedback';
import { Loja } from './pages/Loja';
import { Ranking } from './pages/Ranking';
import { Social } from './pages/Social';
import { Grupo } from './pages/Grupo';
import { Equipe } from './pages/Equipe';
import { ArenaDuelos } from './pages/ArenaDuelos';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('user');
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          }
        />
        <Route
          path="/treinos"
          element={
            <PrivateRoute>
              <Treinos />
            </PrivateRoute>
          }
        />
        <Route
          path="/nutricao"
          element={
            <PrivateRoute>
              <Nutricao />
            </PrivateRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          }
        />
        <Route
          path="/loja"
          element={
            <PrivateRoute>
              <Loja />
            </PrivateRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <PrivateRoute>
              <Ranking />
            </PrivateRoute>
          }
        />
        <Route
          path="/social"
          element={
            <PrivateRoute>
              <Social />
            </PrivateRoute>
          }
        />
        <Route
          path="/grupo/:id"
          element={
            <PrivateRoute>
              <Grupo />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipe/:id"
          element={
            <PrivateRoute>
              <Equipe />
            </PrivateRoute>
          }
        />
        <Route
          path="/arena-duelos"
          element={
            <PrivateRoute>
              <ArenaDuelos />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
