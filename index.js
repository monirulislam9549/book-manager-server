const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.port || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.skg6sgn.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const bookCollection = client.db("bookManager").collection("books");

    // test api
    app.get("/health", (req, res) => {
      res.send("all is wellbcvxxxxx");
    });

    // insert a book to db
    // create = post
    app.post("/upload-book", async (req, res) => {
      const data = req.body;
      // console.log(data);
      const result = await bookCollection.insertOne(data);
      res.send(result);
    });

    // get = read
    app.get("/allBooks", async (req, res) => {
      const { authorName } = req.query;
      console.log(authorName);
      let query = {};
      if (authorName) {
        query = { authorName };
      }
      const books = await bookCollection.find(query).toArray();
      // console.log(books);
      res.send(books);
    });

    // update = put
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBook = req.body;
      // console.log(updatedBook);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...updatedBook,
        },
      };
      const result = await bookCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete
    app.delete("/book/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bookCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.send(error.message);
      }
    });

    // book details api
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("book server is running");
});

app.listen(port, () => {
  console.log(`book manager is running on port:${port}`);
});
