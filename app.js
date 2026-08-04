const density={해운대해수욕장:['82% · 혼잡','청사포 · 19%'],광안리해수욕장:['76% · 혼잡','수영사적공원 · 22%'],서면:['51% · 보통','전포카페거리 · 29%'],흰여울문화마을:['24% · 여유','절영해안산책로 · 19%'],삼락생태공원:['18% · 여유','화명생태공원 · 16%']};
const cards=document.querySelector('#smallCards');
const realtimeNow=new Date();
const realtimeText=`${String(realtimeNow.getHours()).padStart(2,'0')}:${String(realtimeNow.getMinutes()).padStart(2,'0')} 갱신`;
document.querySelector('#syncTime').textContent=realtimeText;
document.querySelector('#updatedAt').textContent=`${realtimeText} · 데모 데이터`;
const pages=document.querySelectorAll('.page'),navs=document.querySelectorAll('.nav'),toast=document.querySelector('.toast');
function move(id){pages.forEach(p=>p.classList.toggle('active',p.id===id));navs.forEach(n=>n.classList.toggle('active',n.dataset.go===id));document.querySelector('.app-shell').scrollTop=0;if(id==='map'&&crowdMap)setTimeout(()=>crowdMap.invalidateSize(),0);}
document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>move(button.dataset.go)));
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
function renderCourse(){
 const plan=durationPlans[selectedDuration];
 const region=routeRegions[selectedRegion];
 const routeStops=requestedSpot?[[requestedSpot.name,'선택한 명소 · 이곳에서 여행 시작'],...region.stops.filter(stop=>stop[0]!==requestedSpot.name)]:region.stops;
 const stops=routeStops.slice(0,plan.count);
 const title=requestedSpot?`${requestedSpot.name}을(를) 담은 ${region.label} 코스`:region.title;
 const description=requestedSpot?`선택한 ${requestedSpot.name}을(를) 첫 방문지로 넣고, 가까운 명소를 이어 드려요.`:plan.description;
 document.querySelector('#courseCard').innerHTML=`<div class="course-top"><span>${plan.label} AI 추천 코스 · ${region.label}</span><b>${plan.meta}</b></div><h2>${title}</h2><p>${description}<br />${region.districts} 명소를 중심으로 구성했어요.</p><ol>${stops.map((stop,index)=>`<li><time>${plan.times[index]}</time><i class="timeline-dot" aria-hidden="true"></i><span><b>${stop[0]}</b><small>${routeCrowd(stop[0])} · ${stop[1]}</small></span></li>`).join('')}</ol><button class="primary route-start">이 코스로 여행 시작하기</button></article>`;
 document.querySelector('.route-start').addEventListener('click',()=>move('stamp'));
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
function renderRecommendations(filter='전체'){
 const visible=filter==='전체'?touristSpots:touristSpots.filter(spot=>spot.theme===filter);
 document.querySelector('#recommendTitle').textContent=filter==='전체'?`지금 가기 좋은 부산 명소 ${visible.length}곳`:`${filter} 명소 ${visible.length}곳`;
 cards.innerHTML=visible.map(spot=>{const image=spotImages[spot.name];const level=spot.crowd>=70?'high':spot.crowd>=40?'medium':'low';return `<article class="mini-card spot-card" data-spot-id="${spot.id}" role="button" tabindex="0" aria-label="${spot.name} 상세 정보 보기"><div class="mini-art ${level}">${image?`<img src="${image}" alt="${spot.name}">`:`<span>${spot.theme==='자연·산책'?'♧':spot.theme==='문화·전시'?'⌂':'✦'}</span>`}</div><div class="spot-meta"><b>${spot.name}</b><p>${spot.district} · 혼잡도 <strong class="${level}">${spot.crowd}%</strong></p><small>${spot.theme}</small></div></article>`;}).join('');
 cards.querySelectorAll('.spot-card').forEach(card=>{const spot=touristSpots.find(item=>item.id===card.dataset.spotId);card.addEventListener('click',()=>openSpotDetail(spot));card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openSpotDetail(spot);}});});
}
function renderFeaturedRecommendation(){
 const pick=[...touristSpots].sort((a,b)=>a.crowd-b.crowd)[0];
 const image=spotImages[pick.name];
 const crowd=document.querySelector('#featuredCrowd');
 crowd.textContent=`혼잡도 ${pick.crowd}% · ${pick.crowd>=70?'혼잡':pick.crowd>=40?'보통':'여유'}`;
 crowd.className=`pill ${pick.crowd>=40?'':'calm'}`;
 document.querySelector('#featuredName').textContent=pick.name;
 document.querySelector('#featuredDistrict').textContent=`${pick.district} · AI가 지금 가장 여유로운 명소로 추천했어요.`;
 document.querySelector('#featuredTheme').textContent=`#${pick.theme}`;
 document.querySelector('#featuredImage').src=image||'';
 document.querySelector('#featuredImage').alt=`${pick.name} 풍경`;
 document.querySelector('.course-btn').dataset.course=pick.name;
 document.querySelector('#featuredRecommendation').dataset.spotId=pick.id;
}
renderRecommendations();
renderCourse();

