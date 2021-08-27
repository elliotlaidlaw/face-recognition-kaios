// import l10n.js first
import 'kaios-gaia-l10n';
import './index.css';

const picture = document.getElementById('picture');
const header = document.getElementById('headertext');
const instructor = document.getElementById('instructortext');

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
      console.log(image)
  
      try {
        setTimeout(function () {
          alert('Detection timeout.\nTry again.')
          instructor.innerHTML = "Take Picture"
          showPreview()
          // throw console.log("timeout")
        }, 90000)

        var detection = faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true).withFaceDescriptor()
    
        detection.then((dtn) => {

          console.log(dtn.descriptor)

          var data = JSON.stringify(dtn.descriptor)
          console.log('saving...')
          var myStorage = window.localStorage
          setLatestDescriptor(myStorage, data)
          myStorage.setItem('descriptor', data)
    
          instructor.innerHTML = "Done";
    
          window.location.reload()
        });
      } catch {
        alert('Face not detected.\nTry again.')
        instructor.innerHTML = "Take Picture"
        showPreview()
      }
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

  var labeledLatestDescriptors = []
  var latest = getLatestDescriptors(myStorage)
  console.log(latest)
  latest.forEach(element => {
    console.log(element)
    descriptions = []
    descriptorArray = JSON.parse(element)
    for (let x in descriptorArray) {
      descriptions.push(descriptorArray[x])
    }
    floatArray = Float32Array.from(descriptions)
    descriptions = []
    descriptions.push(floatArray)
    console.log(descriptions)
    labeledLatestDescriptors.push(new faceapi.LabeledFaceDescriptors('', descriptions))
  })
  const latestFaceMatcher = new faceapi.FaceMatcher(labeledLatestDescriptors, 0.1)

  var reqExpression = randExpression()
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
  
      console.log('Image loaded')
      console.log(image)
  
      try{
        setTimeout(function () {
          alert('Detection timeout.\nTry again.')
          window.location.reload()
        }, 90000)

        var detection = faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true).withFaceExpressions().withFaceDescriptor()

        detection.then((dtn) => {

          console.log(dtn.descriptor)
          const minConfidence = 0.4
          var sorted = dtn.expressions.asSortedArray()

          console.log(sorted[0].expression)

          if (sorted[0].probability >= minConfidence && sorted[0].expression === reqExpression)
          {
            const result = faceMatcher.findBestMatch(dtn.descriptor)
            const distance = result['distance']

            const latestResult = latestFaceMatcher.findBestMatch(dtn.descriptor)
            const lastestDistance = latestResult['distance']
            if (distance <= 0.4 && distance >= 0.1 && lastestDistance >= 0.1)
            {
              alert('User Verified')
              var data = JSON.stringify(dtn.descriptor)
              setLatestDescriptor(myStorage, data)
            } 
            else
            {
              alert('Verification failed. \nTry again.')
              reqExpression = randExpression()
              window.location.reload()
            }
          }
          else 
          {
            alert('Liveness Test Failed. \nTry again')
            reqExpression = randExpression()
            window.location.reload()
          }
        });
      } catch {
        alert('Face not detected.\nTry again.')
        instructor.innerHTML = "Take Picture"
        showPreview()
      }
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

function randExpression() {
  const expressionArray = ['neutral', 'happy', 'sad', 'angry', 'surprised'];
  var rand = Math.floor(Math.random() * 5)
  var reqExpression = expressionArray[rand]
  instructor.innerHTML = "Show " + reqExpression + " expression";
  return reqExpression
}

function getLatestDescriptors(myStorage) {
  var latest = []

  if (myStorage.getItem('saved1') != null) {
    latest.push(myStorage.getItem('saved1'))
  } else if (myStorage.getItem('saved2') != null) {
    latest.push(myStorage.getItem('saved2'))
  } else if (myStorage.getItem('saved3') != null) {
    latest.push(myStorage.getItem('saved3'))
  } else if (myStorage.getItem('saved4') != null) {
    latest.push(myStorage.getItem('saved4'))
  } else if (myStorage.getItem('saved5') != null) {
    latest.push(myStorage.getItem('saved5'))
  }
  
  return latest
}

function setLatestDescriptor(myStorage, descriptor) {
  myStorage.setItem('saved5', myStorage.getItem('saved4'))
  myStorage.setItem('saved4', myStorage.getItem('saved3'))
  myStorage.setItem('saved3', myStorage.getItem('saved2'))
  myStorage.setItem('saved2', myStorage.getItem('saved1'))
  myStorage.setItem('saved1', descriptor)
}