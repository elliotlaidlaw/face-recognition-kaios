(this.webpackJsonp=this.webpackJsonp||[]).push([[0],{248:function(e,n,t){e.exports=t(249)},249:function(e,n,t){"use strict";t.r(n);t(250),t(251);var r=document.getElementById("picture"),o=document.getElementById("headertext"),a=document.getElementById("instructortext");a.innerHTML="Loading",t(225).setBackend("cpu");var i=t(272),c=null,s=null,l=document.getElementsByTagName("video")[0],d=window.navigator.mozCameras.getListOfCameras()[1],m={},u={pictureSize:null,fileFormat:null};function f(e){console.warn(e)}function g(){null!=s&&s.release(),navigator.mozCameras.getCamera(d,m).then(function(e){s=e.camera,l.mozSrcObject=s,l.play()},f)}function p(){var e=["neutral","happy","sad","angry","surprised"][Math.floor(5*Math.random())];return a.innerHTML="Show "+e+" expression",e}Promise.all([i.nets.faceRecognitionNet.loadFromUri("./models"),i.nets.faceLandmark68TinyNet.loadFromUri("./models"),i.nets.faceExpressionNet.loadFromUri("./models"),i.nets.tinyFaceDetector.loadFromUri("./models")]).then(function(){null==window.localStorage.getItem("descriptor")?(o.innerHTML="Enrol",console.log("Ready"),g(),a.innerHTML="Take Picture",r.addEventListener("click",function(){function e(e){a.innerHTML="Working",console.log(e);var n=URL.createObjectURL(e),t=new Image;t.src=n,c=t,console.log("Image loaded"),console.log(c);var r=i.detectSingleFace(c,new i.TinyFaceDetectorOptions).withFaceLandmarks(!0).withFaceDescriptor();r.then(function(e){console.log(e.descriptor);var n=JSON.stringify(e.descriptor);console.log("saving...");var t=window.localStorage;t.setItem("descriptor",n),a.innerHTML="Done",window.location.reload()})}function n(e){a.innerHTML="Camera Error"}a.innerHTML="Hold",s.release(),navigator.mozCameras.getCamera(d,m).then(function(t){s=t.camera,u.pictureSize=s.capabilities.pictureSizes[0],u.fileformat=s.capabilities.fileFormats[0],s.takePicture(u).then(e,n)},f)})):function(){o.innerHTML="Authenticate";var e=window.localStorage.getItem("descriptor"),n=[],t=JSON.parse(e);for(var l in t)n.push(t[l]);var h=Float32Array.from(n);(n=[]).push(h);var L=new i.LabeledFaceDescriptors("john",n),w=new i.FaceMatcher(L,.4),v=p();console.log("Loaded"),g(),r.addEventListener("click",function(){function e(e){a.innerHTML="Working";var n=URL.createObjectURL(e),t=new Image;t.src=n,c=t,console.log("Image loaded"),console.log(c);var r=i.detectSingleFace(c,new i.TinyFaceDetectorOptions).withFaceLandmarks(!0).withFaceExpressions().withFaceDescriptor();r.then(function(e){console.log(e.descriptor);var n=e.expressions.asSortedArray();if(console.log(n[0].expression),n[0].probability>=.4&&n[0].expression===v){var t=w.findBestMatch(e.descriptor),r=t.distance;r<=.4?alert("User Verified"):(alert("Verification failed. \nTry again."),v=p())}else alert("Liveness Test Failed. \nTry again"),v=p()})}function n(e){a.innerHTML="Camera Error"}a.innerHTML="Hold",s.release(),navigator.mozCameras.getCamera(d,m).then(function(t){s=t.camera,u.pictureSize=s.capabilities.pictureSizes[0],u.fileformat=s.capabilities.fileFormats[0],s.takePicture(u).then(e,n)},f)})}()})},251:function(e,n,t){},258:function(e,n){},259:function(e,n){},267:function(e,n){},270:function(e,n){},271:function(e,n){}},[[248,1,2]]]);
//# sourceMappingURL=main.9fe2a54d.chunk.js.map