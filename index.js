const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_CAR_ID}:${process.env.DB_CAR_PASS}@cluster0.ngmeevb.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // 

        const toysCollection = client.db('CarZoneKids').collection('allToys');
        // console.log(categoriesCollection)

        // Creating index on two fields
        // const indexKeys = { toy_name: 1 }; // Replace field1 and field2 with your actual field names
        // const indexOptions = { name: "toy_name" }; // Replace index_name with the desired index name
        // const result = await toysCollection.createIndex(indexKeys, indexOptions)
        // console.log(result);

        //------ categories  routes --------
        app.get('/allToys', async (req, res) => {
            const cursor = toysCollection.find()
            const result = await cursor.toArray()
            res.json(result)
        })

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.json(result)
        })
        app.get('/toyUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.json(result)
        })


        app.get("/getToysByText/:text", async (req, res) => {
            const text = req.params.text;
            // console.log(text)                     
            const result = await toysCollection
                .find({
                    $or: [
                        { toy_name: { $regex: text, $options: "i" } }
                    ],
                })
                .toArray();
            res.json(result);

        });

        app.get('/toysByEmail/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email)
            const query = { seller_email: email }
            const result = await toysCollection.find(query).sort({ price: -1 }).toArray();
            res.json(result)
        })

        app.get('/myToys', async (req, res) => {
            // console.log(req.query.email)
            // console.log(req.query.sort)
            if (req.query?.email) {
                query = { seller_email: req.query.email }
                sort = req.query.sort
            }
            const result = await toysCollection.find(query).sort({ price: sort }).toArray()
            res.send(result)
        })

        app.post('/allToys', async (req, res) => {
            const toys = req.body;
            // console.log('New toys', toys)
            const result = await toysCollection.insertOne(toys);
            res.json(result)
        })

        // update data
        app.put('/toyUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            // console.log(toy)
            const filter = { _id: new ObjectId(id) }
            const option = { upset: true };
            const updatedToys = {
                $set: {
                    picture: toy.picture,
                    toy_name: toy.toy_name,
                    seller_name: toy.seller_name,
                    category_name: toy.category_name,
                    price: toy.price,
                    rating: toy.rating,
                    available_quantity: toy.available_quantity,
                    details_description: toy.details_description,
                }
            }
            const result = await toysCollection.updateOne(filter, updatedToys, option)
            res.json(result)
        })

        // delete toy
        app.delete('/toyDelete/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query)
            res.json(result)
        })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // 
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Car zone kids is running');
})

app.listen(port, () => {
    console.log(`car kids server is running on port ${port}`)
})