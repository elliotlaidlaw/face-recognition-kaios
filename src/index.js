// import l10n.js first
import 'kaios-gaia-l10n';
import './index.css';

const picture = document.getElementById('picture');
const header = document.getElementById('headertext');
const instructor = document.getElementById('instructortext');
const expressionArray = ['neutral', 'happy', 'sad', 'surprised'];

instructor.innerHTML = "Loading";

const tf = require('@tensorflow/tfjs')
tf.setBackend('cpu')
const faceapi = require('@vladmandic/face-api/dist/face-api.node-cpu.js')

var image = null
var cameraControl = null
var display = document.getElementsByTagName('video')[0]
var camera = window.navigator.mozCameras.getListOfCameras()[1]
var options = {}
var pictureOptions = {
  pictureSize: null,
  fileFormat: null
}

function onError(error) {
  console.warn(error);
}

function showPreview() {
  if (cameraControl != null) {
    cameraControl.release()
  }

  function onPrevSuccess(cameraObj) {
    cameraControl = cameraObj.camera
    display.mozSrcObject = cameraControl
    display.play()
  }
  
  navigator.mozCameras.getCamera(camera, options).then(onPrevSuccess, onError);
}

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
    console.log("DATA");
    authenticate()
  }
}

function enrol() {

  header.innerHTML = "Enrol";
  console.log('Ready')

  showPreview()
  instructor.innerHTML = "Take Picture";

  picture.addEventListener('click', () => {

    instructor.innerHTML = "Hold";

    function onPictureTaken(blob) {
      instructor.innerHTML = "Working";
      console.log(blob)
      var blobURL = URL.createObjectURL(blob)
      var newImage = new Image()
      newImage.src = blobURL
      image = newImage
  
      console.log('Image loaded')
        
      var detection = faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true).withFaceDescriptor()
      .then((dtn) => {

        console.log(dtn.descriptor)

        var data = JSON.stringify(dtn.descriptor)
        console.log('saving...')
        var myStorage = window.localStorage
        myStorage.setItem('descriptor', data)
  
        instructor.innerHTML = "Done";
  
        window.location.reload();
      })
      .catch((error) => {

        console.log("ERROR THROWN")
        alert('Enrolment failed. \nTry again.')
        window.location.reload();
      })
    }

    function onPictureNotTaken(error) {
      instructor.innerHTML = "Camera Error";
    }
  
    function onPicSuccess(cameraObj) {
      cameraControl = cameraObj.camera
      pictureOptions.pictureSize = cameraControl.capabilities.pictureSizes[0]
      pictureOptions.fileformat  = cameraControl.capabilities.fileFormats[0]
  
      cameraControl.takePicture(pictureOptions).then(onPictureTaken, onPictureNotTaken)
    }

    cameraControl.release()
    navigator.mozCameras.getCamera(camera, options).then(onPicSuccess, onError);
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

  var rand = Math.floor(Math.random() * 4)
  var reqExpression = expressionArray[rand]
  instructor.innerHTML = "Show " + reqExpression + " expression";

  console.log('Loaded')

  showPreview()
  // instructor.innerHTML = "Take Picture";

  picture.addEventListener('click', () => {

    instructor.innerHTML = "Hold";

    function onPictureTaken(blob) {
      instructor.innerHTML = "Working";
      var blobURL = URL.createObjectURL(blob)
      var newImage = new Image()
      newImage.src = blobURL
      image = newImage
      // document.body.style.backgroundImage = "url('" + blobURL + "')"
  
      console.log('Image loaded')
      console.log(image)

      var detection = faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true).withFaceExpressions().withFaceDescriptor()
      .then((dtn) => {

        console.log(dtn.descriptor)

        const minConfidence = 0.2
        var sorted = dtn.expressions.asSortedArray()

        console.log(sorted[0].expression)

        if (sorted[0].probability >= minConfidence && sorted[0].expression === reqExpression)
        {
          const result = faceMatcher.findBestMatch(dtn.descriptor)
          const distance = result['distance']
          console.log(distance)
          if (distance <= 0.4 && distance >= 0.15) 
          {
            alert('User Verified')
            window.location.reload();
          } 
          else
          {
            alert('Verification failed. \nTry again.')
            window.location.reload();
          }
        }
        else 
        {
          alert('Liveness Test Failed. \nTry again')
          window.location.reload();
        }
      })
      .catch((error) => {

        console.log("ERROR THROWN")
        alert('Image Error. \nTry again.')
        window.location.reload();
      })
    }

    function onPictureNotTaken(error) {
      instructor.innerHTML = "Camera Error";
    }
  
    function onPicSuccess(cameraObj) {
      cameraControl = cameraObj.camera
      pictureOptions.pictureSize = cameraControl.capabilities.pictureSizes[0]
      pictureOptions.fileformat  = cameraControl.capabilities.fileFormats[0]
  
      cameraControl.takePicture(pictureOptions).then(onPictureTaken, onPictureNotTaken)
    }

    cameraControl.release()
    navigator.mozCameras.getCamera(camera, options).then(onPicSuccess, onError);
  })
}
