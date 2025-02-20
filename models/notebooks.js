import mongoose from "mongoose";

const notebookSchema=new mongoose.Schema({
  url:{
    type:String,
    required:true,
  },
  price:{
    type:Number,
    required:true
    
  },
  pages:{
    type:Number,
    required:true

  },
  gsm:{
    type:Number,
    default:40
  },
  grade:{
    type:String,
    default:"B",
    enum:['A','B','C']
  },
  length:{
    type:Number,
    required:true
  },
  breadth:{
    type:Number,
    required:true
  },
  quantity:{
    type:Number,
    default:1
  }
},{timestamps:true});

const Notebooks=mongoose.model("Notebooks",notebookSchema);
export default Notebooks

