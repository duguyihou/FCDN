const video = document.getElementById('inputVideo')

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.Console(err)
    )
}

startVideo()