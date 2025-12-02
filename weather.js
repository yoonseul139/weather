// ===== HTML 요소 선택 =====
let input = document.querySelector(".form-control"); // 검색창
let button = document.querySelector("#searchBtn"); // 검색 버튼
let place = document.querySelector("#location"); // 도시 이름 표시
let tempEls = document.querySelectorAll("li .temp"); // 3시간별 온도 표시
let iconEls = document.querySelectorAll("li img"); // 3시간별 아이콘 표시
let timeEls = document.querySelectorAll("li p"); // 3시간별 시간 표시
let placeCard = document.querySelector("#place"); // 현재 위치/도시 이름 카드
let tempCard = document.querySelector("#temp"); // 현재 온도 카드
let windCard = document.querySelector("#wind"); // 풍속 카드
let desCard = document.querySelector("#des"); // 날씨 설명 카드
let iconImg = document.querySelector("#icon"); // 현재 날씨 아이콘
let Img = document.querySelector("#Img"); // 만든 아이콘

// ===== API KEY =====
let APIkey = "149a57092e51db74ef69f988d0b6031a";

// ===== 페이지 로드 후 초기화 =====
document.addEventListener("DOMContentLoaded", () => {
  // 페이지 열리자마자 현재 위치 기반 날씨 가져오기
  getLocation();
});

// ===== 현재 위치 가져오기 =====
function getLocation() {
  if (navigator.geolocation) {
    // 위치 정보 허용 시 success 콜백 호출, 오류 시 error 콜백
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    // 브라우저가 위치 정보를 지원하지 않으면 기본 도시로 표시
    weather("Seoul");
  }
}

// ===== 위치 정보 접근 실패 시 처리 =====
function error(err) {
  console.warn(`위치 정보를 가져올 수 없습니다. (${err.code}): ${err.message}`);
  // 위치 정보 실패 시 기본 도시로 날씨 표시
  weather("Seoul");
}

// ===== 위치 기반 날씨 가져오기 =====
async function success(position) {
  let lat = position.coords.latitude; // 위도
  let lon = position.coords.longitude; // 경도

  // 현재 날씨 가져오기
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric&lang=kr`
  );
  let data = await response.json();

  console.log(data);

  renderWeatherCard(data); // 날씨 카드 표시

  // 3시간 간격 시간별 날씨 가져오기
  let forecastResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric&lang=kr`
  );
  let forecastData = await forecastResponse.json();
  renderForecast(forecastData); // 시간별 날씨 표시
}

// ===== 도시 검색 기능 =====
weather = async (cityname) => {
  // 현재 날씨
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${APIkey}&units=metric&lang=kr`
  );
  let data = await response.json();
  renderWeatherCard(data);

  // 3시간 간격 날씨
  let forecastResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${APIkey}&units=metric&lang=kr`
  );
  let forecastData = await forecastResponse.json();
  renderForecast(forecastData);
};

// ===== 버튼 클릭 및 Enter 키 이벤트 =====
button.addEventListener("click", () => {
  let city = input.value;
  input.value = "";
  weather(city);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    let city = input.value;
    input.value = "";
    weather(city);
  }
});

// ===== 현재 날씨 카드 렌더링 =====
function renderWeatherCard(data) {
  placeCard.textContent = data.name; // 도시 이름
  tempCard.textContent = Math.round(data.main.feels_like); // 체감온도
  place.textContent = data.name; // <p id="location"> 업데이트
  windCard.textContent = Math.round(data.wind.speed); // 풍속
  desCard.textContent = data.weather[0].description; // 날씨 설명

  let icon = data.weather[0].icon;
  // let iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
  // iconImg.src = iconUrl; // 날씨 아이콘 표시

  console.log("icon", icon);
  let myicon;
  if (icon == "01d" || icon == "01n") {
    myicon = "img/01d.png";
  } else if (icon == "02d" || icon == "02n") {
    myicon = "img/02d.png";
  } else if (icon == "03d" || icon == "03n") {
    myicon = "img/03d.png";
  } else if (icon == "04d" || icon == "04n") {
    myicon = "img/04d.png";
  } else if (icon == "09d" || icon == "09n") {
    myicon = "img/09d.png";
  } else if (icon == "10d" || icon == "10n") {
    myicon = "img/10d.png";
  } else if (icon == "11d" || icon == "11n") {
    myicon = "img/11d.png";
  } else if (icon == "13d" || icon == "13n") {
    myicon = "img/13d.png";
  } else if (icon == "50d" || icon == "50n") {
    myicon = "img/50d.png";
  }

  Img.src = myicon;
  console.log(myicon);
}

