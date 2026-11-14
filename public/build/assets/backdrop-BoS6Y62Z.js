var e=1150,t=`#version 300 es
precision highp float;

#define MAX_WAVES 24

uniform vec2 uResolution;      // drawing buffer size
uniform float uPixel;          // buffer pixels per CSS pixel
uniform float uTime;           // seconds
uniform vec2 uOrigin;          // where map position (0, 0) sits on screen
uniform float uScale;          // CSS pixels per map unit
uniform vec2 uMapSize;         // extent of the terrain, map units
uniform float uCell;           // spacing of the land marks
uniform float uElevationMax;   // height that uTerrain.r == 1 stands for

uniform sampler2D uField;
uniform sampler2D uTerrain;
uniform sampler2D uGlow;

uniform int uWaveCount;
uniform vec4 uWaves[MAX_WAVES];      // centre.xy, distance of the front from shore, strength
uniform vec4 uWaveShape[MAX_WAVES];  // spread along the crest, splash on the shore

out vec4 outColor;

const vec3 LAND = vec3(0.008, 0.024, 0.094);       // the page background
const vec3 LAND_UNYE = vec3(0.020, 0.047, 0.137);
const vec3 SEA_DEEP = vec3(0.012, 0.043, 0.129);
const vec3 SEA_SHALLOW = vec3(0.031, 0.114, 0.278);
const vec3 FOAM = vec3(0.760, 0.875, 1.000);
const vec3 SHORE = vec3(1.000, 1.000, 1.000);
const vec3 BORDER = vec3(0.860, 0.910, 1.000);
const vec3 MARK = vec3(0.560, 0.660, 0.830);

// Glow of a lit mark, by height: shoreline cyan, icy mid slopes, gold summits.
const vec3 GLOW_LOW = vec3(0.290, 0.871, 0.980);
const vec3 GLOW_MID = vec3(0.860, 0.940, 1.000);
const vec3 GLOW_HIGH = vec3(1.000, 0.800, 0.380);

const float SUMMIT = ${e.toFixed(1)};
const float WAVE_RATE = 0.26;     // crests reaching the shore per second
const float WAVELENGTH = 10.0;    // gap between crests at the shore
const float SHOAL = 70.0;         // how quickly that gap opens up offshore
const float TIDE_PERIOD = 15.0;   // seconds for the light to climb the land

float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
    );
}

// Where the incoming swell is in its cycle at a map position. A crest lands
// on the shore each time this passes a whole number, a little earlier or
// later from place to place.
float shorePhase(vec2 mapPosition) {
    float drift = noise(mapPosition * 0.0042 + vec2(0.0, uTime * 0.011));
    return uTime * WAVE_RATE + (drift - 0.5) * 3.2;
}

vec3 glowColor(float tint) {
    return tint < 0.45
        ? mix(GLOW_LOW, GLOW_MID, tint / 0.45)
        : mix(GLOW_MID, GLOW_HIGH, (tint - 0.45) / 0.55);
}

void main() {
    vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uPixel;
    vec2 mapPosition = (p - uOrigin) / uScale;
    vec2 uv = mapPosition / uMapSize;
    float aa = 0.5 / uPixel;

    vec2 field = texture(uField, uv).rg * uScale;
    float coast = field.r;                               // + at sea
    float district = field.g;                            // - inside Ünye
    float sea = smoothstep(-aa, aa, coast);

    vec3 color = LAND;
    float landing = 0.0;                                 // 1 as a crest lands, then fades
    float splash = 0.0;                                  // pointer-made waves landing here

    // ------------------------------------------------------------------ sea
    if (coast > -4.0) {
        float offshore = max(coast, 0.0);
        float depth = 1.0 - exp(-offshore / 190.0);
        float phase = shorePhase(mapPosition);

        landing = exp(-fract(phase) * 3.4);
        color = mix(SEA_SHALLOW, SEA_DEEP, depth);
        color *= 0.88 + 0.24 * noise(mapPosition * 0.006 - vec2(uTime * 0.006, 0.0));

        // Crests follow lines of equal distance from the shore, bunching up
        // and slowing down as the water gets shallow.
        float spacing = WAVELENGTH * (1.0 + offshore / SHOAL);
        float cycle = SHOAL * log(1.0 + offshore / SHOAL) / WAVELENGTH + phase;
        float behind = fract(cycle) * spacing;           // distance behind the crest ahead
        float width = mix(0.5, 0.34, depth);
        float crest = 1.0 - smoothstep(width - aa, width + aa, min(behind, spacing - behind));
        float wake = exp(-behind / (1.5 + 0.07 * spacing)) * 0.13;

        // Each crest is broken into its own drifting set of strokes.
        float strokes = noise(mapPosition * 0.017 + floor(cycle) * 5.7 + vec2(uTime * 0.017, 0.0));
        float broken = mix(smoothstep(0.38, 0.6, strokes), 1.0, exp(-offshore / 24.0));
        float reach = mix(0.085, 0.5, exp(-offshore / 115.0));
        float foam = (crest + wake) * broken * reach * smoothstep(1.0, 4.0, offshore);

        // Waves sent from the pointer: short trains of arcs riding in to
        // the shore.
        float sent = 0.0;
        for (int i = 0; i < uWaveCount; i++) {
            vec4 wave = uWaves[i];
            vec4 shape = uWaveShape[i];
            vec2 offset = p - wave.xy;
            float along = dot(offset, offset) / (shape.x * shape.x);
            if (along > 9.0) continue;

            float spread = exp(-along);
            float across = coast - wave.z;               // behind the leading crest
            float train =
                exp(-across * across / 0.9) +
                0.55 * exp(-(across - 6.5) * (across - 6.5) / 1.1) +
                0.26 * exp(-(across - 13.0) * (across - 13.0) / 1.4);

            sent += wave.w * spread * train;
            splash += shape.y * spread;
        }

        // Many waves landing together should not burn out the shore.
        foam += 1.0 - exp(-sent);
        splash = 1.0 - exp(-splash);

        // Surf: the water glows where it meets the shore, more as crests land.
        foam += exp(-offshore / (2.0 + 3.5 * landing + 2.0 * splash))
            * (0.08 + 0.26 * landing + 0.36 * splash);

        color += FOAM * foam;
    }

    // ----------------------------------------------------------------- land
    if (coast < 1.0) {
        float inside = smoothstep(aa, -aa, district);
        vec3 ground = mix(LAND, LAND_UNYE, inside);
        // A soft band of light just inside the district boundary.
        ground += vec3(0.30, 0.42, 0.62) * exp(min(district, 0.0) / 15.0) * inside * 0.085;

        // Marks sit on a brick-laid grid, one sample of the terrain each.
        float row = floor(p.y / uCell);
        float shift = mod(row, 2.0) * 0.5 * uCell;
        float column = floor((p.x - shift) / uCell);
        vec2 centre = vec2((column + 0.5) * uCell + shift, (row + 0.5) * uCell);
        vec2 centreMap = (centre - uOrigin) / uScale;
        vec2 centreUv = centreMap / uMapSize;

        vec2 centreField = texture(uField, centreUv).rg * uScale;
        float inland = -centreField.r;
        float home = smoothstep(1.0, -1.0, centreField.g);
        vec3 terrain = texture(uTerrain, centreUv).rgb;
        float metres = terrain.r * terrain.r * uElevationMax;
        float height = clamp(metres / SUMMIT, 0.0, 1.0);
        float lift = terrain.b;                          // 1 on ridges, 0 in valley floors
        vec2 lit = texelFetch(uGlow, ivec2(int(column) + 1, int(row)), 0).rg;

        // A tide of light climbs the terrain, from the foot of the hills to
        // the summits, one contour at a time. It lingers in the lowlands,
        // where a metre of height is a long way across the map.
        float tide = fract(uTime / TIDE_PERIOD);
        float climb = mix(0.12, 1.12, tide);
        float level = 1250.0 * climb * climb;
        float band = (metres - level) / (12.0 + 0.05 * level);
        float rising = exp(-band * band)
            * smoothstep(0.0, 0.06, tide) * (1.0 - smoothstep(0.84, 1.0, tide))
            * mix(0.16, 0.4, home);

        float glow = max(lit.r, rising);
        float tint = lit.r > rising ? lit.g : height;

        // Ridges carry large bright marks, valleys shrink to specks.
        float strength = (0.105 + 0.375 * height + 0.75 * pow(lift, 2.2)) * (0.5 + terrain.g);

        // Each landing crest washes a little way inland before it dies out.
        if (inland < 150.0) {
            strength += 0.45
                * exp(-fract(shorePhase(centreMap) - inland / 90.0) * 3.0)
                * exp(-inland / 38.0);
        }

        strength = min(strength, 1.0) * mix(0.42, 1.0, home);

        // A lit mark grows and turns from x to +.
        float turn = 0.7854 * (1.0 + glow);
        vec2 q = p - centre;
        q = vec2(q.x * cos(turn) - q.y * sin(turn), q.x * sin(turn) + q.y * cos(turn));
        float arm = uCell * (0.045 + 0.05 * height + 0.14 * pow(lift, 1.4));
        arm = mix(arm, uCell * 0.27, glow);
        float stroke = 0.5 + 0.3 * glow;
        float gap = min(
            length(vec2(max(abs(q.x) - arm, 0.0), q.y)),
            length(vec2(q.x, max(abs(q.y) - arm, 0.0)))
        );
        float mark = 1.0 - smoothstep(stroke - aa, stroke + aa, gap);
        float halo = exp(-gap * gap / (0.05 * uCell * uCell));
        // Nothing is drawn where a mark would stray across the shoreline.
        float present = smoothstep(4.0, 9.0, inland);

        ground += MARK * mark * strength * present;
        ground += glowColor(tint) * (mark * 0.95 + halo * 0.4) * glow * present;

        // The district boundary, away from the shore.
        float border = 1.0 - smoothstep(0.5 - aa, 0.5 + aa, abs(district));
        ground = mix(ground, BORDER, border * 0.5 * smoothstep(2.0, 6.0, -coast));

        color = mix(ground, color, sea);
    }

    // ------------------------------------------------------------ shoreline
    float ours = smoothstep(3.0, 0.5, district);         // Ünye's own stretch of coast
    float halfWidth = mix(0.4, 0.8, ours) + 0.3 * landing * ours + 0.65 * splash;
    float shoreline = 1.0 - smoothstep(halfWidth - aa, halfWidth + aa, abs(coast));
    color = mix(color, SHORE, min(shoreline * (mix(0.4, 1.0, ours) + splash), 1.0));
    color += SHORE * exp(-abs(coast) / 5.0) * (0.05 * ours + 0.06 * splash);

    // Fade to the page colour where the terrain data runs out.
    vec2 margin = min(uv, 1.0 - uv);
    color = mix(LAND, color, smoothstep(0.0, 0.015, min(margin.x, margin.y)));

    // A whisper of noise keeps the gradients from banding.
    color += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

    outColor = vec4(color, 1.0);
}
`;function n(e,t,n){let{width:r,height:i}=n,a=r*i,o=n.bytes===2?new Int16Array(a):new Int8Array(a);for(let s=0,c=0;s<i;s++)for(let i=0;i<r;i++,c++){let l=n.bytes===2?e[t+c]|e[t+a+c]<<8:e[t+c],u=l>>>1^-(l&1);i>0&&(u+=o[c-1]),s>0&&(u+=o[c-r]),i>0&&s>0&&(u-=o[c-r-1]),o[c]=u}return o}async function r(e){let t=e.body;if(!t||typeof DecompressionStream>`u`)throw Error(`Streaming decompression is not available.`);let n=t.pipeThrough(new DecompressionStream(`gzip`));return new Uint8Array(await new Response(n).arrayBuffer())}async function i(e,t){let i=await fetch(e,{signal:t});if(!i.ok)throw Error(`Terrain request failed (${i.status}).`);let a=await r(i),o=new DataView(a.buffer,a.byteOffset,a.byteLength);if(o.getUint32(0,!0)!==1163480661||o.getUint16(4,!0)!==1)throw Error(`Unrecognised terrain pack.`);let s=o.getUint16(6,!0),c=JSON.parse(new TextDecoder().decode(a.subarray(8,8+s))),{coast:l,district:u,elevation:d}=c.layers,f=8+s,p=(e,t)=>{let r=n(a,f,e),i=new Float32Array(r.length);for(let e=0;e<r.length;e++)i[e]=t(r[e]);return f+=r.length*e.bytes,{width:e.width,height:e.height,step:c.width/e.width,data:i}},m=l.scale??1,h=u.scale??1,g=d.max??1,{mercator:_}=c;return{width:c.width,height:c.height,metresPerUnit:c.metresPerUnit,district:c.district,town:c.town,coast:p(l,e=>e*m),boundary:p(u,e=>e*h),elevation:p(d,e=>{let t=(e&255)/255;return t*t*g}),toLonLat(e,t){let n=(e+_.x)/_.size*360-180,r=Math.PI*(1-2*(t+_.y)/_.size);return[n,Math.atan(Math.sinh(r))*180/Math.PI]}}}function a(e,t,n){let{width:r,height:i,data:a}=e,o=Math.min(Math.max(t/e.step-.5,0),r-1),s=Math.min(Math.max(n/e.step-.5,0),i-1),c=Math.min(Math.floor(o),r-2),l=Math.min(Math.floor(s),i-2),u=o-c,d=s-l,f=l*r+c;return(a[f]*(1-u)+a[f+1]*u)*(1-d)+(a[f+r]*(1-u)+a[f+r+1]*u)*d}var o=(e,t,n)=>Math.min(Math.max(e,t),n);function s(e,t){let{width:n,height:r,data:i}=e,a=new Float32Array(n*r),s=8*e.step*t,c=2.4,l=(e,t)=>i[o(t,0,r-1)*n+o(e,0,n-1)];for(let e=0;e<r;e++)for(let t=0;t<n;t++){let r=l(t+1,e-1)+2*l(t+1,e)+l(t+1,e+1)-(l(t-1,e-1)+2*l(t-1,e)+l(t-1,e+1)),i=l(t-1,e+1)+2*l(t,e+1)+l(t+1,e+1)-(l(t-1,e-1)+2*l(t,e-1)+l(t+1,e-1)),u=-r/s*c,d=-i/s*c,f=(.5*-u+.5*-d+Math.SQRT1_2)/Math.hypot(u,d,1);a[e*n+t]=o(.5+(f-Math.SQRT1_2)*.9,0,1)}return a}function c(e){let{width:t,height:n,data:r}=e,i=Math.round(28/e.step),a=t+1,s=new Float64Array(a*(n+1));for(let e=0;e<n;e++)for(let n=0,i=0;n<t;n++)i+=r[e*t+n],s[(e+1)*a+n+1]=s[e*a+n+1]+i;let c=new Float32Array(t*n);for(let e=0;e<n;e++){let l=Math.max(e-i,0),u=Math.min(e+i+1,n);for(let n=0;n<t;n++){let d=Math.max(n-i,0),f=Math.min(n+i+1,t),p=(s[u*a+f]-s[l*a+f]-s[u*a+d]+s[l*a+d])/((u-l)*(f-d));c[e*t+n]=o(.5+(r[e*t+n]-p)/180,0,1)}}return c}var l=`/build/assets/unye-DitQCBXx.bin`,u=185,d=.85,f=10,p=150,m=1.9,h=14,g=26,_=58,v=2,y=5e6,b=13,x=30,S=(e,t,n)=>Math.min(Math.max(e,t),n),C=class{canvas;terrain;hooks;gl;program=null;uniforms={};glowTexture=null;width=0;height=0;pixel=1;quality=1;scale=1;originX=0;originY=0;cell=12;columns=0;rows=0;metres=new Float32Array;marked=new Uint8Array;glow=new Float32Array;tint=new Float32Array;glowBytes=new Uint8Array;lit=!1;glowSent=!1;waves=[];ripples=[];lastLanding=-1/0;waveData=new Float32Array(96);waveShape=new Float32Array(96);pointer={x:0,y:0,lastX:0,lastY:0,at:-1/0,here:!1,pressed:!1,travel:0,read:!0};hover=0;time=0;last=0;frame=0;slow=0;still;shown=!1;listeners=new AbortController;observer=new ResizeObserver(()=>this.resize());motion=window.matchMedia(`(prefers-reduced-motion: reduce)`);constructor(e,t,n={}){this.canvas=e,this.terrain=t,this.hooks=n;let r=e.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:`low-power`,failIfMajorPerformanceCaveat:!0});if(!r)throw Error(`WebGL 2 is not available.`);this.gl=r,this.still=this.motion.matches,this.build(),this.listen(),this.observer.observe(e),this.resize(),this.start()}destroy(){cancelAnimationFrame(this.frame),this.listeners.abort(),this.observer.disconnect(),this.gl.deleteProgram(this.program),this.program=null}listen(){let{canvas:e,pointer:t}=this,n={signal:this.listeners.signal,passive:!0},r=e=>{(!t.here||this.time-t.at>.4)&&(t.lastX=e.clientX,t.lastY=e.clientY),t.x=e.clientX,t.y=e.clientY,t.at=this.time,t.here=!0,t.read=!1,t.pressed||=e.type===`pointerdown`},i=()=>{t.here=!1,t.read=!1},a=e=>{e.pointerType!==`mouse`&&i()};window.addEventListener(`pointermove`,r,n),window.addEventListener(`pointerdown`,r,n),window.addEventListener(`pointerup`,a,n),window.addEventListener(`pointercancel`,a,n),window.addEventListener(`blur`,i,n),document.documentElement.addEventListener(`pointerleave`,i,n),window.addEventListener(`resize`,()=>this.resize(),n),document.addEventListener(`visibilitychange`,()=>this.start(),n),this.motion.addEventListener(`change`,()=>{this.still=this.motion.matches,this.start()},n),e.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),cancelAnimationFrame(this.frame)},{signal:this.listeners.signal}),e.addEventListener(`webglcontextrestored`,()=>{this.build(),this.width=0,this.resize(),this.start()},n)}build(){let{gl:e,terrain:n}=this,r=e.createProgram();for(let[n,i]of[[e.VERTEX_SHADER,`#version 300 es
void main() {
    vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
    gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`],[e.FRAGMENT_SHADER,t]]){let t=e.createShader(n);e.shaderSource(t,i),e.compileShader(t),e.attachShader(r,t)}if(e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS)&&!e.isContextLost())throw Error(e.getProgramInfoLog(r)||`The shader failed to build.`);this.program=r,this.uniforms={},e.useProgram(r),e.bindVertexArray(e.createVertexArray());let i=e.getProgramParameter(r,e.ACTIVE_UNIFORMS);for(let t=0;t<i;t++){let n=e.getActiveUniform(r,t)?.name??``;this.uniforms[n.replace(`[0]`,``)]=e.getUniformLocation(r,n)}let a=(t,n)=>{let r=e.createTexture();return e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),r};e.pixelStorei(e.UNPACK_ALIGNMENT,1);let{coast:o,boundary:l,elevation:u}=n,d=new Float32Array(o.data.length*2);for(let e=0;e<o.data.length;e++)d[e*2]=o.data[e],d[e*2+1]=l.data[e];a(0,e.LINEAR),e.texImage2D(e.TEXTURE_2D,0,e.RG16F,o.width,o.height,0,e.RG,e.FLOAT,d);let f=u.data.reduce((e,t)=>Math.max(e,t),1),p=s(u,n.metresPerUnit),m=c(u),h=new Uint8Array(u.data.length*3);for(let e=0;e<u.data.length;e++)h[e*3]=Math.sqrt(u.data[e]/f)*255+.5,h[e*3+1]=p[e]*255+.5,h[e*3+2]=m[e]*255+.5;a(1,e.LINEAR),e.texImage2D(e.TEXTURE_2D,0,e.RGB8,u.width,u.height,0,e.RGB,e.UNSIGNED_BYTE,h),this.glowTexture=a(2,e.NEAREST),e.uniform1i(this.uniforms.uField,0),e.uniform1i(this.uniforms.uTerrain,1),e.uniform1i(this.uniforms.uGlow,2),e.uniform2f(this.uniforms.uMapSize,n.width,n.height),e.uniform1f(this.uniforms.uElevationMax,f)}resize(){let e=this.canvas.clientWidth,t=this.canvas.clientHeight;if(e===0||t===0||this.gl.isContextLost())return;let n=Math.max(Math.min(window.devicePixelRatio||1,v,Math.sqrt(y/(e*t)))*this.quality,.75),r=e!==this.width||t!==this.height;(r||n!==this.pixel)&&(this.width=e,this.height=t,this.pixel=n,this.canvas.width=Math.round(e*n),this.canvas.height=Math.round(t*n),this.gl.viewport(0,0,this.canvas.width,this.canvas.height),r&&(this.fit(),this.layOutMarks()),this.still&&this.draw())}fit(){let{terrain:e,width:t,height:n}=this,[r,i,a,o]=e.district;this.scale=Math.max(Math.min(t*.92/(a-r),n*.6/(o-i)),t/(e.width-60),n/(e.height-60)),this.originX=S(t/2-(r+a)/2*this.scale,t-(e.width-30)*this.scale,-30*this.scale),this.originY=S(n*.34-i*this.scale,n-(e.height-30)*this.scale,-30*this.scale)}layOutMarks(){let{gl:e,terrain:t}=this;this.cell=S(Math.round(this.scale*11.5),9,16),this.columns=Math.ceil(this.width/this.cell)+2,this.rows=Math.ceil(this.height/this.cell)+1;let n=this.columns*this.rows;this.metres=new Float32Array(n),this.marked=new Uint8Array(n),this.glow=new Float32Array(n),this.tint=new Float32Array(n),this.glowBytes=new Uint8Array(n*2),this.lit=!1,this.glowSent=!1;for(let e=0,n=0;e<this.rows;e++)for(let r=0;r<this.columns;r++,n++){let i=this.toMapX(this.markX(r,e)),o=this.toMapY(this.markY(e));this.metres[n]=a(t.elevation,i,o),this.marked[n]=+(a(t.coast,i,o)*this.scale<-4)}e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,this.glowTexture),e.texImage2D(e.TEXTURE_2D,0,e.RG8,this.columns,this.rows,0,e.RG,e.UNSIGNED_BYTE,this.glowBytes)}markX(e,t){return(e-.5+t%2*.5)*this.cell}markY(e){return(e+.5)*this.cell}toMapX(e){return(e-this.originX)/this.scale}toMapY(e){return(e-this.originY)/this.scale}follow(e){let{pointer:t,terrain:n,hooks:r}=this,i=this.toMapX(t.x),o=this.toMapY(t.y),s=a(n.coast,i,o),c=s>0,l=t.pressed;if(t.pressed=!1,this.hover+=((t.here&&!c?1:0)-this.hover)*(1-Math.exp(-e/.09)),!t.read){if(t.read=!0,t.here){let[e,t]=n.toLonLat(i,o),s=c?0:a(n.elevation,i,o);r.onReading?.({longitude:e,latitude:t,metres:s,atSea:c})}else r.onReading?.(null)}(t.here||l)&&(t.travel+=Math.hypot(t.x-t.lastX,t.y-t.lastY),t.lastX=t.x,t.lastY=t.y,c&&(l||t.travel>=g)?(t.travel=0,this.waves.length>=24&&this.waves.shift(),this.waves.push({x:i,y:o,start:s,front:s,born:this.time,landed:null})):!c&&(l||t.travel>=_)&&(t.travel=0,this.sendRipple(i,o,a(n.elevation,i,o),l?1:.8,(l?15:11)*this.cell)))}sendRipple(e,t,n,r,i){this.ripples.length>=h&&this.ripples.shift(),this.ripples.push({x:e,y:t,metres:n,born:this.time,strength:r,reach:i})}advanceWaves(e){let{waves:t,waveData:n,waveShape:r,scale:i,time:o}=this,{coast:s}=this.terrain;for(let n=t.length-1;n>=0;n--){let r=t[n],c=Math.max(r.front,0)*i/150,l=u*(.4+.6*Math.min(c,1))*e/i;if(r.landed!==null){r.front=Math.max(r.front-l,-16/i),o-r.landed>d&&t.splice(n,1);continue}let p=a(s,r.x+s.step,r.y)-a(s,r.x-s.step,r.y),m=a(s,r.x,r.y+s.step)-a(s,r.x,r.y-s.step),h=Math.hypot(p,m)||1;r.x-=p/h*l,r.y-=m/h*l,r.front=a(s,r.x,r.y),r.front<=0?(r.landed=o,o-this.lastLanding>.09&&(this.lastLanding=o,this.sendRipple(r.x,r.y,0,.5,7*this.cell))):o-r.born>f&&t.splice(n,1)}t.forEach((e,t)=>{let a=o-e.born,s=1-Math.max(e.front,0)/Math.max(e.start,1),c=e.landed===null?0:(o-e.landed)/d,l=Math.min(a/.14,1)*(1-c)*S(f-a,0,1);n[t*4]=e.x*i+this.originX,n[t*4+1]=e.y*i+this.originY,n[t*4+2]=e.front*i,n[t*4+3]=.9*l,r[t*4]=(11+17*s)*(1+.7*c),r[t*4+1]=e.landed===null?0:.9*Math.sin(Math.PI*Math.sqrt(c))})}forMarksNear(e,t,n,r){let{cell:i,columns:a,rows:o,marked:s}=this,c=Math.max(Math.floor((t-n)/i),0),l=Math.min(Math.ceil((t+n)/i),o-1),u=Math.max(Math.floor((e-n)/i),0),d=Math.min(Math.ceil((e+n)/i)+1,a-1);for(let i=c;i<=l;i++)for(let o=u;o<=d;o++){let c=i*a+o,l=((this.markX(o,i)-e)**2+(this.markY(i)-t)**2)/(n*n);s[c]&&l<1&&r(c,(1-l)*(1-l))}}light(t){let{glow:n,tint:r,metres:i,pointer:a,cell:o}=this,s=(e,t,i)=>{t>n[e]&&(n[e]=t,r[e]=i)};if(this.lit){let e=Math.exp(-t/.38),r=0;for(let t=0;t<n.length;t++)n[t]*=e,r=Math.max(r,n[t]);this.lit=r>.004}if(this.hover>.01){let t=6.4*o,n=1/0,r=-1/0;this.forMarksNear(a.x,a.y,t,e=>{n=Math.min(n,i[e]),r=Math.max(r,i[e])});let c=Math.max(r-n,60);this.forMarksNear(a.x,a.y,t,(t,r)=>{let a=(i[t]-n)/c;s(t,this.hover*r*(.22+.78*a),S(.3*(i[t]/e)+.7*a,0,1))}),this.lit=!0}for(let t=this.ripples.length-1;t>=0;t--){let n=this.ripples[t],r=this.time-n.born;if(r>m){this.ripples.splice(t,1);continue}let a=r*p,o=15+a*.09,c=n.strength*(1-r/m)**1.4;this.forMarksNear(n.x*this.scale+this.originX,n.y*this.scale+this.originY,n.reach,(t,r)=>{let l=(Math.abs(i[t]-n.metres)-a)/o;s(t,c*r*Math.exp(-l*l),S(i[t]/e,0,1))}),this.lit=!0}}draw(){let{gl:e,uniforms:t,glow:n,tint:r,glowBytes:i}=this;if(this.program&&!e.isContextLost()){if(this.lit||this.glowSent){for(let e=0;e<n.length;e++)i[e*2]=this.lit?Math.min(n[e],1)*255:0,i[e*2+1]=r[e]*255;e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,this.glowTexture),e.texSubImage2D(e.TEXTURE_2D,0,0,0,this.columns,this.rows,e.RG,e.UNSIGNED_BYTE,i),this.glowSent=this.lit}e.uniform2f(t.uResolution,this.canvas.width,this.canvas.height),e.uniform1f(t.uPixel,this.pixel),e.uniform1f(t.uTime,this.time),e.uniform2f(t.uOrigin,this.originX,this.originY),e.uniform1f(t.uScale,this.scale),e.uniform1f(t.uCell,this.cell),e.uniform1i(t.uWaveCount,this.waves.length),e.uniform4fv(t.uWaves,this.waveData),e.uniform4fv(t.uWaveShape,this.waveShape),e.drawArrays(e.TRIANGLES,0,3),this.shown||(this.shown=!0,this.hooks.onFirstFrame?.())}}start(){cancelAnimationFrame(this.frame),document.hidden||this.listeners.signal.aborted||(this.still?(this.time=2.4,this.draw()):(this.last=performance.now(),this.frame=requestAnimationFrame(this.tick)))}tick=e=>{this.frame=requestAnimationFrame(this.tick);let{pointer:t}=this,n=this.waves.length>0||this.ripples.length>0||!t.read||this.time-t.at<1.5;if(e-this.last<(n?b:x))return;let r=Math.min((e-this.last)/1e3,.1);this.last=e,this.time+=r,this.follow(r),this.advanceWaves(r),this.light(r),this.draw(),this.slow=r>(n?.042:.068)?this.slow+1:Math.max(this.slow-2,0),this.slow>45&&this.quality>.5&&(this.slow=0,this.quality*=.8,this.resize())}};async function w(e,t,n){let r=await i(l,n);return n.throwIfAborted(),new C(e,r,t)}export{w as mountBackdrop};