const express = require('express');
const app = express();

//body parser
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//session
var session = require('express-session');
app.use(session({
                    secret: "Shh, its a secret!",
                    resave: false,
                    saveUninitialized: true
                }))

const {MongoClient,ObjectId} = require('mongodb');
const url = 'mongodb://127.0.0.1:27017/';

const cors = require('cors');
app.use(cors({
    origin:["http://localhost:4200"],credentials:true
}));


//View 
app.get('/allusers',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('packers_users').find().toArray((err,data) => {
            res.send(data)
        })
    })
})


//create
app.post('/register',(req,res) => {
    console.log(req.body);
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('packers_users').find({email: req.body.email}).toArray((err,data) =>{
            if(err)
            {
                res.send(err);
            }
            else{
                if(data.length == 1){
                    res.send('Email already registered with us.');
                }
                else
                {
                    db.collection('packers_users').insertOne(req.body,(err,data) =>{
                        if(err){
                            console.log(err);
                            res.send(err)
                        }else{
                            res.send(data);
                        }
                    });
                }
            }
        });
    });
})

//login

app.post('/login',(req,res) => {
    console.log(req.body);
    MongoClient.connect(url,(err,conn) => {
            var db = conn.db('merit');
            db.collection('packers_users').find({email: req.body.email}).toArray((err,data) =>{
            if(data.length === 0){
                res.send("Incorrect email or Password");
            }
            else {
                if(data[0].psw === req.body.psw){
                        console.log(data[0]);
                        req.session.email = req.body.email;
                        req.session.psw = req.body.psw;
                        req.session.uid = data[0]._id;
                        res.status(200).send(data[0]);   
                }else{
                    res.send('Incorrect email or Password');
                }
            }
        });
    });
});


app.post('/logout',(req,res) =>{
    console.log(req.session.email);
    console.log(req.session.psw);
    console.log(req.session.uid);
    if(req.session.email){
        req.session.destroy((err) =>{
            if(err){
                res.status(500).send('Could not log out.' )
            }else{
                res.status(200).send({})
            }
        });
    }else{
        res.status(404).send({})
    }
})

//forgot
app.post('/forgot',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('packers_users').find({email : req.body.email}).toArray((err,data) => {
            if(err){
                res.send(err)
            }
            else{
                if(data.length === 0)
                {
                    res.send('User not found')
                }
                else{
                    res.status(200).send(data[0]._id)
                }
            }
        })
    })
})

//update password
app.put('/updatepassword',(req,res) => {
    console.log(req.body);
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('packers_users')
        .updateOne(
            {email : req.body.email},
            {$set: {psw : req.body.psw}},
            (err,data) =>{
                if(err){
                    res.send(err);
                }
                else{
                    res.send(data);
                }
        });
    });
});

function ath(req,res,next){
    console.log(req.session.uid);
    if(req.session.email){
        MongoClient.connect(url,(err,conn) => {
            var db = conn.db('merit');
            db.collection('packers_users').find({email : req.session.email}).toArray((err,data) =>{
                if(data[0].psw === req.session.psw){
                    next()
                }
                else{
                    res.send({link : '/login'})
                }
            });
        });
    }else{
        res.send({link : '/login'})
    }
}

app.get('/test',ath,(req,res) => {
    res.send({link : '/test'})
})


app.listen(7080,() => {
    console.log('App running on http://localhost:7080/');
});