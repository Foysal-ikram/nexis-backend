const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

require('dotenv').config();


app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Doctors api running');

})

app.listen(port, () => console.log(port))


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tngy8ld.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const userCollection = client.db('nexis').collection('users');

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
            res.send({token})
        })  

        app.get('/list', verifyJWT, async (req, res) => {
           const query = {} ;
           const result = await userCollection.find(query).toArray() ;
           res.send(result)
        });


        app.post('/users', async (req,res)=>{
        const user = req.body ;
        const result = await userCollection.insertOne(user)
        res.send(result)
       })

       app.get('/users' , async (req,res)=>{
        const email = req.query.email ;
        console.log(email)
        const search = {Email : email} ;
        const user = await userCollection.findOne(search)
        console.log(user)
        res.send(user)
       })




    }
    finally {

    }

}
run().catch(console.dir);