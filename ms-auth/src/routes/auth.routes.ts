import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateFirebaseToken } from '../middlewares/auth.middleware'; // Importamos nuestro guardia Enterprise

const router = Router();

// ==========================================
// 🔓 RUTAS PÚBLICAS (No requieren token previo)
// ==========================================

// Ruta para el registro rápido de ciudadanos en medio de una emergencia
router.post('/register-guest', AuthController.registerGuest);

// Ruta para crear una cuenta completa (El frontend nos envía el token recién creado)
router.post('/register', AuthController.registerFull);


// ==========================================
// 🔒 RUTAS PROTEGIDAS (Requieren Token de Firebase válido)
// ==========================================

// El Login ahora valida el token de Firebase automáticamente gracias al middleware.
// Si el token es falso o expiró, el middleware rebota la petición antes de llegar al controlador.
router.post('/login', validateFirebaseToken, AuthController.login);

// NUEVO: Ruta estándar Enterprise para obtener el perfil del usuario activo.
// La dejamos comentada para implementarla en el futuro, pero la ruta ya queda diseñada.
// router.get('/me', validateFirebaseToken, AuthController.getProfile);

export default router;