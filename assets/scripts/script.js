// API key: 335df852494df73f05faf8726e22ed3a

// DOM hooks
var searchContentEl = document.querySelector(".search-content");
var searchFormEl = document.querySelector(".search-form")
var searchBarEl = document.querySelector("#searchBarContent")
var submitBtnEl = document.querySelector("#submitBtn");
var dropdownEl = document.querySelector(".history-dropdown")

// DOM hooks for today card
var cityHeaderEl = document.querySelector(".city-header");
var todayDateEl = document.querySelector(".today-date");
var todayIconEl = document.querySelector(".icon-lg");
var todayTempEl = document.querySelector(".today-temp");
// var todayCurrentTempSpanEl = document.querySelector(".today-current-temp");
var todayHighEl = document.querySelector(".today-high");
var todayLowEl = document.querySelector(".today-low");
var todayWindEl = document.querySelector(".today-wind");
var todayHumidityEl = document.querySelector(".today-humidity");
var todayVisibilityEl = document.querySelector(".today-visibility");

//DOM hooks for forecast cards
var forecastDayEls = document.querySelectorAll(".forecast-day");
var forecastDateEls = document.querySelectorAll(".forecast-date");
var forecastIconEls = document.querySelectorAll(".icon-sm");
var forecastHighEls = document.querySelectorAll(".forecast-high");
var forecastLowEls = document.querySelectorAll(".forecast-low");
var forecastWindEls = document.querySelectorAll(".forecast-wind");
var forecastHumidityEls = document.querySelectorAll(".forecast-humidity");

var clientSearchHistory = JSON.parse(localStorage.getItem("w-search-hist")) || [];
// makes sure the local storage has an array in it
localStorage.setItem("w-search-hist", JSON.stringify(clientSearchHistory));

var searchHistoryListEl = document.querySelector(".history-list");

function init() {

    // show/hide the dropdown on search bar focus/unfocus
    // only show the dropdown if the user has search history
    searchBarEl.addEventListener("mouseenter", () => { if (clientSearchHistory.length > 0) { dropdownEl.classList.add("show-dd"); }});
    searchContentEl.addEventListener("mouseleave", () => { dropdownEl.classList.remove("show-dd"); });
    refreshSearchHistoryElement();

    // console.log(clientSearchHistory);

}

// update the search history with a new item AND update the UI
function addToSearchHistory(item) {

    if (!clientSearchHistory.includes(item)) {
        if (clientSearchHistory.length < 8) {
            // if the history is not full, unshift
            clientSearchHistory.unshift(item);
        } else {
            // if the history is full, delete last item and unshift
            clientSearchHistory.pop();
            clientSearchHistory.unshift(item);
        }
    } else if (clientSearchHistory[0] != item) {
        clientSearchHistory.splice(clientSearchHistory.indexOf(item), 1);
        clientSearchHistory.unshift(item);
    }

    // update local storage with new search history and refresh the UI element
    localStorage.setItem("w-search-hist", JSON.stringify(clientSearchHistory));
    refreshSearchHistoryElement();
}

// updates the search history UI
function refreshSearchHistoryElement() {

    // remove current dropdown elements
    while (searchHistoryListEl.firstChild) {
        searchHistoryListEl.removeChild(searchHistoryListEl.firstChild);
    }

    // grab history from storage and iterate through it
    clientSearchHistory = JSON.parse(localStorage.getItem("w-search-hist"))
    clientSearchHistory.forEach(item => {

        // create a list element with the history data and append it to dropdown parent
        // <li class="history-item">San Francisco</li>
        var temp = document.createElement("li");
        temp.classList.add("history-item");
        temp.textContent = item;

        searchHistoryListEl.appendChild(temp);

        // if a history item is clicked, fill the search bar with its value
        // and simulate a click on search button. TODO: polish? seems scuffed
        temp.addEventListener("click", () => {
            searchFormEl.children[0].value = temp.textContent;
            submitBtnEl.click();
        })
    });

    // add event listeners to all search history items
    // on click, submit a form where searchFormEl.value is the value of the history item
    // document.querySelectorAll(".history-item").forEach(item => {
        
    // })
}

