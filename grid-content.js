/* A bounded flat graticule for coordinate reading, not physical distance or globe shape. */
(function(root){
 'use strict';
 const title='只差一个字母，地点能跑到哪儿？';
 function valid(lat,lon){return Number.isInteger(lat)&&lat>=-60&&lat<=60&&lat%10===0&&Number.isInteger(lon)&&lon>=-120&&lon<=120&&lon%10===0;}
 function format(value,axis){if(!['lat','lon'].includes(axis)||!Number.isFinite(value)||Math.abs(value)>(axis==='lat'?90:180))throw new Error('Invalid coordinate');if(value===0)return axis==='lat'?'0°（赤道）':'0°（本初子午线）';return Math.abs(value)+'°'+(axis==='lat'?(value>0?'N':'S'):(value>0?'E':'W'));}
 function state(lat,lon){if(!valid(lat,lon))throw new Error('Outside lesson grid');return {lat,lon,x:50+(lon+120)*1.25,y:28+(60-lat)*1.8,latitude:format(lat,'lat'),longitude:format(lon,'lon'),label:'纬度 '+format(lat,'lat')+'；经度 '+format(lon,'lon')};}
 function fromPoint(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))throw new Error('Invalid pointer');const lon=Math.max(-120,Math.min(120,Math.round(((x-50)/1.25-120)/10)*10))||0,lat=Math.max(-60,Math.min(60,Math.round((60-(y-28)/1.8)/10)*10))||0;return state(lat,lon);}
 const questions=[
  {kind:'choice',skill:'先看数字以外的信息',title:'A和B的数字相同，是同一个地方吗？',context:'按“纬度、经度”给出：A（30°N，60°E），B（30°S，60°E）。这里N表示北纬，S表示南纬，E表示东经，W表示西经。',options:['是，都是30和60','不是：经度相同，纬度分属赤道南北','不是：纬度相同，经度一东一西'],answer:1,hint:'逐项对照：哪个字母变了？N和S是以哪一条线区分的？',explanation:'选B。两点都在东经60°，但A为北纬30°、B为南纬30°，分别位于赤道北侧、南侧。数值和方向字母要一起读。'},
  {kind:'locate',skill:'独立动手：把坐标变成位置',title:'把探测点移到南纬20°、西经40°。',context:'点击或拖动下面的点，也可用两个滑块或键盘方向键。网格每小格10°，上北下南、左西右东。调整完成后再提交；移动过程不会算作提示。',answer:{lat:-20,lon:-40},hint:'南纬在赤道下方，西经在本初子午线左侧。纬度找20°S的横线，经度找40°W的竖线，取交点。',explanation:'目标为纬度20°S、经度40°W，在赤道南侧、本初子午线西侧。这两条指定线的交点才是目标。'},
  {kind:'open',skill:'辨错：线的位置不能代替坐标含义',title:'把“纬度30°N，经度60°E”写成“纬度60°N，经度30°E”，哪里变了？',context:'小航说：“两种写法都有30、60、N、E，只是顺序变了，地点不变。”请解释他的错误。可以比较各点离赤道的位置，以及它们位于哪条经线上，不需要计算距离。',hint:'先把两种写法各自分成“纬度”和“经度”。30°N与60°N是同一条纬线吗？60°E与30°E是同一条经线吗？',reference:'不只是顺序改变，而是把数值分配给了不同的坐标。原来的点在北纬30°、东经60°；改写后的点在北纬60°、东经30°，纬线和经线都换了。后者纬度更高、位于更北，且位于不同经线上，因此不是同一点。若只调整书写顺序，必须连同“纬度/经度”和N/E一起保留对应关系。',checks:['明确原来的点纬度30°N/经度60°E，改写后纬度60°N/经度30°E。','解释两条坐标线都改变，不能把纬度经度的数值直接互换；不同书写顺序本身不一定错，关键是对应关系。']},
  {kind:'choice',skill:'0°是边界，不是信息缺失',title:'纬度0°、经度90°W，可以确定什么？',context:'这里只判断经纬位置，不计算时区，也不判断东西半球。',options:['经度也是0°，因为其中一个坐标是0','地点不确定，因为纬度没有N或S','在赤道与西经90°经线的交点'],answer:2,hint:'纬度0°有一个专门的名字，不需要再分北纬或南纬。另一个坐标仍然是90°W。',explanation:'选C。纬度0°就是赤道，是南北半球分界线，不属于北纬或南纬；经度90°W照常表示西经90°。0°纬度不等于0°经度，两项信息没有互相替代。'},
  {kind:'open',skill:'换一张局部图，读数并解释方向',title:'给M站写一条不会送错的定位信息。',context:'下图上北下南、左西右东。三条经线从左到右为120°W、100°W、80°W；三条纬线从上到下为20°S、40°S、60°S。M在中间经线与中间纬线的交点，P在左侧经线与中间纬线交点。写出M的纬度、经度，并判断M在P的东侧还是西侧，说明依据。',hint:'先沿M所在横线读纬度，再沿竖线读经度。在这幅西经局部图中，向右走，经度数字会变大还是变小？',reference:'M站：纬度40°S，经度100°W。M位于P的东侧：两者都在南纬40°，P是西经120°，M是西经100°；图中从P向右到M，就是向东，虽然西经度数从120减小到100。判断方向要结合E/W和图的方向，不能只比较数字大小。',checks:['纬度40°S、经度100°W，数值与方向字母完整且对应正确。','M在P东侧，以图示向右为东或120°W到100°W的变化说明理由；不把西经数字更小误作更西。']}
 ];
 root.GridLesson={title,questions,valid,format,state,fromPoint};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.GridLesson;
})(typeof window!=='undefined'?window:globalThis);
