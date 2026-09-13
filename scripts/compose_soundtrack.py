"""Original, deterministic gothic game score. No borrowed samples or melodies.
Requires NumPy and ffmpeg. Writes seamless circular mixes with release/reverb tails.
"""
from pathlib import Path
import numpy as np
import wave, subprocess, json
SR=44100
OUT=Path('public/audio'); OUT.mkdir(parents=True,exist_ok=True)
TMP=Path('artifacts/vfx-audio-1'); TMP.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(6113)
def voice(midi,duration,instrument):
    t=np.arange(int((duration+1.5)*SR))/SR; f=440*2**((midi-69)/12)
    if instrument=='bell':
        x=sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t*d) for r,a,d in [(1,1,1.7),(2,.35,2.2),(2.997,.16,3),(4.02,.07,4.4)])
        attack=.005
    elif instrument=='pluck':
        x=sum(np.sin(2*np.pi*f*h*t)/h*np.exp(-t*(2.5+h*.7)) for h in range(1,10));attack=.003
    elif instrument=='organ':
        x=sum(a*np.sin(2*np.pi*f*h*t) for h,a in [(1,.8),(2,.24),(3,.12),(4,.07),(6,.035)])*.7;attack=.09
    elif instrument=='strings':
        x=sum(np.sin(2*np.pi*f*det*h*t+np.sin(t*5)*.05)/(h**1.7) for det in [.997,1.003] for h in range(1,7))*.36;attack=.17
    else:
        x=np.sin(2*np.pi*f*t)+.16*np.sin(4*np.pi*f*t);attack=.025
    env=np.minimum(1,t/attack)*np.exp(-np.maximum(0,t-duration)/(.4 if instrument in ['strings','organ'] else .18))
    return (x*env).astype(np.float32)
def compose(name,bpm,bars,boss):
    beat=60/bpm; n=round(bars*4*beat*SR); mix=np.zeros((n,2),dtype=np.float32)
    def add(samples,start,vol,pan=0):
        arr=np.column_stack((samples*np.sqrt((1-pan)/2),samples*np.sqrt((1+pan)/2)))*vol
        at=round(start*SR)%n
        for offset in range(0,len(arr),n):
            chunk=arr[offset:offset+n]; first=min(len(chunk),n-at);mix[at:at+first]+=chunk[:first];mix[:len(chunk)-first]+=chunk[first:]
    def note(m,at,dur,inst,vol,pan=0): add(voice(m,dur*beat,inst),at*beat,vol,pan)
    # D minor, B-flat, G minor, A dominant. Eight-bar phrases with a contrasting second theme.
    chords=[(38,50,53,57),(38,50,53,57),(34,46,50,53),(36,48,52,55),(31,43,46,50),(34,46,50,53),(33,45,49,52),(33,45,49,55)]
    melody=[[74,77,81,77],[76,74,69,72],[74,77,70,74],[72,76,79,76],[79,77,74,70],[77,74,70,69],[73,76,81,79],[76,73,69,73]]
    for bar in range(bars):
        root,*chord=chords[bar%8]; at=bar*4; section=bar//8
        for i,m in enumerate(chord):note(m,at,3.8,'strings',.07 if boss else .09,[-.45,.12,.5][i])
        note(root,at,3.65 if not boss else 1.8,'organ',.12,0)
        if boss:note(root,at+2,1.8,'bass',.12,0)
        # Harpsichord ostinato; exploration leaves room around a slower bell melody.
        steps=8 if boss else 4
        for step in range(steps):
            m=chord[[0,1,2,1,0,2,1,2][step%8]]+12
            note(m,at+step*(4/steps),.3 if boss else .7,'pluck',.085 if boss else .06,(-.35 if step%2 else .35))
        phrase=melody[bar%8]
        if section%3==1:phrase=[m+(-12 if i==1 else 0) for i,m in enumerate(reversed(phrase))]
        if boss or bar%2==0:
            for j,m in enumerate(phrase):note(m,at+j,.55 if boss else 1.3,'organ' if boss else 'bell',.072 if boss else .1,.18)
        if not boss and section==2:
            note(chord[1]+12,at+1.5,1.5,'strings',.06,-.55)
        # Low toms, restrained noise snares and brushed high percussion.
        for b in range(4):
            if boss or (bar%2==0 and b==0):
                t=np.arange(int(SR*.55))/SR
                drum=np.sin(2*np.pi*(44*t+52*.025*(1-np.exp(-t/.025))))*np.exp(-t*9)
                drum*=np.minimum(1,t/.003);add(drum, (at+b)*beat,.22 if boss else .08)
            if boss and b%2:
                t=np.arange(int(SR*.22))/SR; noise=rng.normal(0,1,len(t));noise=np.convolve(noise,[.25,.5,.25],mode='same')
                add(noise*np.exp(-t*20)*np.minimum(1,t/.003),(at+b)*beat,.09,-.15)
        if boss:
            for j in range(8):
                t=np.arange(int(SR*.065))/SR;h=rng.normal(0,1,len(t));h=h-np.roll(h,1)
                add(h*np.exp(-t*65)*np.minimum(1,t/.001),(at+j*.5)*beat,.014,.6)
        if bar%8==7:
            for j in range(3):note(root+12,at+3+j/3,.17,'bass',.12 if boss else .04,-.4+j*.4)
    dry=mix.copy()
    for delay,amp in [(.073,.16),(.139,.12),(.227,.09),(.371,.065),(.613,.035)]:
        mix+=np.roll(dry[:,::-1],round(delay*SR),axis=0)*amp
    mix=np.tanh(mix*1.25);mix*=.78/max(.01,np.max(np.abs(mix)))
    wav=TMP/(name+'.wav')
    with wave.open(str(wav),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a','160k',str(OUT/(name+'.mp3'))],check=True)
    return {'file':name+'.mp3','bpm':bpm,'bars':bars,'duration':n/SR,'peak':float(np.max(abs(mix))),'rms':float(np.sqrt(np.mean(mix**2))),'seamDelta':float(np.max(abs(mix[0]-mix[-1])))}
tracks=[compose('lanterns-in-the-keep',78,24,False),compose('crown-of-cinders',132,32,True)]
Path('public/audio/manifest.json').write_text(json.dumps({'composer':'Ashen Keep original procedural score','license':'Project original, no external samples','tracks':tracks},indent=2))
print(json.dumps(tracks,indent=2))
