import mongoose,{connect} from "mongoose";
const conn = "mongodb://127.0.0.1/books";

const connects = ()=>{
    return connect(conn).then(()=>console.log('connected')).catch((err:any)=>{console.log(err)});
};

export default connects;

