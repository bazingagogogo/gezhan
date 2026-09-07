import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import * as CANNON from 'cannon-es'
import { gsap } from 'gsap'

const ASSETS = '/noomo/'

// Independent WebGL implementation of the reference's screen-space glass.
// The user's live heading is rendered into the refraction buffer, not a screenshot.
const glassVertex = `
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vLocal;
  void main() {
    vUv = uv;
    vLocal = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
const glassFragment = `
  uniform mat4 projectionMatrix;
  uniform sampler2D tScene;
  uniform sampler2D tNormal;
  uniform sampler2D tEnvironment;
  uniform vec2 resolution;
  uniform float environmentMax;
  uniform float activeColor;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vLocal;
  float rippleHeight(vec3 p) {
    vec2 q = (p.xy + p.z * vec2(.31,.47)) * 15.0;
    q += vec2(sin(q.y*.63), sin(q.x*.57)) * .7;
    return sin(q.x + sin(q.y*.81)) * sin(q.y + sin(q.x*.73))
      + .28 * sin(q.x*1.87 + q.y*.61)
      + .12 * sin(q.x*2.71 + sin(q.y*2.3)) * sin(q.y*2.17);
  }
  vec3 surfaceNormal() {
    vec3 q0 = dFdx(vWorld), q1 = dFdy(vWorld);
    vec2 s0 = dFdx(vUv), s1 = dFdy(vUv);
    vec3 n = normalize(vNormal);
    vec3 t = normalize(q0 * s1.y - q1 * s0.y);
    vec3 b = -normalize(cross(n, t));
    vec3 mapN = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;
    vec3 textured = normalize(mat3(t, b, n) * vec3(mapN.xy * 0.24192, mapN.z));
    // Object-locked hammered-glass relief: its normals bend both refraction
    // and HDR reflections, rather than drawing a silver overlay on the glass.
    float height = rippleHeight(vLocal);
    vec3 r1 = cross(q1, textured), r2 = cross(textured, q0);
    float det = dot(q0, r1);
    vec3 slope = sign(det) * (dFdx(height)*r1 + dFdy(height)*r2);
    return normalize(max(abs(det), 1e-10)*textured - slope*.012);
  }
  vec2 project(vec3 p) {
    vec4 clip = projectionMatrix * viewMatrix * vec4(p, 1.0);
    return clip.xy / clip.w * 0.5 + 0.5;
  }
  vec3 environment(vec3 direction) {
    vec2 uv = vec2(atan(direction.z, direction.x) / 6.2831853 + 0.5,
                   asin(clamp(direction.y, -1.0, 1.0)) / 3.14159265 + 0.5);
    return texture2D(tEnvironment, uv).rgb * environmentMax;
  }
  vec3 softScene(vec2 uv) {
    vec2 pixel = (4.0 + 2.0 * abs(rippleHeight(vLocal))) / resolution;
    vec3 center = texture2D(tScene,uv).rgb;
    vec3 blur = center*.2;
    blur += (texture2D(tScene,uv+vec2(pixel.x,0.)).rgb + texture2D(tScene,uv-vec2(pixel.x,0.)).rgb
      + texture2D(tScene,uv+vec2(0.,pixel.y)).rgb + texture2D(tScene,uv-vec2(0.,pixel.y)).rgb)*.12;
    blur += (texture2D(tScene,uv+pixel).rgb + texture2D(tScene,uv-pixel).rgb
      + texture2D(tScene,uv+vec2(pixel.x,-pixel.y)).rgb + texture2D(tScene,uv+vec2(-pixel.x,pixel.y)).rgb)*.08;
    return mix(center,blur,.78);
  }
  void main() {
    vec3 n = surfaceNormal();
    vec3 incident = normalize(vWorld - cameraPosition);
    if (dot(n, incident) > 0.0) n = -n;
    vec2 a = project(vWorld + refract(incident, n, 1.0 / 1.25) * 0.35);
    vec2 b = project(vWorld + refract(incident, n, 1.0 / mix(1.34, 1.66, activeColor)) * 0.35);
    vec3 sum = vec3(0.0), weights = vec3(0.0);
    float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453);
    for (int i = 0; i < 5; i++) {
      float f = (float(i) + jitter) / 5.0;
      // Narrow spectral lobes retain colored fringes instead of averaging white.
      vec3 delta = (vec3(f) - vec3(0.12,0.5,0.88)) / .23;
      vec3 w = exp(-delta*delta*2.0) + .008;
      sum += softScene(clamp(mix(a,b,f), vec2(0.001), vec2(0.999))) * w;
      weights += w;
    }
    vec3 refracted = sum / weights * vec3(0.90,0.97,1.0);
    // Contrast within glass: absorb the blue field, preserving neutral lettering
    // and chrome balls. This is not a global photographic negative.
    float blueField = smoothstep(0.015, 0.16, refracted.b - max(refracted.r, refracted.g));
    refracted *= mix(1.0, 0.08, blueField * activeColor);
    float facing = clamp(dot(n,-incident),0.0,1.0);
    float fresnel = pow(1.0-facing,3.5);
    vec3 reflected = environment(reflect(incident,n));
    vec3 textureNormal = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;
    float surfaceDetail = smoothstep(0.035, 0.22, length(textureNormal.xy));
    float rippleCrest = smoothstep(.3, 1.05, abs(rippleHeight(vLocal)));
    float reflectionWeight = .0084 + 2.352*fresnel + surfaceDetail*.0168 + rippleCrest*.0084;
    // Reference-style angle-dependent iridescence, modulating actual HDR light.
    // No opaque rainbow overlay: front-facing glass still transmits the heading.
    vec3 spectrum = .5 + .5*cos(6.2831853*(facing*1.65 + vec3(0.,.333,.667)));
    spectrum = mix(vec3(1.), spectrum*1.8 + .08, .78*activeColor);
    vec3 silverReflection = mix(reflected, vec3(dot(reflected, vec3(.299,.587,.114))), .12) * spectrum;
    vec3 color = refracted * (1.0-min(fresnel*.2,.2))
      + min(silverReflection, vec3(5.0)) * reflectionWeight;
    // Monochrome film finish from the pinned reference, without animated grain.
    float gray = dot(color,vec3(0.299,0.587,0.114));
    color = mix(vec3(gray),color,activeColor);
    color += (jitter-0.5) * 0.012;
    gl_FragColor = vec4(max(color,vec3(0.0)),1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export async function createNoomoScene(root, signal, onReady) {
  const resources = new Set()
  const track = (resource) => { resources.add(resource); return resource }
  let renderer, frame = 0, dead = false, observer, resizeObserver, context
  let userPaused = false, inView = true, initialized = false
  let idleTimer, colorTween, controlHovered = false, colorTarget = null
  const appearance = { active: 1 }
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  const host = root.querySelector('.noomo-canvas')
  const pointer = { x: 0, y: 0 }
  const disposers = []
  const dispose = () => {
    if (dead) return
    dead = true
    cancelAnimationFrame(frame)
    observer?.disconnect()
    resizeObserver?.disconnect()
    context?.revert()
    clearTimeout(idleTimer)
    colorTween?.kill()
    disposers.forEach((fn) => fn())
    resources.forEach((resource) => resource.dispose?.())
    renderer?.dispose()
    renderer?.domElement.remove()
  }
  signal.addEventListener('abort', dispose, { once: true })
  disposers.push(() => signal.removeEventListener('abort', dispose))
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setClearColor(0x050505, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = 1
    renderer.autoClear = false
    host.appendChild(renderer.domElement)
    const lost = (event) => { event.preventDefault(); root.classList.remove('noomo-ready'); dispose() }
    renderer.domElement.addEventListener('webglcontextlost', lost)
    disposers.push(() => renderer.domElement.removeEventListener('webglcontextlost', lost))

    const loader = new THREE.TextureLoader()
    async function texture(path, color = false) {
      const result = await loader.loadAsync(ASSETS + path)
      if (dead) { result.dispose(); throw new Error('Hero disposed') }
      track(result)
      if (color) result.colorSpace = THREE.SRGBColorSpace
      return result
    }
    const draco = track(new DRACOLoader().setDecoderPath(ASSETS + 'draco/'))
    let loadedAssets = 0
    const [gltf, normal, matcap, sdr, gain, metadata] = await Promise.all([
      new GLTFLoader().setDRACOLoader(draco).loadAsync(ASSETS + 'models/newCell13.glb').then((model) => {
        model.scene.traverse((object) => {
          if (object.geometry) track(object.geometry)
          if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(track)
        })
        if (dead) { model.scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.() }); throw new Error('Hero disposed') }
        return model
      }),
      texture('textures/logo/stone_tiles_nor_gl_4k_min.jpg'),
      texture('textures/3F4441_D1D7D6_888F87_A2ADA1-64px.png'),
      texture('hdri/min/ferndale_studio_04_1k.webp'),
      texture('hdri/min/ferndale_studio_04_1k-gainmap.webp'),
      fetch(ASSETS + 'hdri/min/ferndale_studio_04_1k.json', { signal }).then((r) => { if (!r.ok) throw new Error('Missing environment metadata'); return r.json() }),
      document.fonts.load('400 100px "Noomo Montreal"'),
      document.fonts.load('500 100px "Noomo Montreal"'),
      document.fonts.load('10px "Noomo Mono"'),
    ].map(promise => promise.then(value => {
      if (!dead) window.dispatchEvent(new CustomEvent('noomo:load-progress', { detail: ++loadedAssets / 9 }))
      return value
    })))
    if (dead) return { dispose }

    // Decode the source HDR gain map on CPU once; keep the shader WebGL2-compatible.
    const envCanvas = document.createElement('canvas')
    envCanvas.width = sdr.image.width; envCanvas.height = sdr.image.height
    const envCtx = envCanvas.getContext('2d', { willReadFrequently: true })
    envCtx.drawImage(sdr.image, 0, 0)
    const low = envCtx.getImageData(0, 0, envCanvas.width, envCanvas.height).data
    envCtx.drawImage(gain.image, 0, 0, envCanvas.width, envCanvas.height)
    const high = envCtx.getImageData(0, 0, envCanvas.width, envCanvas.height).data
    const envData = new Float32Array(low.length)
    for (let i = 0; i < low.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const value = low[i+c] / 255
        const linear = value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4
        const boost = (high[i+c] / 255) ** (1 / metadata.gamma[c])
        envData[i+c] = (linear + metadata.offsetSdr[c]) * 2 ** (metadata.gainMapMin[c] + boost * (metadata.gainMapMax[c] - metadata.gainMapMin[c])) - metadata.offsetHdr[c]
      }
      envData[i+3] = 1
    }
    const environment = track(new THREE.DataTexture(envData, envCanvas.width, envCanvas.height, THREE.RGBAFormat, THREE.FloatType))
    environment.flipY = true; environment.needsUpdate = true
    environment.magFilter = THREE.LinearFilter; environment.minFilter = THREE.LinearFilter
    environment.wrapS = THREE.RepeatWrapping
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(43, 1, .1, 80)
    camera.position.set(0, 0, 7)
    const backgroundScene = new THREE.Scene()
    const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const titleCanvas = document.createElement('canvas')
    const titleTexture = track(new THREE.CanvasTexture(titleCanvas))
    titleTexture.colorSpace = THREE.SRGBColorSpace
    const planeGeometry = track(new THREE.PlaneGeometry(2, 2))
    const backgroundMaterial = track(new THREE.ShaderMaterial({
      uniforms: { title: { value: titleTexture }, time: { value: 0 }, activeColor: { value: 1 }, titleTilt: { value: new THREE.Vector2() }, titleCenter: { value: new THREE.Vector2(.5,.5) }, aspect: { value: 1 } },
      depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: `
        uniform sampler2D title; uniform float time; uniform float activeColor; varying vec2 vUv;
        uniform vec2 titleTilt; uniform vec2 titleCenter; uniform float aspect;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
        void main(){
          // Inverse projection of the responsive title plane. Both the visible
          // background and glass capture use this same tilted lettering.
          float cx=cos(titleTilt.x),sx=sin(titleTilt.x),cy=cos(titleTilt.y),sy=sin(titleTilt.y);
          vec3 u=vec3(cy,0.,-sy),v=vec3(sy*sx,cx,cy*sx);
          vec3 n=cross(u,v),origin=vec3(0.,0.,3.);
          vec3 ray=vec3((vUv-titleCenter)*vec2(2.*aspect,2.),-3.);
          vec3 hit=origin+ray*(-dot(n,origin)/dot(n,ray));
          vec2 titleUv=vec2(dot(hit,u)/(2.*aspect),dot(hit,v)/2.)+titleCenter;
          vec3 ink=vec3(.0015);
          if(all(greaterThanEqual(titleUv,vec2(0.)))&&all(lessThanEqual(titleUv,vec2(1.)))) ink=texture2D(title,titleUv).rgb;
          vec2 p=vUv*vec2(4.8,3.2)+vec2(time*.015,0.);
          vec2 warped=p+noise(p*1.2);
          float cloud=noise(warped)*.4;
          cloud+=(noise(warped+vec2(.28,0.))+noise(warped-vec2(.28,0.))+noise(warped+vec2(0.,.28))+noise(warped-vec2(0.,.28)))*.15;
          cloud*=.85;
          float field=pow(max(cloud-.34,0.)*1.7,2.)*.32*(1.-smoothstep(.26,.62,abs(vUv.y-.5)));
          vec3 fog=vec3(0.,0.,field)*mix(.025,1.,activeColor);
          if(ink.b>ink.r*2.) ink*=mix(.12,1.,activeColor);
          gl_FragColor=vec4(max(ink,fog),1.);
        }`,
    }))
    const background = new THREE.Mesh(planeGeometry, backgroundMaterial)
    backgroundScene.add(background)
    const capture = track(new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: true }))
    const composed = track(new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: true }))
    const postScene = new THREE.Scene()
    const postMaterial = track(new THREE.ShaderMaterial({
      uniforms: { sceneTexture: { value: composed.texture }, activeColor: { value: 1 }, resolution: { value: new THREE.Vector2(1,1) } },
      depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: `
        uniform sampler2D sceneTexture; uniform float activeColor; uniform vec2 resolution; varying vec2 vUv;
        void main(){
          vec2 split=vec2(1.15/resolution.x,0.)*activeColor;
          vec3 c=texture2D(sceneTexture,vUv).rgb;
          c.r=texture2D(sceneTexture,vUv+split).r;
          c.b=texture2D(sceneTexture,vUv-split).b;
          c=mix(vec3(dot(c,vec3(.299,.587,.114))),c,activeColor);
          // Keep the atmosphere continuous: no full-screen noise or quantization.
          c=clamp(c,0.,1.);
          gl_FragColor=vec4(c,1.);
          #include <colorspace_fragment>
        }`,
    }))
    postScene.add(new THREE.Mesh(planeGeometry, postMaterial))
    const glass = gltf.scene.getObjectByName('logoFuckYESForCell')
    const colliderSource = gltf.scene.getObjectByName('logoFuckYES')
    if (!glass?.isMesh || !colliderSource?.isMesh) throw new Error('Reference glass geometry is missing')
    const material = track(new THREE.ShaderMaterial({
      vertexShader: glassVertex, fragmentShader: glassFragment,
      uniforms: { tScene: { value: capture.texture }, tNormal: { value: normal }, tEnvironment: { value: environment }, resolution: { value: new THREE.Vector2() }, environmentMax: { value: 1 }, activeColor: { value: 1 } },
      side: THREE.FrontSide,
    }))
    glass.material = material
    const object = new THREE.Group()
    let restingY = 0
    object.position.z = .5
    scene.add(object)
    object.add(glass)
    object.rotation.set(-.2, -.2, 0)

    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0), allowSleep: true })
    const ballPhysics = new CANNON.Material('ball')
    const wallPhysics = new CANNON.Material('glass')
    world.addContactMaterial(new CANNON.ContactMaterial(ballPhysics, ballPhysics, { restitution: .86, friction: .02 }))
    world.addContactMaterial(new CANNON.ContactMaterial(ballPhysics, wallPhysics, { restitution: .64, friction: .01 }))
    colliderSource.updateMatrix()
    const colliderGeometry = track(colliderSource.geometry.clone().applyMatrix4(colliderSource.matrix))
    const positions = colliderGeometry.attributes.position.array
    const indices = colliderGeometry.index?.array ?? Array.from({ length: positions.length / 3 }, (_, i) => i)
    const wall = new CANNON.Body({ mass: 0, material: wallPhysics })
    wall.addShape(new CANNON.Trimesh(Array.from(positions), Array.from(indices)))
    world.addBody(wall)
    const rayMesh = new THREE.Mesh(colliderGeometry, track(new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })))
    rayMesh.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(rayMesh)
    const ray = new THREE.Raycaster()
    const rayDirection = new THREE.Vector3(.932, .271, .239).normalize()
    const size = bounds.getSize(new THREE.Vector3())
    const inside = (point) => {
      ray.set(point, rayDirection)
      const hits = ray.intersectObject(rayMesh)
      const unique = hits.filter((hit, i) => !i || Math.abs(hit.distance - hits[i-1].distance) > .0001)
      return unique.length % 2 === 1 && unique[0].distance > .115
    }
    let seed = 2026
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
    const ballGeometry = track(new THREE.SphereGeometry(.11, 24, 16))
    const ballMaterial = track(new THREE.MeshMatcapMaterial({ matcap }))
    const balls = []
    for (let i = 0; i < 9; i++) {
      const point = new THREE.Vector3()
      for (let tries = 0; tries < 4000; tries++) {
        point.set(bounds.min.x + size.x * random(), bounds.min.y + size.y * random(), bounds.min.z + size.z * random())
        if (inside(point) && balls.every(({ body }) => point.distanceTo(body.position) > .24)) break
      }
      const body = new CANNON.Body({ mass: .08, material: ballPhysics, shape: new CANNON.Sphere(.11), linearDamping: .1, angularDamping: .32 })
      body.position.copy(point)
      body.velocity.set((random()-.5)*.55, (random()-.5)*.55, (random()-.5)*.3)
      world.addBody(body)
      const mesh = new THREE.Mesh(ballGeometry, ballMaterial)
      mesh.position.copy(point)
      object.add(mesh)
      balls.push({ mesh, body, home: point.clone() })
    }

    const dustCount = innerWidth < 1024 ? 280 : 440
    const dustPositions = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustPositions.length; i += 3) {
      dustPositions[i] = (random()-.5)*22
      dustPositions[i+1] = (random()-.5)*13
      dustPositions[i+2] = (random()-.5)*18 - 3
    }
    const dustGeometry = track(new THREE.BufferGeometry())
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    const dustMaterial = track(new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, pixelRatio: { value: 1 } },
      transparent: true, depthWrite: false,
      vertexShader: `uniform float time;uniform float pixelRatio;varying float alpha;
        void main(){
          float seed=fract(sin(dot(position.xy,vec2(12.98,78.23)))*43758.54);
          vec3 drift=position;
          drift.y=mod(position.y+6.5+time*(.06+seed*.05),13.)-6.5;
          drift.x+=sin(time*(.15+seed*.2)+position.z)*.075;
          vec4 p=modelViewMatrix*vec4(drift,1.);
          gl_Position=projectionMatrix*p;
          float large=step(.925,seed);
          float smallSize=clamp((10.+seed*12.)/max(-p.z,.1),1.,2.5);
          float largeSize=clamp((38.+seed*38.)/max(-p.z,.1),3.,10.);
          float rare=step(.987,seed);
          gl_PointSize=mix(smallSize,largeSize,large)*mix(1.,2.5,rare)*pixelRatio;
          float life=fract(time/(9.+seed*8.)+seed);
          float fade=smoothstep(0.,.22,life)*(1.-smoothstep(.65,1.,life));
          fade*=mix(1.,smoothstep(.12,.28,life)*(1.-smoothstep(.4,.55,life)),rare);
          alpha=mix(.06+seed*.16,(.1+seed*.22)*fade,large);
        }`,
      fragmentShader: 'varying float alpha;void main(){vec2 p=gl_PointCoord-.5;float glow=exp(-dot(p,p)*18.)*(1.-smoothstep(.36,.5,length(p)));gl_FragColor=vec4(vec3(.82),glow*alpha);}',
    }))
    const dust = new THREE.Points(dustGeometry, dustMaterial)
    scene.add(dust)

    function drawTitle() {
      const rect = root.getBoundingClientRect()
      const ratio = Math.min(devicePixelRatio || 1, 2)
      titleTexture.dispose()
      titleCanvas.width = Math.round(rect.width * ratio)
      titleCanvas.height = Math.round(rect.height * ratio)
      const ctx = titleCanvas.getContext('2d')
      ctx.scale(ratio, ratio)
      ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.fillStyle = '#eeeee9'
      root.querySelectorAll('.noomo-line > :not(.noomo-identity), .noomo-identity > span').forEach((element) => {
        const box = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
        ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing
        const text = element.textContent
        if (element.matches('.noomo-line:nth-child(1) strong, .noomo-line:nth-child(2) strong:last-child, .noomo-line:nth-child(5) strong')) {
          ctx.fillStyle = '#0004eb'
          ctx.beginPath()
          ctx.roundRect(box.left-rect.left, box.top-rect.top, box.width, box.height, box.height*.5)
          ctx.fill()
        }
        ctx.fillStyle = '#eeeee9'
        const metrics = ctx.measureText(text)
        const ascent = metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * .8
        const descent = metrics.fontBoundingBoxDescent ?? parseFloat(style.fontSize) * .2
        ctx.fillText(text, box.left - rect.left + parseFloat(style.paddingLeft || 0), box.top - rect.top + (box.height - ascent - descent) / 2 + ascent)
      })
      titleTexture.needsUpdate = true
    }
    function resize() {
      if (dead) return
      const width = root.clientWidth, height = root.clientHeight
      const pixelRatio = Math.min(devicePixelRatio || 1, width < 600 ? 1.25 : width < 1024 ? 1.5 : 1.75)
      renderer.setPixelRatio(pixelRatio)
      dustMaterial.uniforms.pixelRatio.value = pixelRatio
      renderer.setSize(width, height, false)
      capture.setSize(Math.round(width*pixelRatio), Math.round(height*pixelRatio))
      composed.setSize(Math.round(width*pixelRatio), Math.round(height*pixelRatio))
      postMaterial.uniforms.resolution.value.set(width*pixelRatio,height*pixelRatio)
      material.uniforms.resolution.value.set(width*pixelRatio,height*pixelRatio)
      camera.aspect = width / height
      backgroundMaterial.uniforms.aspect.value = width / height
      const titleBounds = root.querySelector('.noomo-title-wrap').getBoundingClientRect()
      const rootBounds = root.getBoundingClientRect()
      backgroundMaterial.uniforms.titleCenter.value.set((titleBounds.left-rootBounds.left+titleBounds.width/2)/width, 1-(titleBounds.top-rootBounds.top+titleBounds.height/2)/height)
      if (width < 1024) {
        backgroundMaterial.uniforms.titleTilt.value.set(0,0)
        pointer.x = pointer.y = 0
        object.position.x = 0
        object.rotation.set(-.2,-.2,0)
        clearTimeout(idleTimer)
        if (initialized) setColor(true, true)
      }
      camera.updateProjectionMatrix()
      const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov/2)) * 6.5
      const headingBounds = root.querySelector('.noomo-title').getBoundingClientRect()
      restingY = (.5-(headingBounds.top-rootBounds.top+headingBounds.height/2)/height)*visibleHeight
      const desiredSize = width < 1024 ? Math.min(width * .54, 300) : Math.min(height * .52, width * .39)
      const scale = desiredSize / height * visibleHeight / Math.max(size.x, size.y)
      object.scale.setScalar(scale)
      object.position.y = restingY
      drawTitle()
      render()
    }
    function render() {
      if (dead) return
      material.uniforms.activeColor.value = appearance.active
      backgroundMaterial.uniforms.activeColor.value = appearance.active
      postMaterial.uniforms.activeColor.value = appearance.active
      glass.visible = false
      renderer.setRenderTarget(capture)
      renderer.clear()
      renderer.render(backgroundScene, backgroundCamera)
      renderer.render(scene, camera)
      glass.visible = true
      renderer.setRenderTarget(composed)
      renderer.clear()
      renderer.render(backgroundScene, backgroundCamera)
      renderer.render(scene, camera)
      renderer.setRenderTarget(null)
      renderer.clear()
      renderer.render(postScene, backgroundCamera)
    }
    function setColor(active, pressing = false) {
      if (colorTarget === active) return
      colorTarget = active
      colorTween?.kill()
      root.dataset.color = active ? 'active' : 'gray'
      colorTween = gsap.to(appearance, { active: active ? 1 : 0, duration: motionQuery.matches ? 0 : pressing ? .2 : active ? .9 : 2.2, ease: 'sine.inOut', onUpdate: () => { if (userPaused || motionQuery.matches) render() } })
    }
    function resetIdle() {
      clearTimeout(idleTimer)
      if (root.clientWidth < 1024) return
      idleTimer = setTimeout(() => { if(root.clientWidth >= 1024) setColor(false) }, 20000)
    }
    const smooth = { x: 0, y: 0 }
    const titleAim = new THREE.Vector2()
    context = gsap.context(() => {
      const xTo = gsap.quickTo(smooth, 'x', { duration: .65, ease: 'power3.out' })
      const yTo = gsap.quickTo(smooth, 'y', { duration: .65, ease: 'power3.out' })
      const move = (event) => {
        if (root.clientWidth < 1024 || motionQuery.matches || userPaused || event.pointerType === 'touch') return
        const rect = root.getBoundingClientRect()
        pointer.x = ((event.clientX-rect.left)/rect.width - .5)*2
        pointer.y = -((event.clientY-rect.top)/rect.height - .5)*2
        xTo(pointer.x); yTo(pointer.y)
        const titleBox = root.querySelector('.noomo-title-wrap').getBoundingClientRect()
        const overTitle = event.clientX >= titleBox.left && event.clientX <= titleBox.right && event.clientY >= titleBox.top && event.clientY <= titleBox.bottom
        if (overTitle && rect.width >= 1024) titleAim.set(-((event.clientY-titleBox.top)/titleBox.height-.5)*.04, ((event.clientX-titleBox.left)/titleBox.width-.5)*.06)
        else titleAim.set(0,0)
        for (const { body } of balls) body.wakeUp()
        if (!controlHovered && appearance.active < .99) setColor(true)
        resetIdle()
      }
      const leave = () => { pointer.x = pointer.y = 0; titleAim.set(0,0); xTo(0); yTo(0); if(root.clientWidth >= 1024) setColor(false) }
      const heldPointers = new Set()
      const press = (event) => {
        if (root.clientWidth >= 1024 || event.target.closest('a,button')) return
        heldPointers.add(event.pointerId)
        setColor(false, true)
      }
      const release = (event) => {
        if (!heldPointers.delete(event.pointerId)) return
        if (!heldPointers.size) setColor(true, true)
      }
      const cancelPress = () => { if (heldPointers.size) { heldPointers.clear(); setColor(true,true) } }
      root.addEventListener('pointerdown', press)
      window.addEventListener('pointerup', release)
      window.addEventListener('pointercancel', release)
      window.addEventListener('blur', cancelPress)
      disposers.push(() => { root.removeEventListener('pointerdown',press); window.removeEventListener('pointerup',release); window.removeEventListener('pointercancel',release); window.removeEventListener('blur',cancelPress) })
      root.addEventListener('pointermove', move)
      root.addEventListener('pointerleave', leave)
      disposers.push(() => { root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave) })
      root.querySelectorAll('.noomo-nav a').forEach((control) => {
        const enter = () => { if(root.clientWidth < 1024) return; controlHovered = true; setColor(false) }
        const exit = () => { if(root.clientWidth < 1024) return; controlHovered = false; setColor(true); resetIdle() }
        control.addEventListener('pointerenter', enter)
        control.addEventListener('pointerleave', exit)
        control.addEventListener('focus', enter)
        control.addEventListener('blur', exit)
        disposers.push(() => { control.removeEventListener('pointerenter', enter); control.removeEventListener('pointerleave', exit); control.removeEventListener('focus', enter); control.removeEventListener('blur', exit) })
      })
    }, root)
    let last = 0, elapsed = 0, previousX = 0, previousY = 0, velocityX = 0, velocityY = 0, frameCount = 0
    function tick(now) {
      frame = 0
      if (dead || !inView || document.hidden || userPaused || motionQuery.matches) return
      const dt = Math.min(last ? (now-last)/1000 : 1/60, 1/30)
      last = now; elapsed += dt
      const mobile = root.clientWidth < 1024
      if (mobile) titleAim.set(0,0)
      backgroundMaterial.uniforms.titleTilt.value.lerp(titleAim,1-Math.exp(-dt*7))
      const localX = smooth.x * 2.5, localY = smooth.y * 1.5
      object.position.x = mobile ? 0 : localX * object.scale.x
      object.position.y = restingY + (mobile ? 0 : localY * object.scale.x)
      object.rotation.x = mobile ? -.2 : -.2 + smooth.y * .5
      object.rotation.y = mobile ? -.2 : -.2 - smooth.x * .5
      const nextVX = (localX-previousX)/dt, nextVY = (localY-previousY)/dt
      const inertia = new THREE.Vector3((nextVX-velocityX)/dt, (nextVY-velocityY)/dt, 0).multiplyScalar(-.18).clampLength(0,18)
      world.gravity.set(0, pointer.y * 6.3, 0)
      for (const { body } of balls) {
        if (Math.abs(pointer.y) > .01 || inertia.lengthSq() > .001) body.wakeUp()
        body.applyForce(new CANNON.Vec3(inertia.x*body.mass,inertia.y*body.mass,0))
      }
      previousX = localX; previousY = localY; velocityX = nextVX; velocityY = nextVY
      if (!mobile) world.step(1/60, dt, 3)
      for (const { mesh, body, home } of balls) {
        if (body.position.length() > size.length() * 1.5 || !Number.isFinite(body.position.x)) {
          body.position.copy(home); body.velocity.set(0,0,0)
        }
        mesh.position.copy(body.position); mesh.quaternion.copy(body.quaternion)
      }
      dustMaterial.uniforms.time.value = elapsed
      backgroundMaterial.uniforms.time.value = elapsed
      frameCount++
      render()
      frame = requestAnimationFrame(tick)
    }
    function schedule() {
      cancelAnimationFrame(frame); frame = 0; last = 0
      if (motionQuery.matches) { titleAim.set(0,0); backgroundMaterial.uniforms.titleTilt.value.set(0,0); if (initialized) render() }
      if (initialized && !dead && inView && !document.hidden && !userPaused && !motionQuery.matches) frame = requestAnimationFrame(tick)
    }
    observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule() }, { threshold: 0 })
    observer.observe(root)
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(root)
    root.addEventListener('noomo:title-layout', resize)
    disposers.push(() => root.removeEventListener('noomo:title-layout', resize))
    document.addEventListener('visibilitychange', schedule)
    motionQuery.addEventListener('change', schedule)
    disposers.push(() => { document.removeEventListener('visibilitychange', schedule); motionQuery.removeEventListener('change', schedule) })
    resize()
    initialized = true
    setColor(true)
    resetIdle()
    if (import.meta.env.DEV) {
      root.__noomoDebug = () => ({ frameCount, pointer: { ...pointer }, position: object.position.toArray(), gravity: world.gravity.toArray(), contacts: world.contacts.length, reduced: motionQuery.matches, paused: userPaused, activeColor: appearance.active, balls: balls.map(({ body }) => ({ position: body.position.toArray(), velocity: body.velocity.toArray(), sleeping: body.sleepState })) })
      disposers.push(() => { delete root.__noomoDebug })
    }
    onReady()
    schedule()
    return { dispose, setPaused(value) { userPaused = value; schedule() } }
  } catch (error) {
    dispose()
    throw error
  }
}
