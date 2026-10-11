import numpy as np, wave
from pathlib import Path
sr=32000;dur=104
out=np.zeros((sr*dur,2),dtype=np.float64)
rng=np.random.default_rng(8)
def note(midi,start,length,amp=.18,pan=0,flute=False):
 f=440*2**((midi-69)/12);t=np.arange(int(sr*length))/sr
 if flute:
  env=np.minimum(t/.35,1)*np.minimum((length-t)/.8,1)*np.exp(-t*.14)
  phase=2*np.pi*f*t+.006*f*np.sin(2*np.pi*4.7*t)
  sig=(np.sin(phase)+.16*np.sin(2*phase)+.035*np.sin(3*phase))*env*.42
 else:
  sig=np.zeros(len(t));env=(1-np.exp(-t*180))*np.exp(-t*1.1)
  for h,a in [(1,1),(2,.38),(3,.17),(4,.07),(5,.035)]:sig+=a*np.sin(2*np.pi*f*h*t)*np.exp(-t*(h-1)*.7)
  sig*=env
 pos=int(start*sr);n=min(len(sig),len(out)-pos)
 for c,g in enumerate([np.sqrt((1-pan)/2),np.sqrt((1+pan)/2)]):out[pos:pos+n,c]+=amp*g*sig[:n]
phrases=[[74,77,79,81,79,77,74,72],[74,72,69,72,74,77,74,69],[77,79,84,81,79,77,74,77],[79,77,74,72,69,72,74,74]]
beat=1.0
for block in range(8):
 base=block*12+2;mel=phrases[block%4]
 for j,m in enumerate(mel):note(m,base+j*1.3,4.3,.18,float(rng.uniform(-.35,.35)))
 root=[50,48,53,55][block%4]
 for j,step in enumerate([0,7,12,7]):note(root+step,base+j*3,6,.12,-.2 if j%2 else .2)
 if block in [2,3,5,6]:
  for j in range(3):note(mel[j*2]-12,base+j*3.5+.4,3.3,.11,.3,True)
# Soft room tails, staggered stereo reflections.
for delay,g in [(.127,.12),(.281,.1),(.433,.09),(.719,.065),(1.071,.04)]:
 shift=int(sr*delay);out[shift:]+=out[:-shift,::-1].copy()*g
fade=np.minimum(np.arange(sr*dur)/(sr*3),1)*np.minimum(np.arange(sr*dur)[::-1]/(sr*5),1)
out*=fade[:,None];out=out/max(1,np.max(np.abs(out))/.77)
with wave.open('output/jiangnan/jiangnan-reverie.wav','wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((out*32767).astype(np.int16).tobytes())
