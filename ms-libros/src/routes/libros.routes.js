// CAPA DE PRESENTACIÓN: rutas de libros
const { Router } = require('express');
const controller = require('../controllers/libros.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                      // todas las rutas exigen token

router.get('/', controller.listar);             // cualquier rol autenticado
router.get('/:id', controller.obtener);
router.post('/', requiereRol('administrador', 'bibliotecario'), controller.crear);
router.put('/:id', requiereRol('administrador', 'bibliotecario'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'bibliotecario'), controller.eliminar);

module.exports = router;