function updateTodayCard(cityName) {

    // gets CURRENT weather for city
    var fetchURL = "https://api.openweathermap.org/data/2.5/weather?q="
     + cityName + "&lang=en&units=imperial&appid=335df852494df73f05faf8726e22ed3a";

    fetch(fetchURL).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject({
                status: response.status,
                statusText: response.statusText
            });
        }
    }).then((data) => {

        // if there was an error message here before, replace it with default placeholder and reset color
        searchBarEl.setAttribute("placeholder", "Search a city...");
        searchBarEl.classList.remove("invalid-search");

        //update all elements in today card
        cityHeaderEl.textContent = data.name;
        todayDateEl.textContent = moment(data.dt + data.timezone, "X").format("dddd, MMMM Do");
        
        todayIconEl.style.backgroundImage = "url('http://openweathermap.org/img/wn/"
        + data.weather[0].icon + "@4x.png')";
        
        todayTempEl.innerHTML = "<span class='today-current-temp'>" + Math.floor(data.main.temp)
        + "°</span>, feels like " + Math.floor(data.main.feels_like) + "°";
        
        todayHighEl.textContent = "High: " + Math.round(data.main.temp_max) + "°"
        todayLowEl.textContent = "Low: " + Math.round(data.main.temp_min) + "°";
        todayWindEl.textContent = "Wind: " + data.wind.speed + "mph";
        todayHumidityEl.textContent = "Humidity: " + data.main.humidity + "%";
        todayVisibilityEl.textContent = "Visibility: " + (data.visibility / 1000).toFixed(1) + "km";

    }).catch(() => {
        searchBarEl.value = "";
    });
}

// update individual forecast cards
function updateForecastCard(data, index) {
    
    // console.log(data);

    // calculate the highest and lowest temps of the day
    var dayHigh = data[0].main.temp;
    var dayLow = data[0].main.temp;
    for (var i = 1; i < data.length; i++) {
        var temp = data[i].main.temp;
        if (temp > dayHigh) { dayHigh = temp; }
        if (temp < dayLow) { dayLow = temp; }
    }

    // calculate average wind speed
    var avgWind = 0;
    data.forEach(entry => {
        avgWind += entry.wind.speed;
    });
    avgWind = Math.floor(avgWind / 8);

    // calculate average humidity
    var avgHumidity = 0;
    data.forEach(entry => {
        avgHumidity += entry.main.humidity;
    });
    avgHumidity = Math.floor(avgHumidity / 8);

    // update each element in the forecast card at [index]
    forecastDayEls[index].textContent = moment(data[4].dt, "X").format("dddd");
    forecastDateEls[index].textContent = moment(data[4].dt, "X").format("MMM. D");

    // gets weather icon from 12:00pm, forces daytime icon
    forecastIconEls[index].style.backgroundImage = "url('http://openweathermap.org/img/wn/"
    + data[4].weather[0].icon.substring(0,2) + "d@4x.png')";

    forecastHighEls[index].textContent = "High: " + Math.round(dayHigh) + "°";
    forecastLowEls[index].textContent = "Low: " + Math.round(dayLow) + "°";
    forecastWindEls[index].textContent = "Wind: " + avgWind + "mph";
    forecastHumidityEls[index].textContent = "Humidity: " + avgHumidity + "%";

}

// update all forecast cards
function updateForecast(cityName) {

    var fetchURL = "https://api.openweathermap.org/data/2.5/forecast?q="
    + cityName + "&units=imperial&lang=en&appid=335df852494df73f05faf8726e22ed3a";

    fetch(fetchURL).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject({
                status: response.status,
                statusText: response.statusText
            });
        }
    }).then((data) => {

        // console.log(data);

        var splicedData = [[],[],[],[],[]];

        // separates response into days
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 8; j++) {
                splicedData[i].push(data.list[(i*8)+j]);
            }
        }

        // console.log(splicedData);

        // update each forecast card
        for (var i = 0; i < splicedData.length; i++) {
            updateForecastCard(splicedData[i], i);
        }

        // adds city to search history
        addToSearchHistory(cityName);
        
        // show weather dash ONLY after all responses have been processed
        document.querySelector(".weather-content").classList.add("show-w");
        // searchBarEl.focus();

    }).catch(error => {
        searchBarEl.value = "";
        if (error.status === 404) {
            searchBarEl.setAttribute("placeholder", "City not found, try again...");
        } else if (error.status === 400) {
            searchBarEl.setAttribute("placeholder", "No input, try again...");
        }
        searchBarEl.classList.add("invalid-search");
        submitBtnEl.style.animation = "btn-invalid 1s ease-out 1";
    });

}

// updates today card and all forecast cards
function updateDash(cityName) {
    updateTodayCard(cityName);
    updateForecast(cityName);
}

function forceTitleCase(str) {
    var arr = str.split(" ");
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].length > 1) { arr[i] = arr[i][0].toUpperCase() + arr[i].substring(1).toLowerCase(); }
        else { arr[i] = arr[i].toUpperCase(); }
    }
    return arr.join(" ");
}

function onSearch(e) {
    e.preventDefault();

    submitBtnEl.style.animation = "";
    var cityName = forceTitleCase(e.target.children[0].value);

    console.log("searched for " + cityName);

    // delete user's text
    e.target.children[0].value = "";

    // generates dashboard of the searched city
    updateDash(cityName);

}

function main() {

    searchFormEl.addEventListener("submit", onSearch);

}

init();
main();