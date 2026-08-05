const density={해운대해수욕장:['82% · 혼잡','청사포 · 19%'],광안리해수욕장:['76% · 혼잡','수영사적공원 · 22%'],서면:['51% · 보통','전포카페거리 · 29%'],흰여울문화마을:['24% · 여유','절영해안산책로 · 19%'],삼락생태공원:['18% · 여유','화명생태공원 · 16%']};
const cards=document.querySelector('#smallCards');
const realtimeNow=new Date();
const realtimeText=`${String(realtimeNow.getHours()).padStart(2,'0')}:${String(realtimeNow.getMinutes()).padStart(2,'0')} 갱신`;
document.querySelector('#syncTime').textContent=realtimeText;
document.querySelector('#updatedAt').textContent=`${realtimeText} · 데모 데이터`;
document.querySelector('.topbar-actions').insertAdjacentHTML('afterbegin','<button class="favorite-trigger" id="favoriteButton" type="button" aria-label="찜 목록 열기">♡<i id="favoriteBadge"></i></button>');
document.querySelector('.bottom-nav').insertAdjacentHTML('beforebegin','<section class="page" id="favorites"><div class="page-heading compact"><p class="eyebrow">MY FAVORITES</p><h1>나의 찜 목록</h1><p>관심 있는 부산 명소를 한곳에 모아 바로 확인하세요.</p></div><div class="favorite-summary"><span>브라우저에 안전하게 저장돼요.</span><b id="favoriteCount">0곳</b></div><div id="favoriteList"></div></section>');
document.querySelector('.detail-actions').classList.add('has-favorite');
document.querySelector('.detail-actions').insertAdjacentHTML('afterbegin','<button class="outline detail-favorite" id="detailFavoriteButton" type="button">♡ 찜하기</button>');
const pages=document.querySelectorAll('.page'),navs=document.querySelectorAll('.nav'),toast=document.querySelector('.toast');
function move(id){pages.forEach(p=>p.classList.toggle('active',p.id===id));navs.forEach(n=>n.classList.toggle('active',n.dataset.go===id));document.querySelector('.app-shell').scrollTop=0;if(id==='map'&&crowdMap)setTimeout(()=>crowdMap.invalidateSize(),0);if(id==='favorites')renderFavorites();}
document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.go)));
const weatherCodes={0:['맑음','☀'],1:['대체로 맑음','🌤'],2:['구름 조금','⛅'],3:['흐림','☁'],45:['안개','🌫'],48:['안개','🌫'],51:['약한 이슬비','🌦'],53:['이슬비','🌦'],55:['강한 이슬비','🌧'],61:['약한 비','🌦'],63:['비','🌧'],65:['강한 비','🌧'],71:['약한 눈','🌨'],73:['눈','🌨'],75:['강한 눈','❄'],80:['소나기','🌦'],81:['소나기','🌧'],82:['강한 소나기','⛈'],95:['뇌우','⛈'],96:['우박·뇌우','⛈'],99:['강한 우박·뇌우','⛈']};
const busanEvents=[
 {state:'진행 중',title:'2026 북항 오션 SUP FESTA',date:'7.31 – 8.9',place:'부산항 북항 일원',note:'바다 위 SUP 체험과 북항의 여름 풍경을 함께 즐겨요.'},
 {state:'곧 시작',title:'제30회 부산바다축제',date:'8.7 – 8.13',place:'다대포해수욕장 일원',note:'다대포 선셋과 함께하는 부산 대표 여름 축제예요.'},
 {state:'예정',title:'2026 세계도서관정보대회',date:'8.10 – 8.13',place:'부산 일원',note:'세계의 도서관과 지식 문화를 부산에서 만나요.'},
 {state:'예정',title:'부산인디커넥트페스티벌 2026',date:'8.14 – 8.16',place:'부산 일원',note:'다양한 인디게임과 개발자를 만나는 글로벌 행사예요.'}
];
let weatherLoaded=false;
function weatherLabel(code){return weatherCodes[code]||['날씨 정보','◌'];}
function weatherTip(current){if(current.precipitation>0||[61,63,65,80,81,82,95,96,99].includes(current.weather_code))return '비가 내리고 있어요. 실내 전시나 전통시장 중심 코스를 추천해요.';if(current.temperature_2m>=30)return '기온이 높아요. 한낮 야외 이동을 줄이고 그늘과 실내 휴식지를 포함하세요.';if(current.wind_speed_10m>=25)return '바람이 강해요. 해안 산책로와 전망대 이용 시 안전에 유의하세요.';return '야외 관광하기 무난한 날씨예요. 생태공원과 산책 명소를 둘러보세요.';}
async function loadBusanWeather(){
 if(weatherLoaded)return;weatherLoaded=true;
 const panel=document.querySelector('#weatherPanel');
 try{
  const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.1796&longitude=129.0756&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=3');
  if(!response.ok)throw new Error('weather');
  const data=await response.json(),current=data.current,[description,icon]=weatherLabel(current.weather_code);
  const forecast=data.daily.time.map((date,index)=>{const [label,forecastIcon]=weatherLabel(data.daily.weather_code[index]);const day=new Intl.DateTimeFormat('ko-KR',{weekday:'short'}).format(new Date(`${date}T12:00:00`));return `<article class="forecast-card"><b>${day}</b><span>${forecastIcon}</span><small>${Math.round(data.daily.temperature_2m_min[index])}° / ${Math.round(data.daily.temperature_2m_max[index])}°</small><small>비 ${data.daily.precipitation_probability_max[index]}%</small></article>`;}).join('');
  panel.innerHTML=`<article class="weather-now"><div class="weather-now-top"><div><small>부산광역시 · 실시간</small><h2>${Math.round(current.temperature_2m)}°</h2></div><span class="weather-icon">${icon}</span></div><p class="weather-desc">${description}</p><div class="weather-metrics"><div><span>체감온도</span><b>${Math.round(current.apparent_temperature)}°</b></div><div><span>강수량</span><b>${current.precipitation} mm</b></div><div><span>바람</span><b>${Math.round(current.wind_speed_10m)} km/h</b></div></div></article><p class="travel-weather-tip">AI 여행 팁 · ${weatherTip(current)}</p><div class="forecast-list">${forecast}</div>`;
  const homeSummary=document.querySelector('#homeWeatherSummary');if(homeSummary)homeSummary.textContent=`${description} · ${Math.round(current.temperature_2m)}°`;
 }catch(error){panel.innerHTML='<div class="weather-error">날씨 정보를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.</div>';weatherLoaded=false;}
}
function renderEvents(){const list=document.querySelector('#eventList');if(list)list.innerHTML=busanEvents.map(event=>`<article class="event-card"><div class="event-card-top"><span class="event-state">${event.state}</span><strong>${event.date}</strong></div><h2>${event.title}</h2><p>${event.note}</p><strong>⌖ ${event.place}</strong></article>`).join('');}
function setInfoTab(tab){const weather=tab==='weather';document.querySelector('#weatherPanel').hidden=!weather;document.querySelector('#eventsPanel').hidden=weather;document.querySelectorAll('.info-tabs [data-info-tab]').forEach(button=>button.classList.toggle('active',button.dataset.infoTab===tab));if(weather)loadBusanWeather();}
document.querySelectorAll('[data-info-tab]').forEach(button=>button.addEventListener('click',()=>setInfoTab(button.dataset.infoTab)));
renderEvents();loadBusanWeather();
document.querySelectorAll('.map-pin').forEach(pin=>pin.addEventListener('click',()=>{const [level,alt]=density[pin.dataset.place];document.querySelector('#placeTitle').textContent=pin.dataset.place;document.querySelector('#placeDensity').innerHTML=level.replace(' · ',' <em>')+'</em>';document.querySelector('#placeAlt').textContent=alt;}));
let selectedFilter='전체';
document.querySelectorAll('.filter-row button').forEach(button=>button.addEventListener('click',()=>{selectedFilter=button.dataset.filter;document.querySelectorAll('.filter-row button').forEach(b=>b.classList.remove('active'));button.classList.add('active');renderRecommendations(selectedFilter);toast.textContent=`${button.textContent} 테마에 맞는 장소를 찾았어요`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);}));
let selectedDuration='half';
let selectedRegion='oldtown';
let requestedSpot=null;

