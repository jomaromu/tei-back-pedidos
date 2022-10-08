import { NextFunction, Request, Response } from 'express';
import { CallbackError } from 'mongoose';
import jwt from 'jsonwebtoken';

// Globales
import { environment } from '../environment/environment';

const verificaToken = (req: any, resp: Response, next: NextFunction) => {

    const token = req.get('token') || '';

    // Comprobación del token
    jwt.verify(token, environment.SEED, (err: any, decoded: any) => {

        if (err) {
            return resp.json({
                ok: false,
                mensaje: `Token incorrecto`,
                err
            });
        }

        // Insertar en el Request el usuario
        req.usuario = decoded.usuario;
        next();
    });
}

export {
    verificaToken
}