// import l10n.js first
import 'kaios-gaia-l10n';
import './index.css';

console.time("LOADING")

const expressionArray = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];

const tf = require('@tensorflow/tfjs')
tf.setBackend('cpu')
const faceapi = require('@vladmandic/face-api/dist/face-api.node-cpu.js')
const imageEnrol = document.getElementById('imageUpload');


Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68TinyNet.loadFromUri('./models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(start);

function start() {

  for (let i = 1; i <= 3; i++) {
    var xmlhttp = new XMLHttpRequest();
    var result;
    xmlhttp.open("GET", `./descriptors/${i}.json`, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
      result = xmlhttp.responseText;
    }
    var descriptions = []
    var descriptorArray = JSON.parse(result)
    for (let x in descriptorArray) {
      descriptions.push(descriptorArray[x])
    }
    var floatArray = Float32Array.from(descriptions)
    descriptions = []
    descriptions.push(floatArray)
  }
  const labeledFaceDescriptors = new faceapi.LabeledFaceDescriptors('john', descriptions)
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.4)

  var rand = Math.floor(Math.random() * 7)
  console.log("Please upload an image with the following emotion: " + expressionArray[rand])
  console.timeEnd("LOADING")
  console.log('Ready')

  imageEnrol.addEventListener('change', () => {

    console.time("MATCHING")

    var image = faceapi.bufferToImage(imageEnrol.files[0])
    
    image.then((img) => {

      console.log('Image loaded')

      var detection = faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true).withFaceExpressions().withFaceDescriptor()

      detection.then((dtn) => {

        const minConfidence = 0.4
        var sorted = dtn.expressions.asSortedArray()
        console.log(sorted[0].expression)
        if (sorted[0].probability >= minConfidence && sorted[0].expression === expressionArray[rand])
        {
          const result = faceMatcher.findBestMatch(dtn.descriptor)
          const distance = result['distance']
          if (distance <= 0.4) 
          {
            console.timeEnd("MATCHING")
            alert('You are John')
          } 
          else
          {
            console.timeEnd("MATCHING")
            alert('you are not John. \ntry again.')
          }
        }
        else 
        {
          console.timeEnd("MATCHING")
          alert("Liveness Test Failed")
        }
      });
    });
  })
}