const routeRegions={
 oldtown:{label:'원도심',title:'부산 원도심의 골목과 시장',districts:'중구 · 동구',stops:[['용두산공원·부산타워','부산항을 내려다보는 전망'],['국제시장','로컬 먹거리와 시장 탐방'],['초량 이바구길','근현대 골목 산책'],['부산항 북항','항구 야경과 산책'],['보수동책방골목','책방에서 쉬어가기']]},
 west:{label:'서부·사하',title:'송도에서 다대포까지의 해안선',districts:'서구 · 사하구',stops:[['송도해수욕장','바다 산책과 케이블카 뷰'],['암남공원','숲길과 해안 절벽'],['감천문화마을','색채 골목과 문화 탐방'],['다대포해수욕장','일몰과 낙조 명소'],['몰운대','고요한 해안 산책']]},
 yeongdo:{label:'영도',title:'영도의 푸른 오후',districts:'영도구',stops:[['국립해양박물관','바다 이야기를 만나는 전시'],['흰여울문화마을','바다를 곁에 둔 골목'],['절영해안산책로','파도 소리를 듣는 산책'],['태종대','절벽과 등대 전망'],['영도 로컬 카페','Discovera 쿠폰 사용 가능']]},
 urban:{label:'도심·온천',title:'도심의 카페와 역사 산책',districts:'부산진구 · 동래구 · 연제구',stops:[['서면','도심 쇼핑과 식사'],['전포카페거리','개성 있는 로컬 카페'],['동래읍성','역사 문화 산책'],['온천천','물가를 따라 걷는 휴식'],['부산아시아드주경기장','도심 스포츠 랜드마크']]},
 south:{label:'남부·수영',title:'해안 산책과 광안 야경',districts:'남구 · 수영구',stops:[['오륙도스카이워크','해안 절벽 위 전망'],['이기대 해안산책로','바다를 잇는 트레킹'],['광안리해수욕장','광안대교 해변 풍경'],['민락수변공원','수변 야경과 휴식'],['수영사적공원','고즈넉한 역사 산책']]},
 river:{label:'낙동강',title:'낙동강 생태와 로컬 시장',districts:'북구 · 사상구 · 강서구',stops:[['화명생태공원','강변 자연과 피크닉'],['구포시장','시장 먹거리 체험'],['삼락생태공원','자전거와 습지 산책'],['대저생태공원','계절 꽃과 넓은 들판'],['가덕도','섬 풍경으로 떠나는 드라이브']]},
 east:{label:'동부권',title:'동부 해안과 산사의 하루',districts:'해운대구 · 금정구 · 기장군 · 연제구',stops:[['해운대해수욕장','도심 해변의 활기'],['청사포','바다와 해안열차 풍경'],['범어사','고요한 산사 탐방'],['금정산성','성곽을 따라 걷기'],['해동용궁사','바다 위 사찰의 풍경'],['오시리아 관광단지','저녁 즐길 거리와 휴식'],['배산','도심을 바라보는 가벼운 산책']]}
};
const durationPlans={
 half:{label:'반나절',meta:'약 4시간 · 도보+대중교통',description:'한 권역에 머물며 덜 붐비는 시간대를 따라 천천히 즐기는 코스',count:3,times:['13:00','14:20','15:50']},
 day:{label:'하루',meta:'약 8시간 · 도보+대중교통',description:'낮부터 야경까지, 명소와 지역 상권을 함께 만나는 하루 코스',count:4,times:['10:00','11:40','14:10','16:40']},
 stay:{label:'1박 2일',meta:'1박 2일 · 대중교통+도보',description:'첫날은 대표 명소, 다음 날은 숨은 공간까지 여유 있게 잇는 여행',count:5,times:['1일차 10:00','1일차 12:00','1일차 15:00','1일차 18:00','2일차 10:30']}
};
const districtRouteRegion={중구:'oldtown',동구:'oldtown',서구:'west',사하구:'west',영도구:'yeongdo',부산진구:'urban',동래구:'urban',연제구:'urban',남구:'south',수영구:'south',북구:'river',사상구:'river',강서구:'river',해운대구:'east',금정구:'east',기장군:'east'};
function createCourseForSpot(spot){
 requestedSpot=spot;selectedRegion=districtRouteRegion[spot.district]||'oldtown';
 document.querySelectorAll('.route-area-row button').forEach(button=>button.classList.toggle('active',button.dataset.region===selectedRegion));
 renderCourse();move('course');
}
function routeCrowd(name){const spot=touristSpots.find(item=>item.name===name);return spot?`혼잡도 ${spot.crowd}% · ${spot.crowd>=70?'혼잡':spot.crowd>=40?'보통':'여유'}`:'AI 추천 · 지역 체험';}
function getCurrentRouteStops(){const plan=durationPlans[selectedDuration];const region=routeRegions[selectedRegion];const routeStops=requestedSpot?[[requestedSpot.name,'선택한 명소 · 이곳에서 여행 시작'],...region.stops.filter(stop=>stop[0]!==requestedSpot.name)]:region.stops;return routeStops.slice(0,plan.count);}
function renderCourse(){
 const plan=durationPlans[selectedDuration];
 const region=routeRegions[selectedRegion];
 const stops=getCurrentRouteStops();
 const title=requestedSpot?`${requestedSpot.name}을(를) 담은 ${region.label} 코스`:region.title;
 const description=requestedSpot?`선택한 ${requestedSpot.name}을(를) 첫 방문지로 넣고, 가까운 명소를 이어 드려요.`:plan.description;
 document.querySelector('#courseCard').innerHTML=`<div class="course-top"><span>${plan.label} AI 추천 코스 · ${region.label}</span><b>${plan.meta}</b></div><h2>${title}</h2><p>${description}<br />${region.districts} 명소를 중심으로 구성했어요.</p><ol>${stops.map((stop,index)=>`<li><time>${plan.times[index]}</time><i class="timeline-dot" aria-hidden="true"></i><span><b>${stop[0]}</b><small>${routeCrowd(stop[0])} · ${stop[1]}</small></span></li>`).join('')}</ol><button class="outline course-map-button">지도에서 코스 보기</button><button class="primary route-start">이 코스로 여행 시작하기</button></article>`;
 document.querySelector('.route-start').addEventListener('click',()=>move('stamp'));
 document.querySelector('.course-map-button').addEventListener('click',()=>{move('map');setTimeout(()=>{updateMapRoute(true);crowdMap&&crowdMap.invalidateSize();},0);});
 if(crowdMap)updateMapRoute();
}
document.querySelectorAll('.course-switch button').forEach(button=>button.addEventListener('click',()=>{selectedDuration=button.dataset.duration;document.querySelectorAll('.course-switch button').forEach(b=>b.classList.toggle('active',b===button));renderCourse();}));
document.querySelectorAll('.route-area-row button').forEach(button=>button.addEventListener('click',()=>{selectedRegion=button.dataset.region;requestedSpot=null;document.querySelectorAll('.route-area-row button').forEach(b=>b.classList.toggle('active',b===button));renderCourse();}));
document.querySelector('.course-btn').addEventListener('click',()=>{const spot=touristSpots.find(item=>item.name===document.querySelector('.course-btn').dataset.course);if(spot)createCourseForSpot(spot);else move('course');});

