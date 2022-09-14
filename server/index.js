import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import bcrypt from 'bcrypt';


const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

mongoose.connect('mongodb://127.0.0.1:27017/loginsignup',(err)=>{
    console.log('connected', err ? false : true);
})


const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
})

userSchema.pre('save',function(next){
    console.log(this,'This in the pre')
    if(this.password && this.isModified ('password')){
        bcrypt.hash(this.password,10,(err,hashed)=>{
            if(err) return next(err)
            this.password = hashed;
            return next()
        })
    }else{
        next()
    }
})


userSchema.methods.verifypassword=function(password,cb){
    bcrypt.compare(password,this.password ,(err,result)=>{
        console.log(result)
        return cb(err,result)
    })
}



const User = new mongoose.model("User",userSchema)

const detailSchema = new mongoose.Schema({
    firstname: String,
    lastname : String,
    phone : Number ,
    address : String ,
    room : Number
})


const Detail = new mongoose.model("Detail",detailSchema)

app.post('/signup',(req,res)=>{
    // res.send("SIGNUP")
    const {name, email,password} = req.body
    User.findOne({email:email},(err,user)=>{
        if(user){
            res.send({message:"User Has Already"})
        }else{
            const user = new User({
                name,email,password
            })
            user.save(err =>{
                if(err){
                    res.send(err)
                }else{
                    res.send({message:"Successful Registered , Please Login now"})
                }
            })
        }
    })
    
})



app.post('/login',(req,res)=>{
    //res.send("LOGIN")
    const { email,password} = req.body
   User.findOne({email:email},(err,user)=>{
       if(user){
           if(password == user.password){
               res.send({message:"Login Successful",user:user})
           }else{
               res.send({message:"Passowrd didn't match"})
           }
       }else{
           res.send({message:"User not registered"})
       }
   })
})

app.post('/details',(req,res)=>{
    // res.send("Details")
    const { firstname , lastname , phone , address , room} = req.body
    Detail.create(req.body,err =>{
        if(err){
            res.send(err)
        }else{
            res.send({message:"Detail save"})
        }
    })
})


app.get('/detailslist',(req,res)=>{
    // const { firstname , lastname , phone , address , room} = req.body
    // console.log(req.body.firstname)
    // res.send("Detail List")
    Detail.find({},(err,list)=>{
        console.log(list,"list")
        console.log(err,"err")
        if(err){
            res.send("No data")
        }else{
            res.send({list})
        }
    })
})



app.listen(9000,()=>{
    console.log("Welcome on 9000 PORT")
})