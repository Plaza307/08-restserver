const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');


let app = express();
let Producto = require('../models/producto');


//Obtener productos
app.get('/productos', (req, res) => {
    //trae todos los productos
    //populate: usuario categoria
    //paginado


    let desde = req.query.desde || 0;
    desde = Number(desde); //Sintaxis para transformar a número

    Usuario.find({ disponible: true }, verificaToken)
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            } //fin if

            res.json({
                ok: true,
                productos
            });
        });
});



//Obtener producto por id
app.get('/productos/:id', verificaToken, (req, res) => {
    //populate: usuario categoria

    let id = req.body.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            } //fin if


            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El id no existe en la base de datos'
                    }
                });
            } //fin if

            res.json({
                ok: true,
                producto: productoDB
            });
        })

});


//Buscar productos
app.get('/productos/buscar/:expresion', verificaToken, (req, res) => {

    let expresion = req.params.expresion;

    //la expresion regular es para que al buscar, no busque por la expresion exacta
    //Ej: tengo ensaladas en bd, si buscase por la expresion, me buscaría el producto exacto, si falta algo, error
    //Con la expresion regular, me ''autocompletaria'' y me mostrará todas las ensaladas
    let expresionRegular = new expresionRegular(expresion, 'i');

    //En el find, se podría meter más condiciones, como disponible, para mostrar los productos disponibles
    Producto.find({ nombre: expresionRegular })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {


            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        })
})


//Crear un nuevo producto
app.post('/productos/', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, producto) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.status(201).json({
            ok: true,
            producto: productoDB

        });
    });

});


//Actualizar un nuevo producto
app.put('/productos/:id', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado

    let id = req.params.id;
    let body = req.body;


    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        } //fin if

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'el id no existe'
                }
            });
        } //fin if

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;


        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            } //fin if

            res.json({
                ok: true,
                producto: productoGuardado,
                message: 'El producto se ha actualizado correctamente'
            })
        })
    });

});


//Borrar un producto
app.delete('/productos/:id', verificaToken, (req, res) => {
    //Cambiar disponible a false, esto hara un borrado lógico


    let id = req.params.id;


    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        } //fin if

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'el id no existe'
                }
            });
        } //fin if

        productoDB.disponible = false;
        productoDB.save((err, productoBorrado) => {
            //if no necesario
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            } //fin if

            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado (logicamente) de la base de datos'
            });

        });

    });
});


module.exports = app;