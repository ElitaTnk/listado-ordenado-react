import React, { Component } from 'react';
import './App.css';

import ListadoContainer from './features/Listado/Listado.Container';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App__header">
          Obtener Listado De Personas
        </header>
        <ListadoContainer />
      </div>
    );
  }
}

export default App;
