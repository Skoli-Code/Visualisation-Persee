require('normalize.css/normalize.css');
require('./Main.scss');

import React from 'react';
import Author from './Author';

// let yeomanImage = require('../images/yeoman.png');

class AppComponent extends React.Component {
  render() {
    return (
      <div className="index">
        <Author authorName={'Pierre Bourdieu'}/>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
