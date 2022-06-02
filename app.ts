import express,{application, Request,Response} from 'express';
const app = express();
const PORT = 3000;
import connects from './model/db';
import router from './router/router';
import bodyParser, { json } from "body-parser";
import path from 'path';
import BookModel from './model/schema';
import UserModel from './model/userSchema';
import multer from 'multer';
import passport from 'passport';
import Local from 'passport-local';
const LocalStrategy = Local.Strategy;
import session from 'express-session';
import { KeyObjectType } from 'crypto';
import fetch  from 'node-fetch';



//body parser middleware
app.use(bodyParser.json());
app.use(express.urlencoded({extended:false}));
var urlencodedParser = bodyParser.urlencoded({extended: false});

//initializing session
app.use(session({
	secret: "verygoodsecret",
	resave: false,
	saveUninitialized: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());



//path declaration
const sataticPath = path.join('__dirname',"../public/");
app.use(express.static(sataticPath));

//view engine configuration
app.set('view engine','hbs');
app.set('views','./views')


//file upload with multer module
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/images');
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
});
var upload = multer({storage:storage});


app.get('/',(req:Request,res:Response):void=>{
    res.render('home');
    console.log('we are on home page');

})

app.get('/login',(req:Request,res:Response):void=>{
    res.render('login');
    console.warn('we are on login page');
})

app.get('/insert',isAuthenticate,(req:Request,res:Response):void=>{
    res.render('insert');
    console.log('Client is on insertion page');
})

app.get('/list',isAuthenticate,async(req:Request,res:Response)=>{
    try{
        const data = await BookModel.find();
        res.render('datalist',{list:data});
    }
    catch(err:any){
        console.log(err);
    }
})
//search option
app.get('/search',isAuthenticate,(req:Request,res:Response):void=>{
    res.render('search');
})

app.post('/search',urlencodedParser,async(req:Request,res:Response)=>{
    var name = req.body.search;
    console.log(name);
    const api_url = `https://www.googleapis.com/books/v1/volumes?q=${name}&key=AIzaSyCBguij5N4XLeQ_RHE_pTGlLyTWfbVTcyU`;
    const fetch_response = await fetch(api_url);
    const json = await  fetch_response.json();
    const datas = json.items;
    res.render('search',{data:datas});
})

app.post('/insert',upload.single('blogimage'),async(req:Request,res:Response)=>{
    var name = req.body.name;
    var sold = req.body.sold;
    var image = req.file?.filename;
    console.log(name,image,sold);
    try{
        const data = new BookModel({
            name: `${name}`,
            sold: sold,
            image: `${image}`
        });
        await data.save();
        console.log('data inserted',data);
        res.redirect('/list');
    }
    catch(err:any){
        console.log(err);
    }

})

app.get('/list/edit/:id',isAuthenticate,async(req:Request,res:Response)=>{
    try{
        const data =await  BookModel.findById(req.params.id);
        console.log(data);
        res.render('update',{
            dataList:data,
            ide:req.params.id,
        })
    }
    catch(err:any){
        console.log(err);
    }

})

app.post('/list/edit/:id',upload.single('blogimage'),async(req:Request,res:Response)=>{
    const data  = await BookModel.findById(req.params.id);
    const imag = data?.image;
    try{
        const result = await BookModel.findByIdAndUpdate(req.params.id,{
            name:req.body.name,
            sold:req.body.sold,
            image:(req.file==null) ? imag : req.file.filename
        });
        res.redirect('/list');
    }
    catch(err:any){
        console.log(err);
    }
})

//local streightegy
passport.use(new LocalStrategy(
    function(username, password, done) {
      UserModel.findOne({ name: username }, function (err:any, user:any) {
        if (err) { return done(err) }
        if (!user) { return done(null, false,{message:"Incorrect Username."}); }
        var passwords = user.password;
        console.log(password,passwords);
        if (passwords!=password) { return done(null, false,{message:"Incorrect Password."}); }
        if(!user || passwords!=password) {return done(null,false,{message:"The userid and passsword is incorrect"})}
        console.log(user);
        return done(null, user);
      });
    }
));


//serializeUser and deserialize
passport.serializeUser((user:any,done)=>{
    if(user){
        return done(null,user.id);
    }
    return done(null,false);
});


passport.deserializeUser((id,done)=>{
    UserModel.findById(id,(err:any,user:any)=>{
        if(err) return done(null,false);
        return done(null,user);
    })
});

//logout feature
app.get('/logout',(req:Request,res:Response)=>{
    //@ts-ignore 
    req.logout(()=>{});
    res.redirect('/login');
})

//authentication check
function isAuthenticate(req:Request,res:Response,done:any){
    console.log(req.user);
    if(req.user){
        return done();
    }
    else{
        res.redirect('/login');
        console.log("Invalid user");
    }
}


app.get('/list/delete/:id',isAuthenticate,async(req:Request,res:Response)=>{
    try{
        const data = await BookModel.findByIdAndDelete(req.params.id);
        console.log('deleted',data);
        res.redirect('/list');
    }
    catch(err:any){
        console.log(err);
    }
})

app.get('/register',(req:Request,res:Response)=>{
    res.render('registration');
})

//user sign up
// app.post('/register',async(req:Request,res:Response)=>{
//     var username=req.body.username;
//     var password=req.body.password;
//     try{
//         const data = new UserModel({
//             name:`${username}`,
//             password:`${password}`
//         })
//         await data.save();
//         console.log('user signed up',data);
//         res.redirect('/login');
//     }
//     catch(err:any){
//         console.log(err);
//     }

// });

app.post('/register',async(req:Request,res:Response,done)=>{
        var username=req.body.username;
        var password=req.body.password;
        try{
            await UserModel.findOne({name:username},(err:any,user:any)=>{
                if(err) done(false);
                else if(user) res.redirect('/login');
                else{
                    const data = new UserModel({
                        name:username,
                        password:password
                    })
                    data.save().then(()=>console.log('you are signed up')).catch((err:any)=>{console.log(err)});
                    res.redirect('/login');
                }
            })

        }
        catch(err){
            console.log(err);
        }
})


//authenticate
app.post('/login', 
  passport.authenticate('local',{ failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/insert');
  });


app.use(router);
connects();

app.listen(PORT,():void=>console.log(`the server is running on the port ${PORT}`));