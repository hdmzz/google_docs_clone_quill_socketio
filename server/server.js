const mongoose = require("mongoose")
const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})
const Document = require("./schema/Document")
const defaultValue = ""
//Connection a la base de donnée
mongoose.connect('mongodb://localhost/google-docs-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

io.on("connection", socket => {
    socket.on("get-document", async documentId => {
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)//creation d'une room pou l'id
        socket.emit('load-document', document.data)

    //on ecoute l'evenement envoyé depuis TextEditor.js nomé send-changes
        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta)//cette fctn dit a tout le monde sauf nous que il ya du changement et delta crspdt au changement
    })
    socket.on ('save-document', async data => {
        await Document.findByIdAndUpdate(documentId, { data })
    })
    })//Récupération après coté front/client avec un useEffet
    console.log("connecté")
})

async function findOrCreateDocument(id) {
    if(id == null) return
    //trouver le document 
    const document = await Document.findById(id)
    if (document) return document //si doc existe on le renvoie sinon on en créer un 
    return await  Document.create({ _id: id, data: defaultValue})
}