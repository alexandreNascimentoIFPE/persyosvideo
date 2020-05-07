const socket = io();

const message = document.getElementById('message');
const handle  = document.getElementById('handle');
const output  = document.getElementById('output');
const button  = document.getElementById('button');
const typing  = document.getElementById('typing');


/* video chamada*/
function getLVideo(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    var constraints = {
        audio:true,
        video:true
    }
    navigator.getUserMedia(constraints, callbacks.success, callbacks.error)
}

function recStream(stream, elemid)
{
    var video = document.getElementById(elemid);
    video.srcObject   = stream;
    video.peer_stream = stream;
}

getLVideo({
    success: function(stream) 
    {
        window.localstream = stream;
        recStream(stream, 'lvideo');
    },
    error: function(err) 
    {
        alert("acesso negado a camera");
        console.log(err);
    }
})

var conn;
var peer_id;

var peer = new Peer({key: 'lwjd5qra8257b9'});

peer.on('open', function() 
{
    document.getElementById("displayId").innerHTML = peer.id;
})

peer.on('connection', function(connection)
{
    conn = connection;
    peer_id = connection.peer;

    document.getElementById('connId').value = peer_id;
});

peer.on('error', function(err) 
{
    alert("aconteceu um erro" + err);
    console.log(err);
})

/*document.getElementById("conn_button").addEventListener('click', function() 
{
    peer_id = document.getElementById("connId").value;
    if (peer_id) 
    {
        conn = peer.connect(peer_id);
    }
    else
    {
        alert('coloque um id válido');
        return false;
    }  
})
*/
peer.on('call', function (call) 
{
    var acceptCall = confirm("voce aceita essa chamada de video ?");
    
    if(acceptCall)
    {
        document.getElementById('chat').style.visibility = 'none';
        document.getElementById('chat-window').style.visibility = 'none';

        message.addEventListener('keypress', () =>{
            socket.emit('userTyping', handle.value)
        })
        
        button.addEventListener('click', () =>{
            socket.emit('userMessage', {
                handle : handle.value,
                message : message.value
            })
            document.getElementById('message').value="";
        })
        
        socket.on("userMessage", (data) => {
            typing.innerHTML = "";
            output.innerHTML += '<p> <strong>' + data.handle + ': </strong>' + data.message + '</p>'
        })
        
        socket.on('userTyping', (data) =>{
            typing.innerHTML = '<p><em>'+ data + 'está digitando ... </em></p>'
        })

        call.answer(localstream);

        call.on('stream', function(stream) 
        {
            window.peer_stream = stream;
            
            recStream(stream, 'rVideo')
        });

        call.on('close', function() {
            alert('a conexão atrasou')
        })
    }
    else
    {
        console.log('chamada negada')
    }
});

document.getElementById('call_button').addEventListener('click', function() 
{
    peer_id = document.getElementById("connId").value;
    if (peer_id) 
    {
        conn = peer.connect(peer_id);
    }
    else
    {
        alert('coloque um id válido');
        return false;
    }

    console.log("chamando o peer : " + peer_id);
    console.log(peer);
    var call = peer.call(peer_id, window.localstream);

    call.on('stream', function(stream) 
    {
        window.peer_stream = stream;

        recStream(stream, 'rVideo');
    })
    
})