// 부산 실제 지도를 기준으로 선정한 32개 관광지를 표시합니다.
// 운영 환경에서는 /api/crowd가 통신사·교통·주차·날씨 데이터를 합산한
// { places: [{ id, crowd }] } 형식의 익명 집계 결과를 반환하도록 연결합니다.
const touristSpots=[
 ['용두산공원·부산타워','중구',35.1007,129.0329],['국제시장','중구',35.1022,129.0286],['송도해수욕장','서구',35.0771,129.0204],['암남공원','서구',35.0717,129.0169],['초량 이바구길','동구',35.1161,129.0351],['부산항 북항','동구',35.1178,129.0461],['흰여울문화마을','영도구',35.0782,129.0446],['태종대','영도구',35.0510,129.0872],['서면','부산진구',35.1579,129.0592],['전포카페거리','부산진구',35.1564,129.0655],['동래읍성','동래구',35.2053,129.0820],['온천천','동래구',35.2052,129.1035],['오륙도스카이워크','남구',35.0994,129.1206],['이기대 해안산책로','남구',35.1140,129.1191],['화명생태공원','북구',35.2248,129.0063],['구포시장','북구',35.2116,128.9995],['해운대해수욕장','해운대구',35.1587,129.1604],['청사포','해운대구',35.1602,129.1917],['감천문화마을','사하구',35.0975,129.0106],['다대포해수욕장','사하구',35.0463,128.9654],['범어사','금정구',35.2761,129.0682],['금정산성','금정구',35.2676,129.0922],['대저생태공원','강서구',35.2117,128.9713],['가덕도','강서구',35.0177,128.8310],['부산아시아드주경기장','연제구',35.1909,129.0665],['배산','연제구',35.1762,129.0976],['광안리해수욕장','수영구',35.1532,129.1186],['민락수변공원','수영구',35.1546,129.1269],['삼락생태공원','사상구',35.1684,128.9784],['사상근린공원','사상구',35.1590,128.9939],['해동용궁사','기장군',35.1880,129.2231],['오시리아 관광단지','기장군',35.1960,129.2142]
].map(([name,district,lat,lng],index)=>({id:`spot-${index}`,name,district,lat,lng,crowd:14+(index*17)%74}));
const spotThemes={
 '용두산공원·부산타워':'문화·전시','국제시장':'맛집·시장','송도해수욕장':'자연·산책','암남공원':'자연·산책','초량 이바구길':'문화·전시','부산항 북항':'문화·전시','흰여울문화마을':'문화·전시','태종대':'자연·산책','서면':'맛집·시장','전포카페거리':'맛집·시장','동래읍성':'문화·전시','온천천':'자연·산책','오륙도스카이워크':'자연·산책','이기대 해안산책로':'자연·산책','화명생태공원':'자연·산책','구포시장':'맛집·시장','해운대해수욕장':'자연·산책','청사포':'자연·산책','감천문화마을':'문화·전시','다대포해수욕장':'자연·산책','범어사':'문화·전시','금정산성':'문화·전시','대저생태공원':'자연·산책','가덕도':'자연·산책','부산아시아드주경기장':'문화·전시','배산':'자연·산책','광안리해수욕장':'자연·산책','민락수변공원':'맛집·시장','삼락생태공원':'자연·산책','사상근린공원':'자연·산책','해동용궁사':'문화·전시','오시리아 관광단지':'문화·전시'
};
const spotImages={
 '용두산공원·부산타워':'assets/yongdusan.jpg','국제시장':'assets/gukje.jpg','송도해수욕장':'assets/songdo.webp','암남공원':'assets/amnam.jpg','초량 이바구길':'assets/choryang.jpg','부산항 북항':'assets/northport.jpg','흰여울문화마을':'assets/huinnyeoul-cultural-village.jpg','태종대':'assets/taejongdae.jpg','서면':'assets/seomyeon.jpg','전포카페거리':'assets/jeonpo.jpg','동래읍성':'assets/dongnae.webp','온천천':'assets/oncheon.webp','오륙도스카이워크':'assets/oryukdo.jpg','이기대 해안산책로':'assets/igidae.jpg','화명생태공원':'assets/hwamyeong.jpg','구포시장':'assets/gupo.jpg','해운대해수욕장':'assets/haeundae.jpg','청사포':'assets/cheongsapo.jpg','감천문화마을':'assets/gamcheon.jpg','다대포해수욕장':'assets/dadaepo.webp','범어사':'assets/beomeosa.jpg','금정산성':'assets/geumjeongsanseong.jpg','대저생태공원':'assets/daejeo.jpg','가덕도':'assets/gadeok.webp','부산아시아드주경기장':'assets/asiad.jpg','배산':'assets/baesan.webp','광안리해수욕장':'assets/gwangalli.jpg','민락수변공원':'assets/millak.webp','삼락생태공원':'assets/samrak.jpg','사상근린공원':'assets/sasang-park.jpg','해동용궁사':'assets/haedong.jpg','오시리아 관광단지':'assets/osiria.jpg'
};
touristSpots.forEach(spot=>{spot.theme=spotThemes[spot.name];spot.baseCrowd=spot.crowd;});
const equityDistricts=new Set(['강서구','사상구','북구','사하구']);
const isEquitySpot=spot=>equityDistricts.has(spot.district);
const purposeStoreKey='discovera-travel-purpose-v1';
const travelPurposes={nature:{label:'바다·자연 산책',theme:'자연·산책'},culture:{label:'역사·문화 탐방',theme:'문화·전시'},food:{label:'맛집·시장 여행',theme:'맛집·시장'},balance:{label:'숨은 지역 발견',theme:null}};
let travelPurpose=travelPurposes[localStorage.getItem(purposeStoreKey)]||travelPurposes.balance;
const purposeMatch=spot=>travelPurpose.theme===spot.theme?1:0;
const equityFirst=(a,b)=>(Number(isEquitySpot(b))-Number(isEquitySpot(a)))||(purposeMatch(b)-purposeMatch(a))||(a.crowd-b.crowd);
const favoriteStoreKey='discovera-favorites-v1';
const loadFavorites=()=>{try{const saved=JSON.parse(localStorage.getItem(favoriteStoreKey)||'[]');return new Set(Array.isArray(saved)?saved:[]);}catch{return new Set();}};
let favoriteSpots=loadFavorites();
const isFavorite=spot=>favoriteSpots.has(spot.id);
const saveFavorites=()=>localStorage.setItem(favoriteStoreKey,JSON.stringify([...favoriteSpots]));
function syncFavoriteUi(){
 const badge=document.querySelector('#favoriteBadge');badge.textContent=favoriteSpots.size?String(favoriteSpots.size):'';
 const featured=touristSpots.find(spot=>spot.id===document.querySelector('#featuredRecommendation').dataset.spotId),heart=document.querySelector('#featuredRecommendation .heart');
 if(featured){heart.textContent=isFavorite(featured)?'♥':'♡';heart.classList.toggle('active',isFavorite(featured));heart.setAttribute('aria-label',isFavorite(featured)?`${featured.name} 찜 해제`:`${featured.name} 찜하기`);}
 const detailButton=document.querySelector('#detailFavoriteButton');
 if(activeDetailSpot){detailButton.textContent=isFavorite(activeDetailSpot)?'♥ 찜 해제':'♡ 찜하기';detailButton.classList.toggle('active',isFavorite(activeDetailSpot));}
}
function toggleFavorite(spot){
 if(!spot)return;const removing=isFavorite(spot);removing?favoriteSpots.delete(spot.id):favoriteSpots.add(spot.id);saveFavorites();syncFavoriteUi();renderRecommendations(selectedFilter);renderFavorites();showToast(removing?`${spot.name}을(를) 찜 목록에서 뺐어요.`:`${spot.name}을(를) 찜 목록에 저장했어요.`);
}
function renderFavorites(){
 const container=document.querySelector('#favoriteList'),spots=touristSpots.filter(isFavorite);
 document.querySelector('#favoriteCount').textContent=`${spots.length}곳`;
 if(!spots.length){container.innerHTML='<div class="favorite-empty"><span>♡</span><h2>아직 찜한 명소가 없어요</h2><p>AI 추천에서 하트를 누르면<br>관심 명소가 여기에 저장돼요.</p><button class="primary" data-open-recommend>AI 추천 둘러보기</button></div>';container.querySelector('[data-open-recommend]').addEventListener('click',()=>move('recommend'));return;}
 container.innerHTML=`<div class="favorite-list">${spots.map(spot=>`<article class="favorite-list-card" data-favorite-list-id="${spot.id}" role="button" tabindex="0"><img src="${spotImages[spot.name]||''}" alt="${spot.name}"><span><b>${spot.name}</b><small>${spot.district} · ${spot.theme}</small><em>현재 혼잡도 ${spot.crowd}% · ${crowdText(spot.crowd)}</em></span><button class="favorite-remove" type="button" aria-label="${spot.name} 찜 해제">♥</button></article>`).join('')}</div>`;
 container.querySelectorAll('.favorite-list-card').forEach(card=>{const spot=touristSpots.find(item=>item.id===card.dataset.favoriteListId);card.addEventListener('click',event=>{if(event.target.closest('.favorite-remove')){event.stopPropagation();toggleFavorite(spot);return;}openSpotDetail(spot);});card.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('button')){event.preventDefault();openSpotDetail(spot);}});});
}
function renderRecommendations(filter='전체'){
 const visible=(filter==='전체'?touristSpots:touristSpots.filter(spot=>spot.theme===filter)).slice().sort(equityFirst);
 document.querySelector('#recommendTitle').textContent=filter==='전체'?`지역 균형을 위한 부산 명소 ${visible.length}곳`:`${filter} 명소 · 지역 균형 우선 추천`;
 cards.innerHTML=visible.map(spot=>{const image=spotImages[spot.name];const level=spot.crowd>=70?'high':spot.crowd>=40?'medium':'low';return `<article class="mini-card spot-card" data-spot-id="${spot.id}" role="button" tabindex="0" aria-label="${spot.name} 상세 정보 보기"><button class="favorite-card ${isFavorite(spot)?'active':''}" type="button" aria-label="${isFavorite(spot)?`${spot.name} 찜 해제`:`${spot.name} 찜하기`}">${isFavorite(spot)?'♥':'♡'}</button><div class="mini-art ${level}">${image?`<img src="${image}" alt="${spot.name}">`:`<span>${spot.theme==='자연·산책'?'♧':spot.theme==='문화·전시'?'⌂':'✦'}</span>`}</div><div class="spot-meta"><b>${spot.name}</b><p>${spot.district} · 혼잡도 <strong class="${level}">${spot.crowd}%</strong></p><small>${spot.theme}</small></div></article>`;}).join('');
 cards.querySelectorAll('.spot-card').forEach(card=>{const spot=touristSpots.find(item=>item.id===card.dataset.spotId);card.querySelector('.favorite-card').addEventListener('click',event=>{event.stopPropagation();toggleFavorite(spot);});card.addEventListener('click',()=>openSpotDetail(spot));card.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('button')){event.preventDefault();openSpotDetail(spot);}});});
}
function renderEquitySpotlight(){
 const picks=touristSpots.filter(isEquitySpot).slice().sort((a,b)=>(purposeMatch(b)-purposeMatch(a))||(a.crowd-b.crowd)).slice(0,3);
 const list=document.querySelector('#equitySpotList');
 list.innerHTML=picks.map(spot=>`<button class="equity-spot" type="button" data-equity-id="${spot.id}"><img src="${spotImages[spot.name]||''}" alt=""><span><b>${spot.name}</b><small>${spot.district} · 지역 상권 연결 추천</small></span><em class="equity-badge ${spot.crowd>=40?'medium':''}">혼잡도 ${spot.crowd}%</em></button>`).join('');
 list.querySelectorAll('.equity-spot').forEach(button=>button.addEventListener('click',()=>openSpotDetail(touristSpots.find(spot=>spot.id===button.dataset.equityId))));
}
function renderFeaturedRecommendation(){
 const pick=touristSpots.filter(isEquitySpot).slice().sort((a,b)=>(purposeMatch(b)-purposeMatch(a))||(a.crowd-b.crowd))[0]||[...touristSpots].sort((a,b)=>a.crowd-b.crowd)[0];
 const image=spotImages[pick.name];
 const crowd=document.querySelector('#featuredCrowd');
 crowd.textContent=`혼잡도 ${pick.crowd}% · ${pick.crowd>=70?'혼잡':pick.crowd>=40?'보통':'여유'}`;
 crowd.className=`pill ${pick.crowd>=40?'':'calm'}`;
 document.querySelector('#featuredName').textContent=pick.name;
 document.querySelector('#featuredDistrict').textContent=`${pick.district} · 관광 수요 분산과 지역 상권 연결을 위해 우선 추천해요.`;
 document.querySelector('#featuredTheme').textContent=`#${pick.theme}`;
 document.querySelector('#featuredImage').src=image||'';
 document.querySelector('#featuredImage').alt=`${pick.name} 풍경`;
 document.querySelector('.course-btn').dataset.course=pick.name;
 document.querySelector('#featuredRecommendation').dataset.spotId=pick.id;
 const heart=document.querySelector('#featuredRecommendation .heart');heart.textContent=isFavorite(pick)?'♥':'♡';heart.classList.toggle('active',isFavorite(pick));heart.setAttribute('aria-label',isFavorite(pick)?`${pick.name} 찜 해제`:`${pick.name} 찜하기`);
}
renderRecommendations();
renderEquitySpotlight();
renderCourse();

