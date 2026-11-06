// CAPA DE PRESENTACIÓN: rutas de prestamos
const { Router } = require('express');
const controller = require('../controllers/prestamos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                      // todas las rutas exigen token

router.get('/', requiereRol('administrador', 'bibliotecario'), controller.listar);
router.get('/:id', requiereRol('administrador', 'bibliotecario'), controller.obtener);
router.post('/', requiereRol('bibliotecario'), controller.crear);
router.put('/:id', requiereRol('bibliotecario'),controller.actualizar);
router.delete('/:id', requiereRol('bibliotecario'), controller.eliminar);

module.exports = router;


