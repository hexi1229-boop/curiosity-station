'use strict';
CurrentLesson.beforeSubmit=function(index,log){if([1,4].includes(index)&&!log.records[index].first&&!log.checkpoint['briefingHidden'+index])return '先把任务单收起来，再试着转述。需要时可以重新打开，回看会如实记录。';return '';};
CurrentLesson.bindScene=function(scene,log,index){
 const audio=scene.querySelector('audio');
 if(audio){audio.addEventListener('play',()=>{const key='briefingPlays'+index,count=(log.checkpoint[key]||0)+1;log.point({[key]:count});log.note(index,'任务音频播放第'+count+'次（输入材料，不作额外求助）');});audio.addEventListener('error',()=>{scene.querySelector('.audio-status').textContent='音频暂时无法播放，展开下方同一份文字即可继续。';});}
 const toggle=scene.querySelector('#briefing-toggle');
 if(toggle){let hidden=Boolean(log.checkpoint['briefingHidden'+index]);const paper=scene.querySelector('#briefing-paper'),cover=scene.querySelector('#briefing-covered');function draw(){paper.hidden=hidden;cover.hidden=!hidden;toggle.textContent=hidden?'需要时重新打开任务单':'收起任务单，开始转述';toggle.setAttribute('aria-expanded',String(!hidden));}toggle.onclick=()=>{hidden=!hidden;log.point({['briefingHidden'+index]:hidden});if(hidden)log.note(index,'收起任务单后尝试口头转述');else log.help(index,'重新打开任务单回看');draw();};draw();}
 return ()=>{if(audio)audio.pause();};
};
CurrentLesson.lab=function(slot,log,index){
 slot.innerHTML='<details class="lesson-lab"><summary>一个短示例：保留信息，换成自己的话</summary><h3>不背整段，先抓行动</h3><p lang="en">Notice: The game starts at ten. Meet at the north gate at nine forty. Bring water.</p><p>抓住：集合9:40 / 北门 / 带水。再组织成：</p><p class="lab-result" lang="en">Make sure you bring water. We meet at the north gate at nine forty, before the game starts.</p><p>同一意思可以换词、换顺序；时间和地点不能换。后面的题先自己说，再对照。</p><p lang="en">Make sure… → 确认 / 别忘了……<br>Before we… → 在我们……之前<br>Just to check,…? → 我确认一下，……？</p></details>';
 slot.querySelector('details').addEventListener('toggle',e=>{if(e.target.open)log.help(index,'查看任务转述短示例与三个词块');});
};
