import bodyParser from "body-parser";
import express,{Request,Response} from "express";
import { appendFile } from "fs";
const router = express.Router();
import connects from "../model/db";
import BookModel from "../model/schema";

//middle ware bodyparser
router.use(bodyParser.json());
router.use(express.urlencoded({extended:false}));


//database connectivity function
connects();

//get request
router.get('/books/list',async(req:Request,res:Response)=>{
    try{
        const data = await BookModel.find();
        res.json(data);
        console.log('responsing there');
    }
    catch(err){
        console.warn(err);
    }

})

//post request
router.post('/books',async(req:Request,res:Response)=>{
    try{
        const data = new BookModel(req.body);
        console.log(data);
        await data.save();
        res.json(data);

    }
    catch(err){
        console.warn(err);
    }
})

//get by id
router.get('/books/list/:id',async(req:Request,res:Response)=>{
    try{
        const data = await BookModel.findById(req.params.id);
        res.json(data);
        console.log(data);
    }
    catch(err:any){
        console.warn(err);
    }
})

//total-sales
router.get('/total-sales',async(req:Request,res:Response)=>{
    try{
        const data=await BookModel.aggregate([
            {$group:{_id:"",Total:{$sum:'$sold'}}},
            // {$project:{_id:"",Total:1, id}}
        ]);
        res.json(data);
        console.log(data);
    }
    catch(err:any){
        console.log(err);
    }



})

//patch request
router.patch('/books/list/:id',async(req:Request,res:Response)=>{
    try{
        const data = await BookModel.findByIdAndUpdate(req.params.id,req.body);
        res.json(data);
        console.warn('this is updated',data);
    }
    catch(err:any){
        console.log(err);
    }

})


//delete operation
router.delete('/books/list/:id',async(req:Request,res:Response)=>{
    try{
        const data =await BookModel.findByIdAndDelete(req.params.id);
        res.json(data);
        console.log('this data is deleted',data);

    }
    catch(err:any){
        console.log(err);
    }
})




export default router;
