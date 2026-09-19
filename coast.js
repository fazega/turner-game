export const beachCoast=z=>-96+2*Math.sin((z-41)*.028)+.8*Math.sin(z*.083);
export const originalRearGround=(x,z)=>.20+Math.max(0,z-50)*.055+Math.sin(x*.022)*Math.sin(Math.max(0,z-50)*.015);
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function coastalGround(x,z){const d=x-beachCoast(z),land=originalRearGround(x,z);return d<0?-.55+d*.16:-.55+(land+.55)*smooth(0,9,d)}
export const sandWeight=(x,z)=>1-smooth(4,9,x-beachCoast(z));
