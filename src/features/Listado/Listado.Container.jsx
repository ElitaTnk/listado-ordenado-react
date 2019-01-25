import React, { Component } from 'react';
import logo from '../../logo.svg';
import './Listado.css';

class ListadoContainer extends Component {
  constructor(){
    super();
    this.state = {
      listado: [],
      active: 'id',
      loading: true,
    };
  }

  componentDidMount() {
    this.init();
  }

  request = async (endpoint) => {
    let response = await fetch(`https://my-json-server.typicode.com/ElitaTnk/ListadoOrdenado/${endpoint}`);

    let data = await response.json()
    return data;
  }

  checkYAgregar(persona, arr) {
    const found = arr.some(function(el) {
      return el.nombre === persona.nombre && el.apellido === persona.apellido;
    });
    if (!found) {
      arr.push({ ...persona
      });
    }
  }

  async limpiarLista() {
    const a = await this.request('listPersonaA');
    const b = await this.request('listPersonaB');
    const lista = [...a, ...b];
    let finalLista = [];

    lista.forEach((element, index) => {
      this.checkYAgregar(element, finalLista)
    });
    // console.log('lista', JSON.stringify(finalLista))
    return finalLista;
  }

  async armarListado(personas) {
     let armarListadoMap = await Promise.all(personas.map(async (persona) => {
      const direccion = await this.buscarDireccion(persona);
      const codigoPostal = await this.buscarCP(direccion);

      direccion.codigoPostal = codigoPostal ? codigoPostal.codigoPostal : null;

      direccion.calleAltura = direccion.calle + direccion.altura;
      delete direccion.calle;
      delete direccion.altura;
      delete direccion.personaId;

      persona.direccion = direccion;

      return persona;
    }));

    return armarListadoMap;
  }

  ordenarPersonas(personas, sortingProperty = "id") {
   return personas.sort( (obj1, obj2) => {
      const valueA =  obj1[sortingProperty];
      const valueB =  obj2[sortingProperty];

  		return (valueA < valueB) ? -1 : (valueA > valueB) ? 1 : 0;
    });
  }

  async buscarDireccion(persona) {
    const c = await this.request('listaDireccionC');
    const personInC = c.find(p => p.personaId == persona.id);
    let personInD = null;

    if (!personInC) {
      const d = await this.request('listaDireccionD');
      personInD = d.find(p => p.personaId == persona.id);
    }

    return personInC || personInD || this.F;
  }

  async buscarCP(direccion) {
    const e = await this.request('listaCP');
    return e.find(dir => {
      return dir.calle === direccion.calle && dir.ciudad === direccion.ciudad && dir.provincia === direccion.provincia;
    });
  }

  async generarListado() {
    const personas = await this.limpiarLista();
    const personasConDireccion = await this.armarListado(personas);

  	return personasConDireccion;
  }

  async init() {
    const listado = await this.generarListado();

    Promise.all(listado).then((data) => {
      this.setState({ listado, loading: false });
      console.log(JSON.stringify(listado));
    });
  }

   F = {
    "calle": "Calle Falsa",
    "altura": "123",
    "ciudad": "Azul",
    "provincia": "Buenos Aires",
    "pais": "Argentina",
  };

  onClick = event => {
    this.setState({ active: event.target.value })
    this.setState({listado: this.ordenarPersonas(this.state.listado, event.target.value)});
  };

  buttons = [
    {name: 'apellido'},
    {name: 'nombre'},
    {name: 'id'}
  ]

  renderButtons() {
    return this.buttons.map((button, index) => {
      return (<button
               type="button"
               className={this.state.active === button.name ? 'active' : ''}
               value={button.name}
               onClick={this.onClick}
               key={ button.name }>
               {`Ordenar por ${button.name}`}
               </button>);
     })
  }

  renderList() {
    return this.state.listado.map((persona, key) => {
      return (
        <li key={key} className="main__listado__item">
          <h5><small>{persona.id}</small>{persona.nombre +' '+ persona.apellido}</h5>
          <ul className="main__listado__item__details">
            <li><span>CalleAltura: </span>{persona.direccion.calleAltura}</li>
            <li><span>Ciudad: </span>{persona.direccion.ciudad}</li>
            <li><span>Provincia: </span>{persona.direccion.provincia}</li>
            <li><span>CodigoPostal: </span>{persona.direccion.codigoPostal}</li>
            <li><span>Pais: </span>{persona.direccion.pais}</li>
          </ul>
        </li>
      );
    });
  }

  render(){

    if(this.state.loading) {
      return <div className="main__loading"><img src={logo} alt="loading"/></div>;
    }

    return (
      <div className="main">
        <div className="main__buttons-container">
          {this.renderButtons()}
        </div>
        <ul className="main__listado">
          { this.renderList()}
        </ul>
      </div>
    );
  }
};

export default ListadoContainer;
