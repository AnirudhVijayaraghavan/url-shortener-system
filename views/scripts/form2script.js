// Code to add functionalities and style to progress bar and back to home page button.
const showOnPx = 150;
const backToTopButton = document.querySelector(".back-to-top");
const resumeButton = document.querySelector(".resume");
const footerarea = document.querySelector("footer");
const pageProgressBar = document.querySelector(".progress-bar");

const scrollContainer = () => {
  return document.documentElement || document.body;
};

const goToHomePage = () => {
  window.location.href = "index.html";
};

document.addEventListener("scroll", () => {
  console.log("Scroll Height: ", scrollContainer().scrollHeight);
  console.log("Client Height: ", scrollContainer().clientHeight);
  const scrolledPercentage =
    (scrollContainer().scrollTop /
      (scrollContainer().scrollHeight - scrollContainer().clientHeight)) *
    100;

  pageProgressBar.style.width = `${scrolledPercentage}%`;

  if (scrollContainer().scrollTop > showOnPx) {
    backToTopButton.classList.remove("hidden");
    resumeButton.classList.remove("hidden");
    footerarea.classList.remove("hidden");
  } else {
    backToTopButton.classList.add("hidden");
    resumeButton.classList.add("hidden");
    footerarea.classList.add("hidden");
  }
});

backToTopButton.addEventListener("click", goToHomePage);

// Code to embed google map API.
function myMap() {
  // The location of Walnut avenue.
  const walnut = { lat: 42.312312864693176, lng: -71.09708490000003 };
  // The map, centered at Walnut avenue.
  const map = new google.maps.Map(document.getElementById("googleMap"), {
    zoom: 12,
    center: walnut,
  });
  // The marker, positioned at Walnut avenue.
  const marker = new google.maps.Marker({
    position: walnut,
    map: map,
  });
  window.initMap = initMap;
}

// Code to include ScrollFade.js functionality.
var fadeElements = document.getElementsByClassName('scrollFade');

function scrollFade() {
  var viewportBottom = window.scrollY + window.innerHeight;

  for (var index = 0; index < fadeElements.length; index++) {
    var element = fadeElements[index];
    var rect = element.getBoundingClientRect();

    var elementFourth = rect.height / 4;
    var fadeInPoint = window.innerHeight - elementFourth;
    var fadeOutPoint = -(rect.height / 2);

    if (rect.top <= fadeInPoint) {
      element.classList.add('scrollFade--visible');
      element.classList.add('scrollFade--animate');
      element.classList.remove('scrollFade--hidden');
    } else {
      element.classList.remove('scrollFade--visible');
      element.classList.add('scrollFade--hidden');
    }

    if (rect.top <= fadeOutPoint) {
      element.classList.remove('scrollFade--visible');
      element.classList.add('scrollFade--hidden');
    }
  }
}

document.addEventListener('scroll', scrollFade);
window.addEventListener('resize', scrollFade);
document.addEventListener('DOMContentLoaded', function () {
  scrollFade();
});

// The following code is for the navbar collapse.
let state = "closed";
function openNav() {
  console.log(state);
  state = "open";
  document.getElementById("mySidebar").style.width = "20%";
  document.getElementById("main").style.marginLeft = "20%";
  document.getElementsByClassName("openbtn")[0].style.display = "none";
  document.getElementsByClassName("openbtn")[0].style.opacity = "100%";
  document.getElementsByTagName("footer")[0].style.width = "80%";
  document.getElementsByClassName("mainprofilephotoleft")[0].style.marginLeft = "2%";
  document.getElementsByClassName("mainprofilephotoright")[0].style.marginRight = "2%";
  document.getElementsByClassName("mainprofilephotobottomleft")[0].style.marginLeft = "2%";
  document.getElementsByClassName("mainprofilephotobottomright")[0].style.marginRight = "2%";
}

function closeNav() {
  state = "closed";
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.getElementsByClassName("openbtn")[0].style.display = "inline";
  document.getElementsByTagName("footer")[0].style.width = "100%";
  document.getElementsByClassName("mainprofilephotoleft")[0].style.marginLeft = "15%";
  document.getElementsByClassName("mainprofilephotoright")[0].style.marginRight = "10%";
  document.getElementsByClassName("mainprofilephotobottomleft")[0].style.marginLeft = "5%";
  document.getElementsByClassName("mainprofilephotobottomright")[0].style.marginRight = "5%";
}

function openorclose() {
  if (state === "open") {
    closeNav();

  }
  else if (state === "closed") {

    openNav();
    gsap.from("#mySidebar a", { opacity: 0, stagger: 0.2 });
  }
}

