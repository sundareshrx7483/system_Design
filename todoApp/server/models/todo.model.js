import mongoose from "mongoose";


const todoSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    completed:{
        type:Boolean,
        default:false,

    }

},{
    timestamps:true
});

todoSchema.index({completed:1});


export const Todo=mongoose.model("Todo",todoSchema);