//  Importar Módulo
const app = require('express')(),
    MongoClient = require('mongodb').MongoClient,
    objectId = require('mongodb').ObjectID,
    BodyParser = require("body-parser"),
    multipart = require('connect-multiparty'),
    fs = require('fs');

const CONNECTION_URL = "mongodb://root:root@cluster0-shard-00-00-6pvot.mongodb.net:27017,cluster0-shard-00-01-6pvot.mongodb.net:27017,cluster0-shard-00-02-6pvot.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
    DATABASE_NAME = "pedepastel";

let port = process.env.port || 80,
    database, collection;

// adicionar middleware
app.use(multipart())
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
});

app.listen(port, () => {
    console.log(`O servidor foi iniciado na porta ${port}`);
    MongoClient.connect(CONNECTION_URL, { useUnifiedTopology: true }, (error, client) => {
        if (error) {
            throw error
        }

        database = client.db(DATABASE_NAME);
        collection = database.collection("estoque");
        console.log("conectado");
    });
});


// buscar tudo
app.get('/api', (req, res) => {

    collection.find().toArray((error, result) => {
        if (error) {
            console.log(error)
        }
        res.send(result)
    })
});

// inserir novo
app.post('/api', (req, res) => {
    let data = new Date();
    time_stamp = data.getTime();


    let url_imagem = time_stamp + req.files.img.originalFilename,
        origin = req.files.img.path,
        destine = './uploads/' + url_imagem;

    console.log(req.files.img.originalFilename)

    fs.rename(origin, destine, (err) => {
        if (err) {
            throw err
        }
    })

    let dados = {
        title: req.body.title,
        description: req.body.description,
        img: url_imagem,
        preco: req.body.preco,
        qtd: req.body.qtd
    }

    collection.insertOne(dados)
        .then(resp => {
            res.send(resp)

            console.log('Incluido')
        });



});

// alterar
app.put('/api/:id', (req, res) => {
    collection.updateOne({ _id: objectId(req.params.id) }, { $set: { user_id: req.body.user_id } })
        .then(resp => res.send("OK"))

});


// deletar
app.delete('/api/:id', (req, res) => {

    collection.remove({ _id: objectId(req.params.id) }, { justOne: true })
        .then(a => res.send(a))

});