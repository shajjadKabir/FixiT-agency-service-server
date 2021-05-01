const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = 4040;
app.use(express.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t1m6g.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const userServicesCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("review");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");


  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
      const desc = req.body.desc;
      const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    servicesCollection.insertOne({ name, desc, image , price }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //   Show Services to home
  app.get("/services", (req, res) => {
    servicesCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get('/order/:id', (req, res) => {
    servicesCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  app.post("/addAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.insertOne({ email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Adding Order
  app.post("/addOrder", (req, res) => {
    // const file = req.files.file;
    console.log(req.body);
    const name = req.body.name;
    const desc = req.body.desc;
    const email = req.body.email;
    const service = req.body.service;
    const price = req.body.price;
    
    userServicesCollection
      .insertOne({ name, desc, email, service, price})
      .then((result) => {
        console.log(result);
        res.send(result.insertedCount > 0);
      });
  });

  // Showing Order
  app.get("/allOrders", (req, res) => {
    userServicesCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/review", (req, res) => {
    const name = req.body.name;
    const desig = req.body.desig;
    const desc = req.body.desc;
    const photo = req.body.photo;
    reviewCollection.insertOne({ name, desig, desc, photo }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/getReview", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.patch("/addStatus/:id", (req, res) => {
    const status = req.body.status;
    // console.log(status);
    userServicesCollection
      .updateOne({ _id: ObjectId(req.params.id) }, 
      { $set: { status } })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  // Find Admin
  app.get("/isAdmin/:email", (req, res) => {
    adminCollection
      .find({ email: req.params.email })
      // console.log(req.params.email)
      .toArray((err, documents) => {
        res.send(documents.length > 0);
      });
  });

  app.get('/orders', (req, res) =>{
    userServicesCollection.find({email: req.query.email})
    .toArray((err, documents)=>{
        res.send(documents);
    })
  })

});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
