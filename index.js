'use strict'

var mongoose = require ('mongoose');
var app = require('./app');
var port = 3900;

//configuracion ciertos parametros de mongoose
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

//conexion de mongoose
mongoose.connect('mongodb://localhost:27017/api_rest_blog', { useNewUrlParser: true }).then(() => {
    console.log('la conexion a la bd se ha realizado correctamente');

    // Crear servidor y poder escuchar peticiones http

    app.listen(port, () => {
        console.log('Servidor corriendo en http://localhost:' + port);
    });
});

