// Local media stays in a Blob URL. The returned analysis object is reused every frame.
export function setupSound(toast,getStage,getPaused){
  const $=selector=>document.querySelector(selector),button=$('#sound'),media=$('#musicAudio');
  const fileInput=$('#musicFile'),status=$('#musicStatus'),name=$('#musicName'),dialog=$('#musicDialog'),meter=$('#musicMeter');
  const performance={loaded:false,active:false,level:0,bass:0,mid:0,high:0,beat:0,phase:0,time:0};
  let context=null,analyser=null,source=null,synthBus=null,noise=null,timer=null,step=0;
  let objectURL=null,scenePaused=Boolean(getPaused()),resumeMedia=false,synthEnabled=false;
  let request=0,internalPause=false,baseline=0,lastBeat=-1,frequency=null,waveform=null;
  let silentFor=0,silenceNotice=false;
  const defaultSource=media.dataset?.defaultSrc||'',defaultTitle=media.dataset?.defaultTitle||'默认歌曲';
  let defaultTrack=false;
  const playingStatus='正在播放本地音乐，乐队跟随音轨律动';
  const currentPlayingStatus=()=>defaultTrack?'正在播放默认歌曲，乐队跟随音轨律动':playingStatus;
  const analysisUnavailable='音频分析不可用，播放器仍可播放';
  const clamp=value=>Math.max(0,Math.min(1,value));
  function setStatus(message){status.textContent=message;silentFor=0;silenceNotice=false;}
  function refresh(){
    const playing=performance.loaded?!media.paused&&!media.ended:synthEnabled&&!scenePaused;
    button.textContent=playing?'♪':'♫';
    button.setAttribute('aria-label',playing?'暂停音乐':'播放音乐');
    button.setAttribute('aria-pressed',String(playing));
    button.title=performance.loaded?(media.muted||media.volume===0?'音乐已静音':playing?'暂停音乐':'播放音乐'):'乐园配乐';
  }
  function ensureContext(){
    if(!context){
      const AudioContextClass=window.AudioContext||window.webkitAudioContext;
      if(!AudioContextClass)return;
      context=new AudioContextClass();synthBus=context.createGain();synthBus.gain.value=0;synthBus.connect(context.destination);
    }
    if(!source&&media&&performance.loaded){
      analyser=context.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=.5;
      source=context.createMediaElementSource(media);source.connect(analyser);analyser.connect(context.destination);
      frequency=new Uint8Array(analyser.frequencyBinCount);waveform=new Uint8Array(analyser.fftSize);
    }
  }
  function pauseMedia(){if(!media.paused){internalPause=true;media.pause();}}
  function stopSynth(){
    synthEnabled=false;if(timer)clearInterval(timer);timer=null;
    if(synthBus)synthBus.gain.value=0;
  }
  async function playMedia(){
    resumeMedia=true;const token=++request;
    if(scenePaused){setStatus('场景已暂停；继续场景后播放音乐');return;}
    try{
      try{ensureContext();}catch{setStatus(analysisUnavailable);}
      if(context?.state==='suspended'&&source){
        try{await context.resume();}catch{if(token===request){resumeMedia=false;setStatus('请再次点击播放器播放按钮以启用声音');refresh();}return;}
      }
      if(token!==request||!performance.loaded||scenePaused||!resumeMedia)return;
      await media.play();
    }catch(error){
      if(token!==request||!performance.loaded)return;
      resumeMedia=false;
      setStatus(error.name==='NotAllowedError'?'请点击下方播放器的播放按钮，开始音乐':defaultTrack?'默认歌曲暂时无法播放，请点击重试或选择本地音乐':'无法播放此文件，请换用包含受支持音轨的 MP4、MP3 或 WAV');
      refresh();
    }
  }
  function clearMedia(message='已恢复乐园配乐，点击右上角音乐按钮开启'){
    const shouldPlay=resumeMedia||(!media.paused&&!media.ended);
    request++;resumeMedia=false;pauseMedia();media.removeAttribute('src');media.load();
    if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;
    performance.loaded=false;performance.active=false;performance.time=0;
    baseline=0;lastBeat=-1;fileInput.value='';name.textContent='尚未选择音乐';
    if(defaultSource){loadDefault(shouldPlay);return;}
    defaultTrack=false;setStatus(message);refresh();
  }
  function loadDefault(shouldPlay){
    defaultTrack=true;media.src=defaultSource;media.loop=true;media.load();
    performance.loaded=true;performance.active=false;performance.time=0;baseline=0;lastBeat=-1;
    name.textContent=defaultTitle;setStatus('默认歌曲已就绪，点击观看演出或播放器开始播放');refresh();
    if(shouldPlay)void playMedia();
  }
  async function startShow(){
    if(performance.loaded){
      if(resumeMedia||(!media.paused&&!media.ended))return;
      await playMedia();
    }else if(!synthEnabled)await button.onclick();
  }
  function tone(frequency,type,length,volume,delay=0){
    const at=context.currentTime+delay,osc=context.createOscillator(),gain=context.createGain();
    osc.type=type;osc.frequency.value=frequency;gain.gain.setValueAtTime(0,at);
    gain.gain.linearRampToValueAtTime(volume,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
    osc.connect(gain).connect(synthBus);osc.start(at);osc.stop(at+length+.02);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
  function percussion(kick){
    const at=context.currentTime,gain=context.createGain();gain.gain.setValueAtTime(kick?.12:.035,at);
    gain.gain.exponentialRampToValueAtTime(.0001,at+(kick?.2:.085));gain.connect(synthBus);
    if(kick){
      const osc=context.createOscillator();osc.frequency.setValueAtTime(125,at);osc.frequency.exponentialRampToValueAtTime(43,at+.16);
      osc.connect(gain);osc.start();osc.stop(at+.21);osc.onended=()=>{osc.disconnect();gain.disconnect();};
    }else{
      const src=context.createBufferSource(),filter=context.createBiquadFilter();src.buffer=noise;
      filter.type='highpass';filter.frequency.value=step%4===2?850:6500;src.connect(filter).connect(gain);
      src.start();src.stop(at+.09);src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect();};
    }
  }
  function tick(){
    if(document.hidden||scenePaused||getPaused()||performance.loaded)return;
    if(getStage()){
      const roots=[130.81,110,87.31,98],root=roots[Math.floor(step/16)%4],beat=step%8;
      if(beat===0||beat===4)percussion(true);else percussion(false);
      if(step%2===0)tone(root/2*(step%8===6?1.5:1),'triangle',.21,.045);
      if(step%4===0)for(let i=0;i<3;i++)tone(root*[2,2.5,3][i],'triangle',.36,.018,i*.012);
      if(step%2===1)tone(root*[4,3,5,3][Math.floor(step/2)%4],'sawtooth',.12,.008);
    }else if(step%4===0){
      const notes=[261.63,329.63,392,523.25,440,392,329.63,293.66];tone(notes[Math.floor(step/4)%8],'sine',1.5,.045);
    }
    step++;
  }
  button.onclick=async()=>{
    if(performance.loaded){
      if(!media.paused||resumeMedia){request++;resumeMedia=false;pauseMedia();setStatus('音乐已暂停');refresh();}
      else await playMedia();
      return;
    }
    if(synthEnabled){stopSynth();refresh();toast('配乐已关闭');return;}
    const token=++request;button.disabled=true;
    try{
      ensureContext();if(!context)throw new Error('Audio unavailable');await context.resume();
      if(token!==request||performance.loaded)return;
      if(!noise){noise=context.createBuffer(1,Math.floor(context.sampleRate*.12),context.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
      synthEnabled=true;synthBus.gain.value=scenePaused?0:1;timer=setInterval(tick,60000/112/4);
      toast(scenePaused?'继续场景后播放配乐':getStage()?'夏日摇滚器乐配乐已开启':'乐园配乐已开启');
    }catch{toast('当前窗口暂不支持音频');}
    finally{button.disabled=false;refresh();}
  };
  $('#openMusic').onclick=()=>{if(!dialog.open)dialog.showModal();};
  $('#musicClear').onclick=()=>{stopSynth();clearMedia();};
  fileInput.onchange=()=>{
    const file=fileInput.files?.[0];if(!file)return;
    const extension=/\.(mp4|m4a|mp3|wav|ogg|webm)$/i.test(file.name);
    const mime=!file.type||/^(audio\/|video\/(mp4|webm)$|application\/octet-stream$)/i.test(file.type);
    if(!extension||!mime||file.size===0||file.size>300*1024*1024){
      fileInput.value='';setStatus('请选择有效的 MP4、M4A、MP3、WAV、OGG 或 WebM，大小不超过 300 MB');return;
    }
    request++;resumeMedia=false;defaultTrack=false;media.loop=false;pauseMedia();stopSynth();
    const previousURL=objectURL;objectURL=URL.createObjectURL(file);media.src=objectURL;media.load();
    if(previousURL)URL.revokeObjectURL(previousURL);
    performance.loaded=true;performance.active=false;performance.time=0;baseline=0;lastBeat=-1;
    name.textContent=file.name;setStatus('正在读取本地音轨…');refresh();void playMedia();
  };
  media.addEventListener('play',()=>{
    if(!performance.loaded||media.paused||media.ended)return;
    internalPause=false;resumeMedia=true;stopSynth();
    if(scenePaused||getPaused()){scenePaused=true;pauseMedia();setStatus('场景已暂停；继续场景后播放音乐');}
    else{
      try{
        ensureContext();setStatus(source&&frequency?currentPlayingStatus():analysisUnavailable);
        if(context?.state==='suspended')void context.resume().catch(()=>setStatus('请再次点击播放器播放按钮以启用声音'));
      }catch{setStatus(analysisUnavailable);}
    }
    refresh();
  });
  media.addEventListener('pause',()=>{
    if(internalPause||!media.paused||!performance.loaded){internalPause=false;refresh();return;}
    if(media.error){refresh();return;}
    request++;resumeMedia=false;
    if(performance.loaded&&!media.ended)setStatus('音乐已暂停');refresh();
  });
  media.addEventListener('ended',()=>{request++;resumeMedia=false;setStatus('音乐已播放完毕，可点击播放重听或选择新文件');refresh();});
  media.addEventListener('volumechange',refresh);
  media.addEventListener('error',()=>{
    if(!performance.loaded)return;
    request++;resumeMedia=false;pauseMedia();
    setStatus(defaultTrack?'默认歌曲暂时无法读取，请点击重试或选择本地音乐':'无法读取音轨：MP4 需包含浏览器支持的音频。请换用 MP3、WAV 或其他文件');refresh();
  });
  function syncPause(paused){
    paused=Boolean(paused);if(paused===scenePaused)return;scenePaused=paused;
    if(synthBus)synthBus.gain.value=synthEnabled&&!paused?1:0;
    if(performance.loaded){
      if(paused){resumeMedia=resumeMedia||(!media.paused&&!media.ended);request++;pauseMedia();setStatus('场景已暂停；音乐同步暂停');}
      else if(resumeMedia&&!media.ended)void playMedia();
    }
    refresh();
  }
  function band(low,high){
    const size=context.sampleRate/analyser.fftSize;
    const start=Math.max(1,Math.floor(low/size)),end=Math.min(frequency.length,Math.ceil(high/size));
    let sum=0;for(let i=start;i<end;i++)sum+=frequency[i]/255;
    return end>start?sum/(end-start):0;
  }
  function update(dt){
    syncPause(getPaused());dt=Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.1));
    const eligible=performance.loaded&&!scenePaused&&!media.paused&&!media.ended&&!media.error;
    performance.time=performance.loaded&&Number.isFinite(media.currentTime)?media.currentTime:0;
    let level=0,bass=0,mid=0,high=0;
    if(eligible&&source&&frequency&&waveform&&context.state==='running'){
      analyser.getByteFrequencyData(frequency);analyser.getByteTimeDomainData(waveform);
      let squares=0;for(let i=0;i<waveform.length;i++){const value=(waveform[i]-128)/128;squares+=value*value;}
      const volume=media.muted?0:media.volume;level=clamp(Math.sqrt(squares/waveform.length)*3)*volume;
      bass=band(40,180)*volume;mid=band(180,2000)*volume;high=band(2000,12000)*volume;
      const energy=bass*.65+level*.35;
      baseline+=(energy-baseline)*(1-Math.exp(-dt*2));
      if(level>.025&&energy>Math.max(.035,baseline*1.3)&&performance.time-lastBeat>.2){performance.beat=1;lastBeat=performance.time;}
      if(performance.time<lastBeat)lastBeat=-1;
    }
    performance.active=eligible&&level>.005;
    if(performance.active)performance.phase+=dt*(1+performance.beat*2);
    if(eligible&&level<=.005){
      silentFor+=dt;
      if(silentFor>=3&&!silenceNotice&&status.textContent===currentPlayingStatus()){
        setStatus('暂未检测到声音，可能是静音片段；请检查音量或音轨');silenceNotice=true;
      }
    }else{
      silentFor=0;if(eligible&&silenceNotice)setStatus(currentPlayingStatus());
    }
    for(const [key,target] of [['level',level],['bass',bass],['mid',mid],['high',high]]){
      performance[key]+=(target-performance[key])*(1-Math.exp(-dt*(target>performance[key]?18:7)));
    }
    performance.beat*=Math.exp(-dt*8);
    if(meter){const value=performance.active?performance.level:0;meter.value=value;meter.setAttribute('aria-valuenow',value.toFixed(3));}
  }
  window.addEventListener('beforeunload',()=>{request++;stopSynth();pauseMedia();media.removeAttribute('src');media.load();if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;});
  if(defaultSource)loadDefault(false);
  refresh();return {performance,update,syncPause,startShow};
}
