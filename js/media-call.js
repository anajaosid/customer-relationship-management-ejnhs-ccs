// Classic PeerJS peer.call()/call.answer() flow, adapted for a two-seat voice-only room.
// The verified room peer is the only peer allowed to make a media call. The joiner's
// explicit Answer click starts negotiation; room chat never contains audio samples.
function usableRoom(l){return live===l && !!l.code && !l.ws.closed && l.phase!=='ended'}
function disposeClassic(l){clearTimeout(l.classicTimeout);const c=l.classicCall;l.classicCall=null;if(c){if(l.pc===c.peerConnection){l.pc=null;l.trans=null}try{c.close()}catch{}}}
async function noteVoiceRoute(l){const pc=l.pc;if(!pc)return;try{const stats=await pc.getStats();const transport=[...stats.values()].find(s=>s.type==='transport'&&s.selectedCandidatePairId);const pair=stats.get(transport?.selectedCandidatePairId)||[...stats.values()].find(s=>s.type==='candidate-pair'&&s.state==='succeeded'&&s.nominated);if(!pair || !usableRoom(l)||pc!==l.pc)return;const types=[stats.get(pair.localCandidateId)?.candidateType,stats.get(pair.remoteCandidateId)?.candidateType];l.routeLabel=types.includes('relay')?'Relayed voice · TURN':'Direct voice · WebRTC';const el=$('.route-status');if(el)el.textContent=l.routeLabel}catch{}}
function bindClassicCall(l,c){
 l.classicCall=c;const pc=c.peerConnection;l.pc=pc;
 const valid=()=>usableRoom(l)&&l.classicCall===c;
 const ready=()=>{if(!valid())return;l.trans=pc.getTransceivers().find(t=>t.sender.track?.kind==='audio');clearTimeout(l.classicTimeout);openRoomAudio(l);noteVoiceRoute(l)};
 c.on('stream',stream=>{if(!valid())return;$('#remote').srcObject=stream;$('#remote').play().catch(()=>toast('Select Play partner audio to hear the call.'));if(pc.connectionState==='connected')ready()});
 pc.addEventListener('connectionstatechange',()=>{if(!valid())return;if(pc.connectionState==='connected')ready();else if(pc.connectionState==='failed')fallbackVoice(l)});
 c.on('error',()=>{if(valid())fallbackVoice(l)});c.on('close',()=>{if(valid())fallbackVoice(l)});
 if(pc.connectionState==='connected')ready();else l.classicTimeout=setTimeout(()=>{if(valid())fallbackVoice(l)},12000);
}
function receiveClassic(ws,c){const l=live;
 if(!l||l.ws!==ws||!usableRoom(l)||!l.isCreator||!ws.introduced||c.peer!==ws.link?.peer||c.metadata?.room!==l.code||c.metadata?.kind!=='ccs-voice'||l.voiceMethod!=='classic'||l.phase!=='ringing'||l.classicCall){c.close();return}
 l.phase='connecting';setLiveStatus('Connecting voice call');
 if(!l.stream){c.close();fallbackVoice(l);return}
 try{activatePreparedMic(l);c.answer(l.stream);bindClassicCall(l,c)}catch{c.close();fallbackVoice(l)}
}
function startClassic(l){
 if(!usableRoom(l)||!l.stream)return false;
 try{const c=l.ws.broker.call(l.ws.link.peer,l.stream,{metadata:{kind:'ccs-voice',room:l.code}});if(!c)return false;bindClassicCall(l,c);return true}catch{return false}
}
function fallbackVoice(l){
 if(!usableRoom(l)||l.voiceMethod==='shared')return;
 l.voiceMethod='shared';disposeClassic(l);l.phase='connecting';setLiveStatus('Reusing the room connection for voice');
 signal(l,{t:'voice-fallback'});if(!l.isCreator)startSharedVoice(l);
}