const stampStoreKey='discovera-demo-stamps-v1';
const stampLimit=touristSpots.length;
const couponRewards=[
 {threshold:3,title:'지역 카페·베이커리 10% 할인',code:'DISCOVERA10'},
 {threshold:6,title:'전통시장 먹거리 2,000원 할인',code:'BUSANMARKET'},
 {threshold:9,title:'지역 체험·전시 15% 할인',code:'LOCAL15'},
 {threshold:12,title:'부산 로컬 패스 5,000원 할인',code:'BUSANPASS'}
];
// 시연 초기화 링크: ?reset-stamps=1로 접속하면 이 기기의 스탬프만 한 번 초기화합니다.
if(new URLSearchParams(location.search).get('reset-stamps')==='1'){
 localStorage.removeItem(stampStoreKey);
 history.replaceState({},'',`${location.pathname}${location.hash}`);
}
const loadStamps=()=>{try{const saved=JSON.parse(localStorage.getItem(stampStoreKey)||'[]');return Array.isArray(saved)?saved:[];}catch{return[];}};
let earnedStamps=loadStamps();
const saveStamps=()=>localStorage.setItem(stampStoreKey,JSON.stringify(earnedStamps));
const distanceInMeters=(lat1,lng1,lat2,lng2)=>{const radius=6371000;const radians=value=>value*Math.PI/180;const dLat=radians(lat2-lat1),dLng=radians(lng2-lng1);const a=Math.sin(dLat/2)**2+Math.cos(radians(lat1))*Math.cos(radians(lat2))*Math.sin(dLng/2)**2;return radius*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));};
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400);}
function renderStamp(){
 const grid=document.querySelector('#stampGrid');
 const picker=document.querySelector('#demoPlace');
 document.querySelector('#stampCount').innerHTML=`${String(earnedStamps.length).padStart(2,'0')}<small>/ ${stampLimit}</small>`;
 picker.innerHTML=touristSpots.map(spot=>`<option value="${spot.id}">${spot.district} · ${spot.name}</option>`).join('');
 grid.classList.add('stamp-collection');
 const stampHeading=grid.previousElementSibling;
 if(stampHeading&&stampHeading.classList.contains('subheading'))stampHeading.textContent=`전체 명소 스탬프 · ${earnedStamps.length} / ${stampLimit}`;
 if(!document.querySelector('#stampCollectionIntro')){
  const intro=document.createElement('p');intro.id='stampCollectionIntro';intro.className='stamp-collection-intro';intro.innerHTML='<b>부산 16개 구·군 스탬프 투어</b>현재 등록된 모든 명소를 방문 인증해 나만의 부산 패스포트를 완성해 보세요.';grid.insertAdjacentElement('beforebegin',intro);
 }
 grid.innerHTML=touristSpots.map(spot=>earnedStamps.includes(spot.id)?`<div class="earned">✓<span>${spot.district}</span><em>${spot.name}</em></div>`:`<div>＋<span>${spot.district}</span><em>${spot.name}</em></div>`).join('');
 const unlocked=earnedStamps.length>=3;
 const status=document.querySelector('#couponStatus'),text=document.querySelector('#couponText'),button=document.querySelector('#couponButton'),card=document.querySelector('#couponCard');
 status.textContent=unlocked?'스탬프 3개 달성 · 쿠폰 사용 가능':`스탬프 ${Math.max(0,3-earnedStamps.length)}개 더 모으면 리워드 해제`;
 text.textContent=unlocked?'보유 쿠폰과 다음 리워드를 목록에서 확인하세요.':'방문 인증 후 지역 상권 할인 쿠폰이 열려요.';
 button.disabled=!unlocked;button.textContent=unlocked?'쿠폰 목록':'잠김';card.classList.toggle('coupon-unlocked',unlocked);
 let couponList=document.querySelector('#couponList');
 if(!couponList){couponList=document.createElement('section');couponList.id='couponList';couponList.className='coupon-list';couponList.hidden=true;card.insertAdjacentElement('afterend',couponList);}
 couponList.innerHTML=couponRewards.map(reward=>{const available=earnedStamps.length>=reward.threshold;return `<article class="coupon-item ${available?'unlocked':''}"><span class="coupon-tier">${reward.threshold}+</span><div><b>${reward.title}</b><small>${available?'제휴 지역 상점에서 쿠폰 코드를 제시하세요.':`스탬프 ${Math.max(0,reward.threshold-earnedStamps.length)}개를 더 모으면 열려요.`}</small></div><span class="coupon-code ${available?'':'locked'}">${available?reward.code:'잠김'}</span></article>`;}).join('');
}
function earnStamp(spot,source){
 if(earnedStamps.includes(spot.id)){showToast(`${spot.name} 스탬프는 이미 적립됐어요.`);return;}
 if(earnedStamps.length>=stampLimit){showToast(`이번 달 스탬프 ${stampLimit}개를 모두 모았어요!`);return;}
 earnedStamps=[...earnedStamps,spot.id];saveStamps();renderStamp();showToast(`${source} ${spot.name} 스탬프를 적립했어요!`);
}
function certifyCurrentLocation(){
 if(!navigator.geolocation){showToast('이 브라우저에서는 위치 인증을 지원하지 않아요. 데모 인증을 이용해 주세요.');return;}
 const button=document.querySelector('#locationVerify');button.disabled=true;button.textContent='현재 위치 확인 중…';
 navigator.geolocation.getCurrentPosition(position=>{
  const {latitude,longitude}=position.coords;
  const closest=touristSpots.map(spot=>({...spot,distance:distanceInMeters(latitude,longitude,spot.lat,spot.lng)})).sort((a,b)=>a.distance-b.distance)[0];
  button.disabled=false;button.textContent='현재 위치로 방문 인증';
  if(closest.distance<=350)earnStamp(closest,'방문 인증 완료 ·');
  else showToast(`가장 가까운 ${closest.name}까지 약 ${Math.round(closest.distance)}m예요. 350m 안에서 인증할 수 있어요.`);
 },()=>{button.disabled=false;button.textContent='현재 위치로 방문 인증';showToast('위치 권한을 허용해 주세요. 발표 중에는 데모 인증을 사용할 수 있어요.');},{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
}
document.querySelector('#locationVerify').addEventListener('click',certifyCurrentLocation);
document.querySelector('#demoVerify').addEventListener('click',()=>{const selected=touristSpots.find(spot=>spot.id===document.querySelector('#demoPlace').value);if(selected)earnStamp(selected,'데모 인증 완료 ·');});
document.querySelector('#couponButton').addEventListener('click',()=>{const list=document.querySelector('#couponList');if(!list)return;list.hidden=!list.hidden;document.querySelector('#couponButton').textContent=list.hidden?'쿠폰 목록':'목록 닫기';});
renderStamp();

const notificationPanel=document.querySelector('#notificationPanel');
const notificationButton=document.querySelector('#notificationButton');
function renderNotifications(){
 const calm=[...touristSpots].sort((a,b)=>a.crowd-b.crowd)[0];
 const busy=[...touristSpots].sort((a,b)=>b.crowd-a.crowd)[0];
 document.querySelector('#notificationList').innerHTML=`<article class="notice"><span class="notice-icon">✦</span><div><b>AI 추천이 새로 갱신됐어요</b><p>지금은 ${calm.name}이(가) 혼잡도 ${calm.crowd}%로 가장 여유로워요.</p><time>방금 전</time></div></article><article class="notice"><span class="notice-icon">⌖</span><div><b>${busy.name} 혼잡도 확인</b><p>현재 혼잡도 ${busy.crowd}%예요. 지도에서 덜 붐비는 대체 명소를 확인해 보세요.</p><time>방금 전</time></div></article><article class="notice"><span class="notice-icon">%</span><div><b>스탬프 리워드 안내</b><p>스탬프 ${earnedStamps.length}개를 모았어요. 3개 달성 시 지역 상점 쿠폰이 열려요.</p><time>오늘</time></div></article>`;
}
function toggleNotifications(open){notificationPanel.hidden=!open;notificationButton.setAttribute('aria-expanded',String(open));if(open){document.querySelector('.bell i').style.display='none';renderNotifications();}}
notificationButton.addEventListener('click',()=>toggleNotifications(notificationPanel.hidden));
document.querySelector('#closeNotifications').addEventListener('click',()=>toggleNotifications(false));
document.querySelector('#markNotificationsRead').addEventListener('click',()=>{document.querySelector('.bell i').style.display='none';toggleNotifications(false);showToast('모든 알림을 읽음으로 표시했어요.');});
renderNotifications();

const detailDescriptions={
 '자연·산책':'바다와 공원, 산책길을 따라 부산의 풍경을 여유롭게 즐길 수 있는 장소예요.',
 '문화·전시':'부산의 역사와 지역 이야기를 직접 만나 볼 수 있는 문화 명소예요.',
 '맛집·시장':'지역의 일상과 먹거리를 가까이에서 경험할 수 있는 로컬 공간이에요.'
};
const preferenceLabels={'자연·산책':'바다 산책','문화·전시':'문화 탐방','맛집·시장':'로컬 맛집·시장'};
function getAiReasons(spot){
 const benchmark=touristSpots.find(item=>item.name==='해운대해수욕장')||{crowd:80};
 const difference=benchmark.crowd-spot.crowd;
 const crowdReason=difference>0?`해운대보다 혼잡도 ${difference}% 낮음`:`현재 해운대와 혼잡도 ${Math.abs(difference)}% 차이`;
 const match=travelPurpose.theme===spot.theme?Math.min(97,88+((spot.id.split('-')[1]*5)%10)):Math.min(84,70+((spot.id.split('-')[1]*5)%15));
 const travel=18+((spot.id.split('-')[1]*5)%19);
 const stores=4+((spot.id.split('-')[1]*3)%8);
 return [crowdReason,`선택한 ‘${travelPurpose.label}’ 목적과 ${match}% 일치`,`대중교통 예상 이동 ${travel}분`,`주변 지역 상점 ${stores}곳에서 할인 가능`];
}
let activeDetailSpot=null;
function openSpotDetail(spot){
 if(!spot)return;activeDetailSpot=spot;
 const image=spotImages[spot.name];
 const panel=document.querySelector('#spotDetailPanel');
 document.querySelector('#detailImage').src=image||'';document.querySelector('#detailImage').alt=`${spot.name} 풍경`;
 document.querySelector('#detailCrowd').textContent=`혼잡도 ${spot.crowd}% · ${crowdText(spot.crowd)}`;
 document.querySelector('#detailName').textContent=spot.name;
 document.querySelector('#detailDistrict').textContent=`${spot.district} · ${spot.theme}`;
 document.querySelector('#detailDescription').textContent=detailDescriptions[spot.theme];
 document.querySelector('#detailTheme').textContent=`#${spot.theme}`;
 document.querySelector('#detailReason').textContent=spot.crowd<40?'#지금_여유로움':'#혼잡도_확인_추천';
 document.querySelector('#aiReasonList').innerHTML=getAiReasons(spot).map(reason=>`<li>${reason}</li>`).join('');
 syncFavoriteUi();
 panel.hidden=false;
}
function closeSpotDetail(){document.querySelector('#spotDetailPanel').hidden=true;}
document.querySelector('#closeSpotDetail').addEventListener('click',closeSpotDetail);
document.querySelector('#detailMapButton').addEventListener('click',()=>{if(activeDetailSpot){closeSpotDetail();move('map');openSpot(activeDetailSpot);crowdMap&&crowdMap.setView([activeDetailSpot.lat,activeDetailSpot.lng],14);}});
document.querySelector('#detailCourseButton').addEventListener('click',()=>{if(activeDetailSpot){closeSpotDetail();createCourseForSpot(activeDetailSpot);showToast(`${activeDetailSpot.name}을(를) 포함한 코스를 만들었어요.`);}});
document.querySelector('#featuredRecommendation').addEventListener('click',event=>{if(!event.target.closest('button'))openSpotDetail(touristSpots.find(spot=>spot.id===event.currentTarget.dataset.spotId));});
document.querySelector('#featuredRecommendation .heart').addEventListener('click',event=>{event.stopPropagation();toggleFavorite(touristSpots.find(spot=>spot.id===document.querySelector('#featuredRecommendation').dataset.spotId));});
document.querySelector('#detailFavoriteButton').addEventListener('click',()=>toggleFavorite(activeDetailSpot));
document.querySelector('#favoriteButton').addEventListener('click',()=>move('favorites'));
syncFavoriteUi();renderFavorites();

var crowdMap, spotMarkers=[], routeLine, routeStopMarkers=[], routeRequestId=0;
let selectedTransport='car';
const transportOptions={car:{label:'자동차',color:'#0878cf'}};
let focusedSpot=touristSpots.find(spot=>spot.name==='해운대해수욕장')||touristSpots[0];
const crowdLevel=value=>value>=70?'high':value>=40?'medium':'low';
const crowdText=value=>value>=70?'혼잡':value>=40?'보통':'여유';
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function updateMapPins(){spotMarkers.forEach(({spot,marker})=>{const level=crowdLevel(spot.crowd);marker.setIcon(L.divIcon({className:'',html:`<div class="crowd-marker ${level}">${spot.crowd}</div>`,iconSize:[34,34],iconAnchor:[17,17]}));marker.bindPopup(`<div class="map-popup"><b>${spot.name}</b><small>${spot.district} · 실시간 분석</small><strong>${spot.crowd}% · ${crowdText(spot.crowd)}</strong></div>`);});}
function updateFocusedSpot(){document.querySelector('#placeTitle').textContent=focusedSpot.name;document.querySelector('#placeDensity').innerHTML=`${focusedSpot.crowd}% <em>${crowdText(focusedSpot.crowd)}</em>`;const alternative=touristSpots.filter(item=>item.district!==focusedSpot.district).sort((a,b)=>a.crowd-b.crowd)[0];document.querySelector('#placeAlt').textContent=`${alternative.name} · ${alternative.crowd}%`;}
function openSpot(spot){focusedSpot=spot;updateFocusedSpot();}
async function updateMapRoute(fit=false){
 if(!crowdMap||!window.L)return;
 const requestId=++routeRequestId;
 if(routeLine){crowdMap.removeLayer(routeLine);routeLine=null;}
 routeStopMarkers.forEach(marker=>crowdMap.removeLayer(marker));routeStopMarkers=[];
 const requestedStops=getCurrentRouteStops();
 const stops=requestedStops.map(stop=>touristSpots.find(spot=>spot.name===stop[0])).filter(Boolean);
 const summary=document.querySelector('#routeMapSummary');
 if(stops.length<2||stops.length!==requestedStops.length){summary.textContent='정보를 제공할 수 없습니다. 선택한 코스의 일부 명소 지도 좌표가 없어요.';return;}
 const transport=transportOptions[selectedTransport];
 summary.textContent='자동차 실제 도로 경로를 불러오는 중이에요.';
 const coordinates=stops.map(spot=>`${spot.lng},${spot.lat}`).join(';');
 try{
  const response=await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`);
  const payload=await response.json();
  if(requestId!==routeRequestId)return;
  const geometry=payload?.routes?.[0]?.geometry?.coordinates;
  if(!response.ok||payload.code!=='Ok'||!Array.isArray(geometry)||geometry.length<2)throw new Error('no-route');
  const points=geometry.map(([lng,lat])=>[lat,lng]);
  routeLine=L.polyline(points,{color:transport.color,weight:7,opacity:.96,lineCap:'round',lineJoin:'round'}).addTo(crowdMap);routeLine.bringToFront();
 }catch{
  if(requestId!==routeRequestId)return;
  summary.textContent='정보를 제공할 수 없습니다. 실제 자동차 경로를 불러오지 못했어요.';return;
 }
 routeStopMarkers=stops.map((spot,index)=>L.marker([spot.lat,spot.lng],{icon:L.divIcon({className:'',html:`<span class="route-stop-marker ${index===0?'start':''}">${index+1}</span>`,iconSize:[25,25],iconAnchor:[12,12]})}).addTo(crowdMap).bindTooltip(`${index+1}. ${spot.name}`,{direction:'top',offset:[0,-12]}));
 summary.textContent=`자동차 · ${routeRegions[selectedRegion].label} 코스 ${stops.length}곳을 실제 도로 경로로 표시했어요.`;
 if(fit)crowdMap.fitBounds(routeLine.getBounds(),{padding:[32,32],maxZoom:13});
}
function updateDashboard(){const average=Math.round(touristSpots.reduce((sum,spot)=>sum+spot.crowd,0)/touristSpots.length);document.querySelector('#averageDensity').innerHTML=`${average}<span>%</span>`;renderRecommendations(selectedFilter);renderFeaturedRecommendation();renderEquitySpotlight();renderCourse();renderNotifications();renderFavorites();updateFocusedSpot();if(!document.querySelector('#searchPanel').hidden)renderSearch();}
function applyDemoCrowdVariation(){const phase=Math.floor(Date.now()/30000);touristSpots.forEach((spot,index)=>{const wave=Math.sin((phase+index*3)*0.86)*13+Math.cos((phase+index)*0.41)*6;spot.crowd=Math.round(clamp(spot.baseCrowd+wave,8,92));});}
function startBusanMap(){if(!window.L)return;crowdMap=L.map('busanMap',{zoomControl:false,attributionControl:true}).setView([35.165,129.065],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(crowdMap);L.control.zoom({position:'bottomright'}).addTo(crowdMap);spotMarkers=touristSpots.map(spot=>{const marker=L.marker([spot.lat,spot.lng]).addTo(crowdMap);marker.on('click',()=>openSpot(spot));return{spot,marker};});updateMapPins();updateMapRoute();}
async function refreshCrowdData(){let usesLiveApi=false;try{const response=await fetch('/api/crowd');if(!response.ok)throw new Error('fallback');const payload=await response.json();const incoming=new Map(payload.places.map(item=>[item.id,item.crowd]));touristSpots.forEach(spot=>{if(incoming.has(spot.id))spot.crowd=incoming.get(spot.id);});usesLiveApi=true;}catch{applyDemoCrowdVariation();}updateMapPins();updateDashboard();const current=new Date();const label=`${String(current.getHours()).padStart(2,'0')}:${String(current.getMinutes()).padStart(2,'0')} 갱신`;document.querySelector('#syncTime').textContent=label;document.querySelector('#updatedAt').textContent=`${label} · ${usesLiveApi?'실시간 데이터':'시연 데이터'}`;}
startBusanMap();
const transportButtons=document.querySelectorAll('#transportModes button');
transportButtons.forEach(button=>button.classList.toggle('active',button.dataset.transport===selectedTransport));
transportButtons.forEach(button=>button.addEventListener('click',()=>{selectedTransport=button.dataset.transport;transportButtons.forEach(item=>item.classList.toggle('active',item===button));updateMapRoute(true);}));
refreshCrowdData();
setInterval(refreshCrowdData,30000);

// 시연용 계정 기능: 계정과 로그인 상태는 현재 브라우저에만 저장됩니다.
const authUserKey='discovera-demo-user-v1';
const authSessionKey='discovera-demo-session-v1';
const authModal=document.querySelector('#authModal');
const authDialog=authModal.querySelector('.auth-dialog');
const authButton=document.querySelector('#authButton');
const authForm=document.querySelector('#authForm');
const authSwitch=document.querySelector('#authSwitch');
const authTitle=document.querySelector('#authTitle');
const authCopy=document.querySelector('#authCopy');
const authSubmit=document.querySelector('#authSubmit');
const authName=document.querySelector('#authName');
const authEmail=document.querySelector('#authEmail');
const authPassword=document.querySelector('#authPassword');
const accountSummary=document.querySelector('#accountSummary');
const accountName=document.querySelector('#accountName');
const accountEmail=document.querySelector('#accountEmail');
let authMode='login';
const savedUser=()=>{try{return JSON.parse(localStorage.getItem(authUserKey)||'null');}catch{return null;}};
const activeUser=()=>{try{return JSON.parse(localStorage.getItem(authSessionKey)||'null');}catch{return null;}};
function renderAuth(){
 const user=activeUser();
 authButton.textContent=user?`${user.name}님`:'로그인';
 authDialog.classList.toggle('is-account',Boolean(user));
 authDialog.classList.toggle('is-login',authMode==='login');
 accountSummary.hidden=!user;
 if(user){accountName.textContent=`${user.name}님, 반가워요!`;accountEmail.textContent=user.email;return;}
 authTitle.textContent=authMode==='login'?'Discovera에 로그인':'Discovera 회원가입';
 authCopy.textContent=authMode==='login'?'나만의 여행 코스와 스탬프를 이어서 확인하세요.':'간단한 가입으로 나만의 부산 여행을 시작해 보세요.';
 authSubmit.textContent=authMode==='login'?'로그인':'회원가입';
 authSwitch.textContent=authMode==='login'?'처음이신가요? 회원가입':'이미 계정이 있나요? 로그인';
 authName.required=authMode==='signup';
 authPassword.autocomplete=authMode==='login'?'current-password':'new-password';
}
function openAuth(){authModal.hidden=false;renderAuth();if(!activeUser())setTimeout(()=>(authMode==='signup'?authName:authEmail).focus(),50);}
function closeAuth(){authModal.hidden=true;authForm.reset();}
authButton.addEventListener('click',openAuth);
document.querySelector('#closeAuth').addEventListener('click',closeAuth);
document.querySelector('#authBackdrop').addEventListener('click',closeAuth);
authSwitch.addEventListener('click',()=>{authMode=authMode==='login'?'signup':'login';renderAuth();});
authForm.addEventListener('submit',event=>{
 event.preventDefault();
 const email=authEmail.value.trim().toLowerCase(),password=authPassword.value;
 if(authMode==='signup'){
  const name=authName.value.trim();
  if(!name||password.length<4){showToast('이름과 4자 이상의 비밀번호를 입력해 주세요.');return;}
  const user={name,email,password};localStorage.setItem(authUserKey,JSON.stringify(user));localStorage.setItem(authSessionKey,JSON.stringify({name:user.name,email:user.email}));showToast(`${name}님, Discovera 가입을 환영해요!`);
 }else{
  const user=savedUser();
  if(!user||user.email!==email||user.password!==password){showToast('이메일 또는 비밀번호를 다시 확인해 주세요.');return;}
  localStorage.setItem(authSessionKey,JSON.stringify({name:user.name,email:user.email}));showToast(`${user.name}님, 다시 만나서 반가워요!`);
 }
 renderAuth();setTimeout(closeAuth,650);
});
document.querySelector('#logoutButton').addEventListener('click',()=>{localStorage.removeItem(authSessionKey);authMode='login';renderAuth();closeAuth();showToast('로그아웃되었습니다.');});
renderAuth();

const purposeModal=document.querySelector('#purposeModal');
const purposeSummary=document.querySelector('#purposeSummary');
function syncPurposeUi(){
 purposeSummary.textContent=`‘${travelPurpose.label}’ 목적과 혼잡도, 이동 시간을 반영해 추천해요.`;
 document.querySelectorAll('.purpose-change').forEach(button=>button.textContent=`여행 목적 · ${travelPurpose.label}`);
}
function openPurpose(){purposeModal.hidden=false;}
function applyPurpose(key,save=true){
 travelPurpose=travelPurposes[key]||travelPurposes.balance;
 if(save)localStorage.setItem(purposeStoreKey,key);
 const filter=travelPurpose.theme||'전체';
 selectedFilter=filter;
 document.querySelectorAll('.filter-row button').forEach(button=>button.classList.toggle('active',button.dataset.filter===filter));
 syncPurposeUi();renderRecommendations(filter);renderFeaturedRecommendation();renderEquitySpotlight();renderCourse();
 purposeModal.hidden=true;showToast(`‘${travelPurpose.label}’ 목적에 맞춰 추천을 새로 만들었어요.`);
}
document.querySelectorAll('.purpose-change').forEach(button=>button.addEventListener('click',openPurpose));
document.querySelectorAll('#purposeOptions button').forEach(button=>button.addEventListener('click',()=>applyPurpose(button.dataset.purpose)));
document.querySelector('#purposeLater').addEventListener('click',()=>{purposeModal.hidden=true;sessionStorage.setItem('discovera-purpose-later','1');});
document.querySelector('#purposeBackdrop').addEventListener('click',()=>{purposeModal.hidden=true;});
syncPurposeUi();
if(!localStorage.getItem(purposeStoreKey)&&!sessionStorage.getItem('discovera-purpose-later'))setTimeout(openPurpose,450);

const searchPanel=document.querySelector('#searchPanel');
const spotSearchInput=document.querySelector('#spotSearchInput');
const searchResults=document.querySelector('#searchResults');
const searchStatus=document.querySelector('#searchStatus');
function renderSearch(){
 const query=spotSearchInput.value.trim().toLowerCase();
 const results=touristSpots.filter(spot=>`${spot.name} ${spot.district} ${spot.theme}`.toLowerCase().includes(query)).sort(equityFirst);
 searchStatus.textContent=query?`‘${spotSearchInput.value.trim()}’ 검색 결과 ${results.length}곳 · 혼잡도는 30초마다 갱신돼요.`:'32개 명소의 현재 혼잡도를 확인할 수 있어요.';
 searchResults.innerHTML=results.length?results.map(spot=>{const level=spot.crowd>=70?'high':spot.crowd>=40?'medium':'';return `<button class="search-result" type="button" data-search-id="${spot.id}"><img src="${spotImages[spot.name]||''}" alt=""><span><b>${spot.name}</b><small>${spot.district} · ${spot.theme}</small></span><em class="${level}">혼잡도 ${spot.crowd}%</em></button>`;}).join(''):'<p class="search-empty">검색 결과가 없어요.<br>다른 명소명이나 지역명으로 찾아보세요.</p>';
 searchResults.querySelectorAll('.search-result').forEach(button=>button.addEventListener('click',()=>{const spot=touristSpots.find(item=>item.id===button.dataset.searchId);searchPanel.hidden=true;openSpotDetail(spot);}));
}
function openSearch(){searchPanel.hidden=false;renderSearch();setTimeout(()=>spotSearchInput.focus(),30);}
document.querySelector('#searchButton').addEventListener('click',openSearch);
document.querySelector('#closeSearch').addEventListener('click',()=>{searchPanel.hidden=true;spotSearchInput.value='';});
spotSearchInput.addEventListener('input',renderSearch);
