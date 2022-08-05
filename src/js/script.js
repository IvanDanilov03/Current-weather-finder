const locationInfo = document.querySelector('#location');
const currentInfo = document.querySelector('#current');
const feelslikeInfo = document.querySelector('#feelslike')

const cityInput = document.querySelector('.search-bar__input');
const btn = document.querySelector('.search-bar__btn');


btn.addEventListener('click', getCity);
cityInput.addEventListener('keydown', handleKey);

const notify = {
  usedArr: new Array(10),
  getLen: function(){
      for(let i = 0, len = this.usedArr.length; i < len; i++){
          if(!this.usedArr[i]){
              this.usedArr[i] = true;
              return i;
          }
      }
  },
  show: function(msg, setting = {}){
      const {bgClass, duration, delay} = {bgClass: 'alert-primary', duration: 1000, delay: 2000, ...setting}
      const el = document.createElement('div')
      el.className = "notify-box alert"
      el.classList.add(`${bgClass}`)
      el.style.transition = `transform ${duration}ms`;
      el.innerHTML = msg;
      document.querySelector('body').appendChild(el)

      const len = this.getLen();
      el.style.top = len * el.offsetHeight + 'px'


      requestAnimationFrame(() => {
          el.classList.add('show-notify');
          setTimeout(() => {
              el.classList.remove('show-notify')
              setTimeout(() => {
                  el.parentNode.removeChild(el)
                  this.usedArr[len] = false;
              }, `${duration + 300}`)
          },`${delay}`)
      });
  }
}

function validateCity(city) {
  if (/^[a-zA-Z]+(?:[\s-]+[a-zA-Z]+)*$/gm.test(city)) {
      return true;
  }
  notify.show('You have to enter a valid City name')
  return false;
}

async function getData(city = 'London'){
  const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=48348f2c8bbd4fcea39152147220507&q=${city}&days=3`);
  return await response.json();
}

function getCity() {
    if (validateCity(cityInput.value)) {
        getData(cityInput.value)
            .then(setInfo)        
    }
}

function handleKey(e) {
    if (e.key === 'Enter') {
        getCity();
    }
}

let flag = null

function setInfo(data){

    locationInfo.innerText = data.location.name + ', ' + data.location.country;
    currentInfo.innerText = data.current.temp_c + '\u00B0';

    const div = document.getElementById("info__block-img");
    let img = document.createElement("img");

    if (flag !== null) {
        div.removeChild(flag);
    }

    //let icon = data.current.condition.icon.slice(21)
    let icon = data.current.condition.icon
    img.src = `https:${icon}`;

    flag = div.appendChild(img);

    feelslikeInfo.innerText = data.current.feelslike_c + '\u00B0' ;
}
document.addEventListener('DOMContentLoaded', () => {
  getData('Ukraine').then(setInfo)
});

function clearThemes() {
  $("html").attr("class", "");
}

$(function() {

  $(".theme-box__btn-day").click(function() {
    clearThemes();
    $("html").addClass("day");
  });
  $(".theme-box__btn-night").click(function() {
    clearThemes();
    $("html").addClass("night");
  });
});

