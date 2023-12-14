import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormBuilder from './FormBuilder';
import AddForm from './AddForm';


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
        
          <Route exact path='/2' element={<FormBuilder />} />
         <Route exact path='/3' element={<AddForm />} />
        </Routes>
      </Router>
      <ToastContainer />
    </div>
  );
};

export default App;
