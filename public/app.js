const socket = io('/');
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
});
const videoBox = document.querySelector('.video-grid');
const createVideo = document.createElement('video');
createVideo.muted = true;
const peersArr = {
    
}

peer.on('open', ID => {
    socket.emit('join-room', ROOM_ID, ID)
})

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then((stream) => {
    addVideoStream(createVideo,stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userStream => {
            addVideoStream(video,userStream);
        })
    })

    socket.on('user-connected', userID => {
        connectToNewUser(userID, stream);

    })
});


const addVideoStream = (video,stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    });
    videoBox.append(video);
}

const connectToNewUser = (userID,stream) => {
    const call = peer.call(userID,stream)
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video ,userVideoStream);
    })
    call.on('close', () => {
        video.remove();
    })

    peersArr[userID] = call;
}

socket.on('user-disconnected', userID => {
    if (peersArr[userID]) {
        peersArr[userID].close()
        console.log(peersArr[userID])
    }
    else {
        console.error("error")
    }
})