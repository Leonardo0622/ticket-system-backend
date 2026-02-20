import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";


type ValidationSource = "body" | "params" | "query";

export function Validate(Schema: ZodSchema, source: ValidationSource = "body"){
    return (req: Request, res: Response, next: NextFunction)=>{

        try {
            
            Schema.parse(req[source]);
            next();

        } catch (error: any) {
            return res.status(400).json({
                message: "Validation erros", errors: error.errors
                
            });

        }

    }
}

