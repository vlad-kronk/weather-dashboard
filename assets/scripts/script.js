// API key: 335df852494df73f05faf8726e22ed3a

var searchFormEl = document.querySelector(".search-form")
var searchBarEl = document.querySelector("#searchBarContent")
var dropdownEl = document.querySelector(".history-dropdown")

var clientSearchHistory = JSON.parse(localStorage.getItem("w-search-hist")) || [];
localStorage.setItem("w-search-hist", JSON.stringify(clientSearchHistory));

var searchHistoryListEl = document.querySelector(".history-list");

function init() {

    // show/hide the dropdown on search bar focus/unfocus
    // only show the dropdown if the user has search history
    searchBarEl.addEventListener("focus", () => { if (clientSearchHistory.length > 0) { dropdownEl.classList.add("show"); }});
    searchBarEl.addEventListener("blur", () => { dropdownEl.classList.remove("show"); });
    refreshSearchHistoryElement();

    console.log(clientSearchHistory);
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

function onSearch(e) {
    e.preventDefault();
    var cityName = e.target.children[0].value;

    // delete user's text
    e.target.children[0].value = "";
    
    getCoords(cityName);

    // add search to local history and update the UI
    addToSearchHistory(cityName);
}

function getCoords(cityName) {

    var cityData;
    
    // get city coordinates from city name
    fetch("http://api.openweathermap.org/geo/1.0/direct?q="
        + cityName + "&limit=5&appid=335df852494df73f05faf8726e22ed3a")
        .then((response) => response.json())
        .then((data) => { console.log(data[0]); cityData = data[0]; });

    
}

function main() {

    searchFormEl.addEventListener("submit", onSearch);

}

init();
main();