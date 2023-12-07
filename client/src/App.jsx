import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react';
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
import JournalList from './components/JournalList';
import Graph from './components/Graph';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Welcome from './components/Welcome'
import Authentication from './components/Authentication';

function App() {
  const location = useLocation();

  return (
    <>
    <PrimeReactProvider>
      <Authentication path={location.pathname}/>
      <Header/>
      <Routes>
        <Route path='/' element={<Welcome />}></Route>
        <Route path='signin' element={<Signin />}></Route>
        <Route path='signup' element={<Signup />}></Route>
        <Route path='home' element={<Home />}></Route>
        <Route path='journalList' element={<JournalList />}></Route>
        <Route path='journal/:journalId' element={<Journal />}></Route>
        <Route path='newJournal/:newJournalDate' element={<CreateJournal />}></Route>
        <Route path='graph' element={<Graph />}></Route>
        <Route path='dashboard' element={<Dashboard />}></Route>
        <Route path='profile' element={<Profile />}></Route>
      </Routes>
    </PrimeReactProvider>
    </>
  );
}

export default App;
