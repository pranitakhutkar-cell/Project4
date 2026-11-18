"use strict";

/*
    ==========================================
    WEATHER DASHBOARD
    Project 04 - Full Stack Web Development
    ==========================================

    APIs:
    1. Open-Meteo Geocoding API
    2. Open-Meteo Forecast API
*/


/* =========================
   API CONFIGURATION
========================= */

const API = {
    geocoding:
        "https://geocoding-api.open-meteo.com/v1/search",

    forecast:
        "https://api.open-meteo.com/v1/forecast"
};


/* =========================
   DOM ELEMENTS
========================= */

const form = document.getElementById("weatherForm");

const cityInput = document.getElementById("city");

const searchButton = document.getElementById("searchButton");

const statusElement = document.getElementById("status");

const cityNameElement = document.getElementById("cityName");

const countryNameElement =
    document.getElementById("countryName");

const currentTemperature =
    document.getElementById("currentTemperature");

const currentCondition =
    document.getElementById("currentCondition");

const currentIcon =
    document.getElementById("currentIcon");

const todayHigh =
    document.getElementById("todayHigh");

const todayLow =
    document.getElementById("todayLow");

const updatedTime =
    document.getElementById("updatedTime");

const weatherDate =
    document.getElementById("weatherDate");

const forecastContainer =
    document.getElementById("forecastContainer");

const currentDate =
    document.getElementById("currentDate");


/* =========================
   WEATHER CODE MAP
========================= */

const weatherCodes = {

    0: {
        label: "Clear Sky",
        icon: "☀"
    },

    1: {
        label: "Mainly Clear",
        icon: "🌤"
    },

    2: {
        label: "Partly Cloudy",
        icon: "⛅"
    },

    3: {
        label: "Overcast",
        icon: "☁"
    },

    45: {
        label: "Fog",
        icon: "🌫"
    },

    48: {
        label: "Depositing Rime Fog",
        icon: "🌫"
    },

    51: {
        label: "Light Drizzle",
        icon: "🌦"
    },

    53: {
        label: "Drizzle",
        icon: "🌦"
    },

    55: {
        label: "Heavy Drizzle",
        icon: "🌧"
    },

    61: {
        label: "Light Rain",
        icon: "🌦"
    },

    63: {
        label: "Rain",
        icon: "🌧"
    },

    65: {
        label: "Heavy Rain",
        icon: "🌧"
    },

    71: {
        label: "Light Snow",
        icon: "🌨"
    },

    73: {
        label: "Snow",
        icon: "❄"
    },

    75: {
        label: "Heavy Snow",
        icon: "❄"
    },

    80: {
        label: "Rain Showers",
        icon: "🌦"
    },

    81: {
        label: "Rain Showers",
        icon: "🌧"
    },

    82: {
        label: "Heavy Rain Showers",
        icon: "🌧"
    },

    95: {
        label: "Thunderstorm",
        icon: "⛈"
    },

    96: {
        label: "Thunderstorm with Hail",
        icon: "⛈"
    },

    99: {
        label: "Heavy Thunderstorm",
        icon: "⛈"
    }

};


/* =========================
   INITIALIZE
========================= */

document.addEventListener("DOMContentLoaded", () => {

    updateCurrentDate();

    loadLastCity();

});


/* =========================
   CURRENT DATE
========================= */

function updateCurrentDate() {

    const now = new Date();

    currentDate.textContent =
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

}


/* =========================
   FORM SUBMISSION
========================= */

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {

        showStatus(
            "Please enter a city name.",
            "error"
        );

        cityInput.focus();

        return;

    }


    if (city.length < 2) {

        showStatus(
            "Please enter a valid city name.",
            "error"
        );

        return;

    }


    setLoading(true);

    showStatus("Loading weather information...", "");


    try {

        const location = await findCity(city);

        const weather =
            await getWeather(
                location.latitude,
                location.longitude
            );


        renderCurrentWeather(
            location,
            weather
        );


        renderForecast(weather);


        localStorage.setItem(
            "weather_last_city",
            location.name
        );


        showStatus(
            `Weather loaded successfully for ${location.name}.`,
            "success"
        );


    } catch (error) {

        console.error(error);

        showStatus(
            error.message ||
            "Network problem. Please try again.",
            "error"
        );

    } finally {

        setLoading(false);

    }

});


/* =========================
   FIND CITY
========================= */