const stampStoreKey='discovera-demo-stamps-v1';
const stampLimit=12;
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
 const visited=earnedStamps.map(id=>touristSpots.find(spot=>spot.id===id)).filter(Boolean);
 const cards=[...visited.slice(0,6),...Array(Math.max(0,6-visited.length)).fill(null)];
 grid.innerHTML=cards.map(spot=>spot?`<div class="earned">✓<span>${spot.name}</span></div>`:'<div>＋<span>다음 여행</span></div>').join('');
 const unlocked=earnedStamps.length>=3;
 const status=document.querySelector('#couponStatus'),text=document.querySelector('#couponText'),button=document.querySelector('#couponButton'),card=document.querySelector('#couponCard');
 status.textContent=unlocked?'스탬프 3개 달성 · 쿠폰 사용 가능':`스탬프 ${Math.max(0,3-earnedStamps.length)}개 더 모으면 리워드 해제`;
 text.textContent=unlocked?'쿠폰 코드 DISCOVERA10 · 제휴 지역 상점에서 제시하세요.':'방문 인증 후 지역 상권 할인 쿠폰이 열려요.';
 button.disabled=!unlocked;button.textContent=unlocked?'쿠폰 보기':'잠김';card.classList.toggle('coupon-unlocked',unlocked);
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
document.querySelector('#couponButton').addEventListener('click',()=>showToast('쿠폰 코드 DISCOVERA10 · 지역 제휴 상점 10% 할인'));
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
 panel.hidden=false;
}
function closeSpotDetail(){document.querySelector('#spotDetailPanel').hidden=true;}
document.querySelector('#closeSpotDetail').addEventListener('click',closeSpotDetail);
document.querySelector('#detailMapButton').addEventListener('click',()=>{if(activeDetailSpot){closeSpotDetail();move('map');openSpot(activeDetailSpot);crowdMap&&crowdMap.setView([activeDetailSpot.lat,activeDetailSpot.lng],14);}});
document.querySelector('#detailCourseButton').addEventListener('click',()=>{if(activeDetailSpot){closeSpotDetail();createCourseForSpot(activeDetailSpot);showToast(`${activeDetailSpot.name}을(를) 포함한 코스를 만들었어요.`);}});
document.querySelector('#featuredRecommendation').addEventListener('click',event=>{if(!event.target.closest('button'))openSpotDetail(touristSpots.find(spot=>spot.id===event.currentTarget.dataset.spotId));});

let crowdMap, spotMarkers=[];
let focusedSpot=touristSpots.find(spot=>spot.name==='해운대해수욕장')||touristSpots[0];
const crowdLevel=value=>value>=70?'high':value>=40?'medium':'low';
const crowdText=value=>value>=70?'혼잡':value>=40?'보통':'여유';
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function updateMapPins(){spotMarkers.forEach(({spot,marker})=>{const level=crowdLevel(spot.crowd);marker.setIcon(L.divIcon({className:'',html:`<div class="crowd-marker ${level}">${spot.crowd}</div>`,iconSize:[34,34],iconAnchor:[17,17]}));marker.bindPopup(`<div class="map-popup"><b>${spot.name}</b><small>${spot.district} · 실시간 분석</small><strong>${spot.crowd}% · ${crowdText(spot.crowd)}</strong></div>`);});}
function updateFocusedSpot(){document.querySelector('#placeTitle').textContent=focusedSpot.name;document.querySelector('#placeDensity').innerHTML=`${focusedSpot.crowd}% <em>${crowdText(focusedSpot.crowd)}</em>`;const alternative=touristSpots.filter(item=>item.district!==focusedSpot.district).sort((a,b)=>a.crowd-b.crowd)[0];document.querySelector('#placeAlt').textContent=`${alternative.name} · ${alternative.crowd}%`;}
function openSpot(spot){focusedSpot=spot;updateFocusedSpot();}
function updateDashboard(){const average=Math.round(touristSpots.reduce((sum,spot)=>sum+spot.crowd,0)/touristSpots.length);document.querySelector('#averageDensity').innerHTML=`${average}<span>%</span>`;renderRecommendations(selectedFilter);renderFeaturedRecommendation();renderCourse();renderNotifications();updateFocusedSpot();}
function applyDemoCrowdVariation(){const phase=Math.floor(Date.now()/30000);touristSpots.forEach((spot,index)=>{const wave=Math.sin((phase+index*3)*0.86)*13+Math.cos((phase+index)*0.41)*6;spot.crowd=Math.round(clamp(spot.baseCrowd+wave,8,92));});}
function startBusanMap(){if(!window.L)return;crowdMap=L.map('busanMap',{zoomControl:false,attributionControl:true}).setView([35.165,129.065],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(crowdMap);L.control.zoom({position:'bottomright'}).addTo(crowdMap);spotMarkers=touristSpots.map(spot=>{const marker=L.marker([spot.lat,spot.lng]).addTo(crowdMap);marker.on('click',()=>openSpot(spot));return{spot,marker};});updateMapPins();}
async function refreshCrowdData(){let usesLiveApi=false;try{const response=await fetch('/api/crowd');if(!response.ok)throw new Error('fallback');const payload=await response.json();const incoming=new Map(payload.places.map(item=>[item.id,item.crowd]));touristSpots.forEach(spot=>{if(incoming.has(spot.id))spot.crowd=incoming.get(spot.id);});usesLiveApi=true;}catch{applyDemoCrowdVariation();}updateMapPins();updateDashboard();const current=new Date();const label=`${String(current.getHours()).padStart(2,'0')}:${String(current.getMinutes()).padStart(2,'0')} 갱신`;document.querySelector('#syncTime').textContent=label;document.querySelector('#updatedAt').textContent=`${label} · ${usesLiveApi?'실시간 데이터':'시연 데이터'}`;}
startBusanMap();
refreshCrowdData();
setInterval(refreshCrowdData,30000);