// The following is to fix the bug where hamburger icon does not respond to media query if used
// even once.
function myFunction(x) {
  if (x.matches) {
    document.getElementsByClassName("openbtn")[0].style.display = "none";
  } else {
    document.getElementsByClassName("openbtn")[0].style.display = "inline";
  }
}

var x = window.matchMedia("(max-width: 800px)")
myFunction(x)
x.addListener(myFunction)

// 
var form = document.getElementById("myForm2");

form.addEventListener("submit", submitted);
//initializing valid variables for switch case.
var validFirstName = false;
var validLastName = false;
var validTracking = false;

//regex checks variables
var regExString = /^[a-zA-Z]+$/;

var regExTracking = /(^\d{12}$)/;

var firstName = document.getElementById("firstName");
firstName.addEventListener("input", validate);

var lastName = document.getElementById("lastName");
lastName.addEventListener("input", validate);

var trackingCode = document.getElementById("trackingCode");
trackingCode.addEventListener("input", validate);

function validate(e) {
  console.log("validate");
  var value = e.target.value;
  console.log(value);
  var type = this.id;
  var em = "error_" + type;

  switch (type) {
    case "firstName":
      if (!value.trim().match(regExString)) {
        document.getElementById(em).style.display = "block";
        this.style.border = "2px solid blue";
        validFirstName = false;
      }
      else {
        document.getElementById(em).style.display = "none";
        this.style.border = "";
        validFirstName = true;
      }
      break;

    case "lastName":
      if (!value.trim().match(regExString)) {
        document.getElementById(em).style.display = "block";
        this.style.border = "2px solid blue";
        validLastName = false;
      }
      else {
        document.getElementById(em).style.display = "none";
        this.style.border = "";
        validLastName = true;
      }
      break;

    case "trackingCode":
      if (!value.trim().match(regExTracking)) {
        document.getElementById(em).style.display = "block";
        this.style.border = "2px solid blue";
        validTracking = false;
      }
      else {
        document.getElementById(em).style.display = "none";
        this.style.border = "";
        validTracking = true;
      }
      break;
  }
}

//The following is to reset the form, variables and localStorage.
function resetButton() {
  console.log("resetButton() function called.")
  document.getElementById("myForm2").reset();
  console.log("Form reset.");
  localStorage.clear();
  console.log("Data removed from localStorage.");
}

function addToLocalStorage() {
  //The following is to declare localStorage keys, using values inside the labels.

  var firstName = document.getElementById("firstName").value;
  localStorage.setItem("firstName", firstName);
  var lastName = document.getElementById("lastName").value;
  localStorage.setItem("lastName", lastName);
  var trackingCode = document.getElementById("trackingCode").value;
  localStorage.setItem("trackingCode", trackingCode);
  console.log("Data Saved to localStorage Successfully");
}

// EmailJS code.
function sendemailtome() {
  alert(localStorage.getItem("emailId"));
  emailjs.send("service_wtn042h", "template_bv4dacd", {
    firstName: localStorage.getItem("firstName"),
    lastName: localStorage.getItem("lastName"),
    emailId: localStorage.getItem("emailId"),
    phoneNumber: localStorage.getItem("phoneNumber"),
    zipcode: localStorage.getItem("zipcode"),
    source: localStorage.getItem("source"),
    comments: localStorage.getItem("comments"),
  });
}

function submitted(e) {
  e.preventDefault();
  console.log("submitted");
  console.log(validFirstName + "|" + validLastName + "|" + validTracking);
  if (validFirstName && validLastName && validTracking) {
    // The following adds the form details to localStorage.
    addToLocalStorage()
    // The following function sends the e-mail.
    modal.style.display = "block";
    modal.innerText =  "Your shipment, for the tracking code " +localStorage.getItem("trackingCode")+ " is currently : Out for delivery."
    modal.style.color = "white"

    // sendemailtome();
    // The following function resets the form.
    resetButton();
  }
  else {
    alert("Please enter all the details, as prompted.");
  }
}

// The following code is for gsap Plugin.
gsap.registerPlugin(ScrollTrigger);
let animation = gsap.timeline();
gsap.from("#h1", {
  x: "-100%",
  duration: 3,
  scrollTrigger: "#h1"
});
gsap.from("#h2", {
  x: "100%",
  duration: 3,
  scrollTrigger: "#h2"
});


gsap.from(".formsection", {
  x: "100%",
  duration: 4,
  ease: "bounce.out",
  y: 500,
  scrollTrigger: ".formsection"
});

// Get the modal
var modal = document.getElementById("myModal");


var span = document.getElementsByClassName("close")[0];


span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}



