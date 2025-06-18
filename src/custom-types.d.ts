import { Request } from "express";



export interface AuthUser {
    id: number;
    name: string;
    phone: string;

}


// declare namespace Express {
//     export interface Request {
//         user?: AuthUser;
//     }
// }


declare module "express-serve-static-core" {
    interface Request {
        user?: AuthUser;
    }
}