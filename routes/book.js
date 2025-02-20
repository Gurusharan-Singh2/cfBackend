import  express from 'express';
import { GetBook, RecentBooks, ShowBooks } from '../controllers/book.js';
const Bookrouter=express.Router();



Bookrouter.get("/get-all-books",ShowBooks);
Bookrouter.get("/get-recent-books",RecentBooks);
Bookrouter.get("/get-book/:id",GetBook);

export default Bookrouter