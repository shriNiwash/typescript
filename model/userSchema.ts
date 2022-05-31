import {Schema,model} from "mongoose";

interface user_model{
    name:string,
    password:string,
}

const userSchema = new Schema<user_model>({
    name:{
        type:String,
        required:true,
        allowNull:false,
    },
    password:{
        type:String,
        required:true,
        allowNull:false,
    }
})
const UserModel = model<user_model>('UserModel',userSchema);
export default UserModel;
