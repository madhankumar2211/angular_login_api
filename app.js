const express = require('express');
const app = express();

//body parser
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const {MongoClient,ObjectId} = require('mongodb');
const url = 'mongodb://127.0.0.1:27017/';

//Home page
app.get('/',(req,res) => {
    res.send('Hi welcome')
});

//View
app.get('/allusers',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('packers').find().toArray((err,data) => {
            console.log(data);
            res.send(data)
        })
    })
})


//create
app.post('/adduser',(req,res) => {
    console.log(req.body);
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('packers').insertOne(req.body,(err,data) =>{
            if(err){
                console.log(err);
                res.send(err)
            }else{
                res.send(data);
            }
        });
    });
})

//read

app.get('/user/:id',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('packers').find({_id : ObjectId(req.params.id)}).toArray((err,data) => {
            res.send(data)
        })
    })
})


//update

app.patch('/updateuser/:id',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('packers').updateOne(
            {_id : ObjectId(req.params.id)},
            {$set:req.body},
            (err,data) => {
                res.send(data)
            }
        )
    })
})

//delete
app.delete('/deleteuser/:id',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('packers').findOneAndDelete({_id : ObjectId(req.params.id)},(err,data) => {
            res.send(data)
        })
    })
})




app.listen(7080,() => {
    console.log('App running on http://localhost:7080/');
});