// ===== 시간별 3시간 간격 날씨 렌더링 =====
function renderForecast(data) {
  // 오전 6시 기준 시작 인덱스 찾기
  let startIndex = data.list.findIndex(
    (item) => item.dt_txt.slice(11, 16) === "06:00"
  );
  if (startIndex === -1) startIndex = 0; // 없으면 첫 데이터부터

  let temps = [];
  let labels = [];

  for (let i = 0; i < tempEls.length; i++) {
    let index = startIndex + i;
    if (!data.list[index]) break; // 데이터 없으면 종료

    // 온도 표시
    let temp = Math.round(data.list[index].main.temp);
    tempEls[i].textContent = `${temp}℃`;

    // 아이콘 표시
    let icon = data.list[index].weather[0].icon;
    console.log("icon", icon);

    let iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
    iconEls[i].src = iconUrl;

    // 시간 표시
    let label = data.list[index].dt_txt.slice(11, 16);
    timeEls[i].textContent = label;

    temps.push(temp);
    labels.push(label);
  }

  drawChart(labels, temps); // 차트 표시
}

let chart;

// ===== 차트 그리기 =====
function drawChart(labels, temps) {
  let ctx = document.querySelector("#weatherChart").getContext("2d");

  if (chart) {
    chart.destroy(); // 기존 차트 제거
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "시간별 온도",
          data: temps,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          min: -10,
          max: 30,
          ticks: { stepSize: 5 },
          title: {
            display: true,
            text: "온도",
            color: "orange",
            font: { size: 14 },
          },
        },
      },
    },
  });
}

// // 달력과 시계 //
// // 현재 날짜를 가져와 달력에 표시하고, 자정이 지나면 날짜를 업데이트하는 함수
function updateCalendar() {
  const now = new Date();

  // 1. 날짜 정보 설정
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const currentMonth = monthNames[now.getMonth()];
  const currentDay = now.getDate();
  const dayString = currentDay.toString().padStart(2, "0");
  const dayTens = dayString.charAt(0);
  const dayOnes = dayString.charAt(1);

  // 2. HTML 요소 업데이트
  document.querySelector("#month-card .card-text").textContent = currentMonth;
  document.querySelector("#day1-card .card-text").textContent = dayTens;
  document.querySelector("#day2-card .card-text").textContent = dayOnes;
}

// 현재 시간을 가져와 표시 영역을 1초마다 업데이트하는 함수 (추가됨)
function updateTime() {
  const now = new Date();

  // 시, 분, 초를 2자리 문자열로 포맷 (예: 9 -> 09)
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const timeString = `${hours}:${minutes}:${seconds}`;

  // 시간 표시 HTML 요소 업데이트
  document.getElementById("current-time").textContent = `TIME : ${timeString}`;

  // 자정(00:00:00) 직후에 날짜가 바뀌었는지 확인하여 달력을 업데이트
  if (hours === "00" && minutes === "00" && seconds === "01") {
    updateCalendar();
  }
}

// 페이지 로드 시 초기 날짜와 시간 설정
document.addEventListener("DOMContentLoaded", () => {
  updateCalendar(); // 초기 날짜 설정
  updateTime(); // 초기 시간 설정

  // 1. 날짜 확인을 위해 매 초마다 시간 업데이트 함수를 실행
  // 이 함수 내부에서 시간이 자정을 넘겼는지 확인하고 달력을 업데이트합니다.
  setInterval(updateTime, 1000);

  // 참고: 10초마다 날짜 업데이트를 확인하던 기존 로직은 updateTime() 내부로 이동했습니다.
});

// 날씨 아이콘 코드
// 01d : 맑음
// 02d : 약간구름
// 03d : 흐림
// 04d : 짙은 구름
// 09d : 소나기
// 10d : 비
// 11d: 천둥번개
// 13d : 눈
// 50d : 안개
