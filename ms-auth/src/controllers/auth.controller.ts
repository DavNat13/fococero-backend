import { Request, Response } from 'express';

export class AuthController {
    
    // Método para iniciar sesión
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            
            // TODO: Aquí luego buscaremos en la base de datos
            if (!email || !password) {
                res.status(400).json({ error: 'Faltan credenciales' });
                return;
            }

            res.status(200).json({ 
                mensaje: 'Login exitoso',
                token: 'aqui_ira_un_token_jwt_real' 
            });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Método para registrar usuario
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { nombre, email, password } = req.body;
            
            // TODO: Aquí luego insertaremos en PostgreSQL
            res.status(201).json({ 
                mensaje: 'Usuario creado exitosamente',
                usuario: { nombre, email } 
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    }
}