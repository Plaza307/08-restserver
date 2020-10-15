const express = require('express');
const fileUpload = require('../lib/index');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

//default options
app.use(fileUpload());


app.put('/upload/:tipo/:id', function(req, res) {




    if (!req.files)
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo para subir'
                }
            });


    //valida tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos son' + tiposValidos.join(', ')
            }
        });
    } //fin if




    let archivo = req.files.archivo;
    let nombreArchivo = archivo.name.split('.'); //busco el . para separarlo el nombre de la extension
    let extension = nombreArchivo[nombreArchivo.length - 1];

    console.log(nombreArchivo);


    //extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // con el " < 0" busca en el array y si no encuentra(es menor que 0), salta error
    if (extensionesValidas.indexOf(extension) < 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones poermitidas son' + extensionesValidas.join(', '),
                ext: extension //esta es la extension que recibimos
            }
        });
    } //fin if


    //cambiar nombre al archivo(que sea unico)
    //lo de fecha es para hacer unica la imagen, para prevenir problema por caché. 783468743uso-234.jpg
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds}.${ extension}`;

    archivo.mv(`uploads/${ tipo }/${ archivo.name }`, (err) => {

        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        if (tipo === 'usuario') {
            //Aqui tenemos la imagen del usuario ya cargada
            imagenUsuario(id, res, nombreArchivo);

        } else {
            //Aqui tenemos la imagen del producto ya cargada
            imagenProducto(id, res, nombreArchivo);

        }





        // res.json({
        //     ok: true,
        //     message: 'La imagen ha sido subida correctamente'
        // });
    });
});


function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }


        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });
}


function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }


        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                prodcuto: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}



function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/ ${usuarioDB.img}`);

    //Validamos si existe el path de la imagen, si existe se borra
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;