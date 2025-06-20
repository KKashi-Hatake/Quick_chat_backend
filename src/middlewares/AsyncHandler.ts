import { Request, Response, NextFunction } from 'express';


// Generic async handler wrapper
const AsyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error('Caught error in AsyncHandler wrapper:', error);
      res?.status?.(500).json?.({ error: 'Internal Server Error' });
    }
  };
};


export default AsyncHandler;