async function findCity(name) {

    const url =
        `${API.geocoding}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;


    let response;


    try {

        response = await fetch(url);

    } catch (error) {

        throw new Error(
            "Network problem. Please check your internet connection."
        );

    }


    if (!response.ok) {

        throw new Error(
            "The city search service is not responding."
        );

    }


    const data = await response.json();


    if (
        !data.results ||
        data.results.length === 0
    ) {

        throw new Error(
            "City not found. Please check the spelling and try again."
        );

    }


    const city = data.results[0];


    return {

        name: city.name,

        country: city.country || "",

        latitude: city.latitude,

        longitude: city.longitude

    };

}


/* =========================
   GET WEATHER
========================= */

async function getWeather(latitude, longitude) {

    const url =
        `${API.forecast}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
        `&forecast_days=5` +
        `&timezone=auto`;


    let response;


    try {

        response = await fetch(url);

    } catch (error) {

        throw new Error(
            "Network problem. Please check your internet connection."
        );

    }


    if (!response.ok) {

        throw new Error(
            "Could not load the weather forecast."
        );

    }


    return await response.json();

}


/* =========================
   RENDER CURRENT WEATHER
========================= */

function renderCurrentWeather(
    location,
    weather
) {

    const current =
        weather.current;


    const daily =
        weather.daily;


    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    cityNameElement.textContent =
        location.name;


    countryNameElement.textContent =
        location.country;


    currentTemperature.textContent =
        Math.round(
            current.temperature_2m
        );


    currentCondition.textContent =
        weatherInfo.label;


    currentIcon.textContent =
        weatherInfo.icon;


    todayHigh.textContent =
        `${Math.round(
            daily.temperature_2m_max[0]
        )}°`;


    todayLow.textContent =
        `${Math.round(
            daily.temperature_2m_min[0]
        )}°`;


    updatedTime.textContent =
        formatTime(
            current.time
        );


    weatherDate.textContent =
        formatDate(
            current.time
        );

}


/* =========================
   RENDER FORECAST
========================= */

function renderForecast(weather) {

    const daily =
        weather.daily;


    forecastContainer.innerHTML = "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(
                `${daily.time[i]}T00:00:00`
            );


        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const card =
            document.createElement("article");


        card.className =
            "forecast-day";


        if (i === 0) {

            card.classList.add("today");

        }


        const dayName =
            i === 0
                ? "Today"
                : date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short"
                    }
                );


        const high =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const low =
            Math.round(
                daily.temperature_2m_min[i]
            );


        card.innerHTML = `

            <div class="day-name">
                ${dayName}
            </div>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <div class="forecast-condition">
                ${weatherInfo.label}
            </div>

            <div class="forecast-temp">

                <span class="high">
                    ${high}°
                </span>

                <span class="low">
                    ${low}°
                </span>

            </div>

        `;


        forecastContainer.appendChild(card);

    }

}


/* =========================
   WEATHER INFORMATION
========================= */

function getWeatherInfo(code) {

    return (
        weatherCodes[code] || {
            label: "Unknown",
            icon: "☁"
        }
    );

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "short"
        }
    );

}


/* =========================
   FORMAT TIME
========================= */

function formatTime(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================
   STATUS MESSAGE
========================= */

function showStatus(
    message,
    type
) {

    statusElement.textContent =
        message;


    statusElement.className =
        "status";


    if (type) {

        statusElement.classList.add(type);

    }

}


/* =========================
   LOADING STATE
========================= */

function setLoading(isLoading) {

    searchButton.disabled =
        isLoading;


    if (isLoading) {

        searchButton.classList.add(
            "loading"
        );

        searchButton.innerHTML =
            "Loading...";

    } else {

        searchButton.classList.remove(
            "loading"
        );

        searchButton.innerHTML =
            "<span>Search Weather</span>";

    }

}


/* =========================
   LOAD LAST CITY
========================= */

function loadLastCity() {

    const lastCity =
        localStorage.getItem(
            "weather_last_city"
        );


    if (lastCity) {

        cityInput.value =
            lastCity;

        loadWeatherAutomatically(
            lastCity
        );

    }

}


/* =========================
   AUTOMATIC LOAD
========================= */

async function loadWeatherAutomatically(
    city
) {

    try {

        setLoading(true);

        showStatus(
            "Loading your last searched city...",
            ""
        );


        const location =
            await findCity(city);


        const weather =
            await getWeather(
                location.latitude,
                location.longitude
            );


        renderCurrentWeather(
            location,
            weather
        );


        renderForecast(weather);


        showStatus(
            `Showing weather for ${location.name}.`,
            "success"
        );


    } catch (error) {

        console.log(
            "Could not load saved city."
        );

    } finally {

        setLoading(false);

    }

}


/* =========================
   PREVENT VERY LONG INPUT
========================= */

cityInput.addEventListener(
    "input",
    function () {

        if (this.value.length > 60) {

            this.value =
                this.value.substring(
                    0,
                    60
                );

        }

    }
);