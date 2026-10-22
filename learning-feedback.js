/* Shared session-only evidence. The standalone lessons embed this same file. */
(function (root) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function create(title, questions) {
    if (questions.length !== 5) throw new Error('A lesson has exactly five tasks');
    const records = questions.map(q => ({title:q.title || q, context:[q.context,q.source,q.task].filter(Boolean).join(' '), first:null, attempts:[], helps:[], notes:[], done:false, self:''}));
    function help(index, label) {
      const r = records[index];
      const phase = r.done ? '完成后回看' : r.first ? '首答后' : '首答前';
      if (!r.helps.some(h => h.label === label && h.phase === phase)) r.helps.push({label, phase});
    }
    function submit(index, answer, correct = null, explanation = '') {
      const r = records[index];
      if (!String(answer).trim() || r.done) return false;
      const attempt = {answer:String(answer).trim(), correct, explanation:String(explanation).trim(), helped:r.helps.some(h=>h.phase !== '完成后回看')};
      r.attempts.push(attempt);
      if (!r.first) r.first = {...attempt};
      return true;
    }
    function note(index, text) {
      const notes = records[index].notes;
      if (text && notes[notes.length-1] !== text) notes.push(String(text));
    }
    function finish(index, self = '') { records[index].done = true; records[index].self = self; }
    function status(r) {
      if (!r.first) return '未提交答案';
      if (r.first.correct === null) return '表达 / 自检，未自动判分';
      if (r.first.correct) return r.first.helped ? '首答正确，答前用过帮助' : '首答正确，答前未打开帮助';
      return r.attempts.some(a=>a.correct) ? '首答未通过，重试后通过' : '首答未通过，已查看方法或仍需帮助';
    }
    function html() {
      return `<section class="learning-report" aria-label="本次学习反馈"><h3>本次学习反馈 · 5 题</h3><p class="report-course">${esc(title)}</p><p class="report-note">今天可以到这里。需要时截图给家长；首答与求助记录帮助发现下一步，不等于已经长期掌握。</p><ol class="report-list">${records.map((r,i)=>{
        const first = r.first;
        const last = r.attempts[r.attempts.length-1];
        const laterExplanation = last?.explanation && last.explanation !== first?.explanation;
        return `<li><h4>${i+1}. ${esc(r.title)}</h4>${r.context?`<p class="report-context">${esc(r.context)}</p>`:''}<p class="report-status">${esc(status(r))}</p><p><b>首次答案：</b><span class="report-words">${esc(first?.answer || '未提交，直接查看方法')}</span></p>${first?.explanation&&first.explanation!==first.answer?`<p><b>首次解释：</b><span class="report-words">${esc(first.explanation)}</span></p>`:''}${last && last !== first && r.attempts.length>1?`<p><b>最后提交：</b>${esc(last.answer)}</p>`:''}${laterExplanation?`<p><b>修改后解释：</b>${esc(last.explanation)}</p>`:''}<p><b>帮助：</b>${r.helps.length?r.helps.map(h=>`${esc(h.phase)}·${esc(h.label)}`).join('；'):'未打开提示或回看'}</p><p>有效提交 ${r.attempts.length} 次${r.self?`；自评：${esc(r.self)}`:''}。</p>${r.notes.map(n=>`<p class="report-note">${esc(n)}</p>`).join('')}</li>`;
      }).join('')}</ol><p class="report-note">只记录当前页面内的操作；纸上演算、外部求助无法自动识别。记录不上传，刷新或离开前请先截图。</p></section>`;
    }
    return {records, help, submit, note, finish, html};
  }
  function reasonField(label = '留一句自己的理由', placeholder = '一句话或一个算式就好，也可用键盘上的语音输入。') {
    return `<div class="evidence-reason"><label for="my-reason">${esc(label)}</label><textarea id="my-reason" maxlength="500" rows="2" placeholder="${esc(placeholder)}"></textarea><label class="reason-unsure"><input type="checkbox" id="reason-unsure">我暂时说不清，先记下来</label><p class="report-note">这是本题的一部分，不另加题；先留自己的想法，再看参考。</p></div>`;
  }
  function readReason(container) {
    const input = container.querySelector('#my-reason');
    return input?.value.trim() || (container.querySelector('#reason-unsure')?.checked ? '暂时说不清' : null);
  }
  function watchHelp(container, log, index) {
    container.querySelectorAll('details[data-help]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open) log.help(index,details.dataset.help);}));
  }
  root.LearningFeedback = {create, esc, reasonField, readReason, watchHelp};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.LearningFeedback;
})(typeof window !== 'undefined' ? window : globalThis);
