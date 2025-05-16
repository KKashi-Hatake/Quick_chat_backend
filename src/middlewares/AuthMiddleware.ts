import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { AuthUser } from '../custom-types';


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === null || authHeader === undefined) {
        return res.status(401).json({
            status: 401, message: "UnAuthorized"
        })
    }
    const token = authHeader?.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY!, (error, user) => {
        if (error) {
            console.log(error)
            return res.status(401).json({
                status: 401,
                message: "UnAuthorized"
            })
        }
        req.user = user as AuthUser
        next();
    })
}


export default authMiddleware;