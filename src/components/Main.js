require('normalize.css/normalize.css');
require('./Main.scss');

import React from 'react';
import { AuthorList } from './Author';
import Footer from './Footer';

// let yeomanImage = require('../images/yeoman.png');

class AppComponent extends React.Component {
  render() {
    const names = [
      'Pierre Bourdieu',
      'Marc Bloch',
      'Alfred Sauvy',
      'Pierre Lévêque'
    ];
    return (
      <div className="index">
        <AuthorList authorNames={ names }/>
        <Footer>
          Une création de l'agence <a href="http://skoli.fr">Skoli</a>. Son code est disponible sur <a href="#" target="_blank" rel="nofollow">GitHub</a>
        </Footer>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
