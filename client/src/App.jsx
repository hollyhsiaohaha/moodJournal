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

function App() {
  return (
    <>
    <PrimeReactProvider>
      <Header/>
      <Routes>
        <Route path='/' element={<p>login first</p>}></Route>
        <Route path='newJournal' element={<CreateJournal />}></Route>
        <Route path='signin' element={<Signin />}></Route>
        <Route path='signup' element={<Signup />}></Route>
      </Routes>
    </PrimeReactProvider>
    </>
  );
}

export default App;
