import {Schema,model} from "mongoose";

interface user{
    name:string;
    sold:number;
    image:string;
}

const Book_schema = new Schema<user>({
    name:{
        type:String,
        allowNull:false,
        required:true,
    },
    sold:{
        type:Number,
        required:true,
    },
    image:{
        type:String,
        allowNull:false,
        required:true,
    }
})

const BookModel = model<user>('BookModel',Book_schema);

export default BookModel;