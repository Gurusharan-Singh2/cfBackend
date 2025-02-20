import express from 'express';
import auth from '../middlewares/UserAuth.js';
import { AddFavrioute, DeleteFavrioute, GetFavrioute } from '../controllers/favrioute.js';


const FavriouteRouter=express.Router();

// add book to favrioute
FavriouteRouter.put("/add-book-to-favrioute",auth,AddFavrioute)
FavriouteRouter.delete("/delete-book-to-favrioute",auth,DeleteFavrioute)
FavriouteRouter.get("/get-favrioute-books",auth,GetFavrioute)



export default FavriouteRouter