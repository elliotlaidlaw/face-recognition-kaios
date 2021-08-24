// import l10n.js first
import 'kaios-gaia-l10n';
import './index.css';

const imageUpload = document.getElementById('imageUpload');
const header = document.getElementById('header');
const instructor = document.getElementById('instructor');

instructor.innerHTML = "Loading";

const tf = require('@tensorflow/tfjs')
tf.setBackend('cpu')
const faceapi = require('@vladmandic/face-api/dist/face-api.node-cpu.js')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68TinyNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('./models')
]).then(start);

function start() {
  var myStorage = window.localStorage
  if (myStorage.getItem('descriptor') == null) {
    enrol()
  } else {
    authenticate()
  }
}

function enrol() {

  header.innerHTML = "Enrol";
  console.log('Ready')
  instructor.innerHTML = "Ready";

  imageUpload.addEventListener('change', () => {

    instructor.innerHTML = "Working";

    var image = faceapi.bufferToImage(imageUpload.files[0])
    
    image.then((img) => {

      console.log('Image loaded')

      var detection = faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true).withFaceDescriptor()

      detection.then((dtn) => {

        //console.log("Detection loaded")
        //console.log(dtn.descriptor)

        var data = JSON.stringify(dtn.descriptor)
        console.log('saving...')
        var myStorage = window.localStorage
        myStorage.setItem('descriptor', data)

        instructor.innerHTML = "Done";

        window.location.reload()
      });
    });
  })
}

function authenticate() {

  header.innerHTML = "Authenticate";

  var myStorage = window.localStorage
  var result = myStorage.getItem('descriptor')
  var descriptions = []
  var descriptorArray = JSON.parse(result)
  for (let x in descriptorArray) {
    descriptions.push(descriptorArray[x])
  }
  var floatArray = Float32Array.from(descriptions)
  descriptions = []
  descriptions.push(floatArray)

  var labeledFaceDescriptors =  new faceapi.LabeledFaceDescriptors('john', descriptions)
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.4)

  var reqExpression = randExpression()
  console.log('Loaded');

  imageUpload.addEventListener('change', () => {

    instructor.innerHTML = "Working";
    var image = faceapi.bufferToImage(imageUpload.files[0])
    
    image.then((img) => {

      const detection = faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true).withFaceExpressions().withFaceDescriptor()

      detection.then((dtn) => {

        const minConfidence = 0.4
        var sorted = dtn.expressions.asSortedArray()

        console.log(sorted[0].expression)

        if (sorted[0].probability >= minConfidence && sorted[0].expression === reqExpression)
        {
          const result = faceMatcher.findBestMatch(dtn.descriptor)
          const distance = result['distance']
          if (distance <= 0.4) 
          {
            alert('User Verified')
          } 
          else
          {
            alert('Verification failed. \nTry again.')
            reqExpression = randExpression()
          }
        }
        else 
        {
          alert('Liveness Test Failed. \nTry again')
          reqExpression = randExpression()
        }
      });
    });
  })
}

function randExpression() {

  const expressionArray = ['neutral', 'happy', 'sad', 'angry', 'surprised'];
  var rand = Math.floor(Math.random() * 5)
  var reqExpression = expressionArray[rand]
  instructor.innerHTML = "Please upload an image with the following emotion: " + reqExpression;
  return reqExpression
}

function useCamera() {
  var options = {}
  var pictureOptions = {
    pictureSize: null,
    fileFormat: null
  }
  
  var camera = navigator.mozCameras.getListOfCameras()[1]

  function onPictureTaken(blob) {
    console.log(blob)
    var blobURL = URL.createObjectURL(blob)
    var image = new Image()
    image.src = blobURL
    console.log(image)
    document.body.style.backgroundImage = "url('" + blobURL + "')"
  }

  function onPictureNotTaken(error) {
    console.warn(error)
  }
  
  function onSuccess(cameraObj) {
    var cameraControl = cameraObj.camera
    pictureOptions.pictureSize = cameraControl.capabilities.pictureSizes[0]
    pictureOptions.fileformat  = cameraControl.capabilities.fileFormats[0]
  
    console.log(cameraControl)
    cameraControl.takePicture(pictureOptions).then(onPictureTaken, onPictureNotTaken)
  }
  
  function onError(error) {
    console.warn(error);
  }
  
  navigator.mozCameras.getCamera(camera, options).then(onSuccess, onError);
}
