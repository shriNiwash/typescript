import express,{Request,Response} from 'express';
const app = express();
const PORT = 3000;
import connects from './model/db';
import userModel from './model/schema';
import router from './router/router';



app.get('/',(req:Request,res:Response):void=>{
    res.send('Welcome to the homepage');

})

app.get('/list',(req:Request,res:Response):void=>{
    res.json({data:"hello this is me "});
})

app.get('/data',(req:Request,res:Response):void=>{
    const ob = {
        x:12,
        y:23,
    }
    const karan = sumData(ob);
    res.json({
        name:"this is addition",
        data:karan,
    })

})

app.use(router);

connects();

interface matchIt{
    x:number,
    y:number,
}

const sumData = (ob:matchIt)=>{
    return ob.x+ob.y;
}


app.get('/insert',async(req:Request,res:Response)=>{
    try{
        const data = new userModel({
            name:'shriniwash',
            address:'birgunj'
        });
        await data.save();
        console.log(data);

    }
    catch(err){
        console.warn(err);

    }


})

app.get('/datas',async(req:Request,res:Response)=>{
    try{
        const dat = await userModel.find();
        res.json(dat);
        console.log(dat);
    }
    catch(err){
        console.log(err);
    }
})
app.listen(PORT,():void=>console.log(`the server is running on the port ${PORT}`));