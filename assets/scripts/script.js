// API key: 335df852494df73f05faf8726e22ed3a

// DOM hooks
var searchFormEl = document.querySelector(".search-form")
var searchBarEl = document.querySelector("#searchBarContent")
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

var clientSearchHistory = JSON.parse(localStorage.getItem("w-search-hist")) || [];
// makes sure the local storage has an array in it
localStorage.setItem("w-search-hist", JSON.stringify(clientSearchHistory));

var searchHistoryListEl = document.querySelector(".history-list");

function init() {

    // show/hide the dropdown on search bar focus/unfocus
    // only show the dropdown if the user has search history
    searchBarEl.addEventListener("focus", () => { if (clientSearchHistory.length > 0) { dropdownEl.classList.add("show-dd"); }});
    searchBarEl.addEventListener("blur", () => { dropdownEl.classList.remove("show-dd"); });
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

    while (searchHistoryListEl.firstChild) {
        searchHistoryListEl.removeChild(searchHistoryListEl.firstChild);
    }

    clientSearchHistory = JSON.parse(localStorage.getItem("w-search-hist"))
    clientSearchHistory.forEach(item => {

        // <li class="history-item">San Francisco</li>
        var temp = document.createElement("li");
        temp.classList.add("history-item");
        temp.textContent = item;

        searchHistoryListEl.appendChild(temp);
    });

    document.querySelectorAll(".history-item").forEach(item => {
        item.addEventListener("click", () => {
            // console.log("user clicked " + item.textContent);
            searchFormEl.children[0].value = item.textContent;
            searchFormEl.submit();
        })
    })
}

function updateTodayCard(cityName) {

    

    // gets CURRENT weather for city
    var fetchURL = "https://api.openweathermap.org/data/2.5/weather?q="
     + cityName + "&lang=en&units=imperial&appid=335df852494df73f05faf8726e22ed3a";

    fetch(fetchURL).then((response) => response.json()).then((data) => {
        console.log(data);

        //update all elements in today card
        cityHeaderEl.textContent = data.name;
        todayDateEl.textContent = moment(data.dt + data.timezone, "X").format("dddd, MMMM Do"); // format: "Thursday, November 3rd"
        todayIconEl.style.backgroundImage = "url('http://openweathermap.org/img/wn/"
        + data.weather[0].icon + "@4x.png')";
        todayTempEl.innerHTML = "<span class='today-current-temp'>" + Math.floor(data.main.temp)
        + "°</span>, feels like " + Math.floor(data.main.feels_like) + "°";
        todayHighEl.textContent = "High: " + Math.floor(data.main.temp_max) + "°"
        todayLowEl.textContent = "Low: " + Math.floor(data.main.temp_min) + "°";
        todayWindEl.textContent = "Wind: " + data.wind.speed + "mph";
        todayHumidityEl.textContent = "Humidity: " + data.main.humidity + "%";
        todayVisibilityEl.textContent = "Visibility: " + (data.visibility / 1000).toFixed(1) + "km";
    });
}

function updateDash(cityName) {

    // DOM hook for weather container
    var weatherContainerEl = document.querySelector(".weather-content");

    updateTodayCard(cityName);

    // show weather container
    weatherContainerEl.classList.add("show-w"); // TODO: do this AFTER setting all the data
    
}

function onSearch(e) {
    e.preventDefault();
    var cityName = e.target.children[0].value;

    // delete user's text
    e.target.children[0].value = "";

    // add search to local history and update the UI
    addToSearchHistory(cityName);

    // generates dashboard of the searched city
    updateDash(cityName);

}

function main() {

    searchFormEl.addEventListener("submit", onSearch);

}

init();
main();