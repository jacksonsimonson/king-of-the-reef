import { drawSeascape } from './art.ts';
import type { RegionId } from './maps.ts';

/** Original native-canvas encounter illustration, built on the existing four-pixel art grid. */
export function drawColossalArt(canvas: HTMLCanvasElement, region: RegionId, seed: string): void {
  drawSeascape(canvas,region,seed);
  const ctx=canvas.getContext('2d')!,cx=Math.floor(canvas.width/8)*4;
  const box=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(cx+x,y,w,h);};
  const dark='#102431',metal='#426271',light='#8eb2bb',gold='#f4c78b',reef='#69aa89',coral='#dc8d88';
  if (region==='shoreline') {
    // Huge crab legs and split pincers under a coral island.
    for (const side of [-1,1]) {
      for (let i=0;i<3;i++) {
        box(side<0?-200-i*20:120+i*20,172+i*16,80,16,dark);
        box(side<0?-216-i*20:184+i*20,180+i*16,20,40,'#8c6857');
      }
      const x=side<0?-268:196;
      box(x,112,72,64,dark);box(x+8,120,56,48,'#bd8a65');
      box(x+20,108,16,48,dark);box(x+4,100,24,24,gold);box(x+40,100,24,24,gold);
    }
    box(-156,100,312,88,dark);box(-140,84,280,92,'#7a8f68');box(-120,72,240,80,reef);
    box(-132,168,264,44,'#986e57');box(-112,164,224,20,'#bd8a65');
    for(const x of [-80,64]) {box(x,152,16,32,dark);box(x+4,152,8,8,gold);}
    for(const [x,y] of [[-100,32],[-28,12],[64,28]]) {
      box(x,y,12,64,coral);box(x-20,y+12,12,32,coral);box(x-20,y+36,52,12,coral);box(x+20,y,12,48,coral);
    }
    for(const x of [-120,-52,28,96]) {box(x,76,32,16,'#b6c78d');box(x+8,68,16,16,'#b6c78d');}
  } else if (region==='ocean') {
    box(-canvas.width,0,canvas.width*2,256,'#051623');
    for(let i=0;i<24;i++)box((i*73%600)-300,i*37%240,4,4,'#254553');
    box(-188,80,368,96,dark);box(-152,64,312,128,'#203845');
    box(92,68,116,108,'#314b55');box(140,84,76,68,'#3f5861');
    box(-236,100,68,24,'#314b55');box(-264,68,32,56,'#314b55');box(-256,128,40,40,'#314b55');
    box(-68,172,52,40,dark);box(-52,204,28,16,dark);
    box(56,144,152,28,'#060d16');box(28,172,176,16,'#647c80');
    for(let i=0;i<8;i++)box(64+i*16,144,8,12,'#b2c4bb');
    box(160,112,12,8,dark);box(164,112,4,4,'#b8dbcc');
    for(const x of [-124,-108,-92])box(x,84,4,28,'#647c80');
    for(const x of [-144,-100,-48,12])box(x,160,4,4,'#69a9ab');
  } else {
    box(-canvas.width,0,canvas.width*2,256,'#101b2b');
    // Observatory sphere, metal braces, six mechanical legs, and an exposed laser lens.
    for(const side of [-1,1])for(let i=0;i<3;i++){
      box(side<0?-200-i*24:120+i*24,132+i*28,80,12,metal);
      box(side<0?-212-i*24:188+i*24,140+i*28,16,48,light);
      box(side<0?-228-i*24:184+i*24,184+i*20,36,8,metal);
    }
    box(-128,48,256,144,dark);box(-112,32,224,176,metal);box(-88,20,176,200,metal);
    box(-104,60,208,120,light);box(-88,44,176,152,light);
    box(-72,52,144,144,dark);box(-88,68,176,112,dark);
    box(-56,68,112,112,'#716c86');box(-72,84,144,80,'#716c86');
    box(-40,84,80,80,'#cc686f');box(-24,100,48,48,'#f3aaa2');box(-8,112,16,24,'#fff0d4');
    box(-12,124,24,132,'#d45e78');box(-4,124,8,132,'#fff0d4');
    for(const x of [-100,84])for(const y of [52,92,172])box(x,y,12,8,gold);
    box(-48,8,8,24,light);box(-64,4,40,8,light);box(56,0,8,24,metal);
  }
}
