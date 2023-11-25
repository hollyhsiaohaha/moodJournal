import { Routes, Route } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './App.css';
import Header from './components/Header';
import CreateJournal from './components/CreateJournal'
import Signin from './components/Signin';
import Signup from './components/Signup';
import Home from './components/Home';
import Journal from './components/Journal';
import Graph from './components/Graph';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Welcome from './components/Welcome'

function App() {
  return (
    <>
    <PrimeReactProvider>
      <Header/>
      <Routes>
        <Route path='/' element={<Welcome />}></Route>
        <Route path='newJournal' element={<CreateJournal />}></Route>
        <Route path='signin' element={<Signin />}></Route>
        <Route path='signup' element={<Signup />}></Route>
        <Route path='home' element={<Home />}></Route>
        <Route path='journal' element={<Journal />}></Route>
        <Route path='graph' element={<Graph />}></Route>
        <Route path='dashboard' element={<Dashboard />}></Route>
        <Route path='profile' element={<Profile />}></Route>
      </Routes>
    </PrimeReactProvider>
    </>
  );
}

export default App;
