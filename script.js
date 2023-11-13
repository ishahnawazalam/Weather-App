const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

/* Initially */
let oldTab = userTab; //by default to user ka location hee access krega ..currentTab or oldtab btatta hai ki hum kon se tab pr hai...new tab bole to clicked tab
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab"); // current-tab ke corresponding css properties jo add hogi
getfromSessionStorage();    //jbb initially screen load hogi to coordinates agar present hoga to dikha dega thats why


/* switch tab */
function switchTab(newTab){
    if(newTab != oldTab){  // Here A tab se B tab pr jaana chahte hai
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");
    
       
    if(!searchForm.classList.contains("active")){
            //kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
    }
    else{
        //main pehle search wale tab pr tha, ab your weather tab visible karna h 
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");
        //ab main your weather tab me aagya hu, toh weather bhi display karna padega, so let's check local storage first
        //for coordinates, if we haved saved them there.
        getfromSessionStorage();
    }
   
  }
    
}

/* event Listener on user and search tab */
userTab.addEventListener('click' , () =>{
    //pass clicked tab as input parameter
    switchTab(userTab);

});

searchTab.addEventListener('click' , () =>{
    //pass clicked tab as input parameter
    switchTab(searchTab);

});

/* check if cordinates are already present in session storage */
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){       // phle check kiye sessionStorage using '.getItem' agar local coordinates save nhi hai mtlb hum location ko allow hee nhi kiya so active kr denge
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active"); // Grant access tab ko visible krao
    }
    else { 
        // agar local coordinates hai to..to coordinates ko json format mei convert krke uske latitude and longitude ka use krke API fetch kr denge
        const coordinates = JSON.parse(localCoordinates); //json.parse json string ko json object mei convert kr deta hai..search google for d/f b/w json string and json object
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;

    // grantcontainer ko invisible kro
      grantAccessContainer.classList.remove("active");
    //and loader ko visible kro
      loadingScreen.classList.add("active");

    //API CALL
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const  data = await response.json();

        // Abb chuke data aa chuka isiliye loader ko abb hta denge
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active"); // Sirf visible kraya hai uske under values dalne ke liye ek function call kr denge
        //And phir renderweatherInfo function call krke Weather Information dikha denge UI par by taking values from data 
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        // add something here
   }

}

function renderWeatherInfo(weatherInfo){
    //since we need value of country code so that we can show flag also we need temp. value ,windspeed,humidity and clouds percentage etc so fistly, we have to fethc the elements 
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]"); 
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherInfo object and put it UI elements /* optional chaining operator use here for fetching value from json object */
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description; //phle mai weatherInfo mei gya phir mai weather mei gya phir mai phle index mei gya and lastly description mei
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}


/* Grant Access button pr listener */

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert('No any geological support available'); /* m */
    }
}

function showPosition(position){

    const userCoordinates ={  // userCoordinate are object
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
     // Jo coordinates mili hai abb usko store kr lenge
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    // Store krne ke baad UI pr dikhane ke liye fetchUser wala function call krenge
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


/* API call function for searching  and apply event listener on search form*/
// Jo input city dale search mei uska API fetch krna hoga

const searchInput = document.querySelector("[data-searchInput]");

// Now listener apply on ...
searchForm.addEventListener("submit", (e) =>{
    e.preventDefault();       // default work ko hta deta hai
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})


// Now abb function call krege jo city ke according API call krega 
async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
       console.log("No city found",err); /*m*/
    }
}