import { useEffect, useRef } from 'react'
import { Renderer, Program, Triangle, Mesh } from 'ogl'
import './SideRays.css'

const rgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? [1, 2, 3].map((i) => parseInt(m[i], 16) / 255) : [1, 1, 1]
}

export default function SideRays({ className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const container = ref.current
    if (!container || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 1.5), alpha: true })
    const gl = renderer.gl
    gl.canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(gl.canvas)
    const uniforms = {
      time: { value: 0 }, resolution: { value: [1, 1] },
      colorA: { value: rgb('#C8F04A') }, colorB: { value: rgb('#198DFF') },
    }
    const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`
    const fragment = `
      precision highp float;
      uniform float time; uniform vec2 resolution; uniform vec3 colorA; uniform vec3 colorB;
      float ray(vec2 source, vec2 direction, vec2 point, float seed, float speed){
        vec2 delta=point-source; float angle=dot(normalize(delta),direction);
        float wave=.66+.18*sin(angle*seed+time*speed)+.12*cos(angle*seed*.63-time*speed*.34);
        return clamp(wave,0.,1.)*pow(max(0.,1.-length(delta)/(resolution.x*.92)),1.7);
      }
      void main(){
        vec2 point=vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y);
        vec2 source=vec2(resolution.x*1.05,resolution.y*1.08);
        vec2 d1=normalize(vec2(-1.,-.72)); vec2 d2=normalize(vec2(-.72,-1.));
        float a=ray(source,d1,point,32.4,1.15); float b=ray(source,d2,point,19.7,.27);
        vec3 color=colorA*a*.48+colorB*b*.82;
        float alpha=max(color.r,max(color.g,color.b))*.62;
        gl_FragColor=vec4(color,alpha);
      }`
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: new Program(gl, { vertex, fragment, uniforms }) })
    let frame = 0
    let visible = false
    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight)
      uniforms.resolution.value = [container.clientWidth * renderer.dpr, container.clientHeight * renderer.dpr]
    }
    const draw = (t) => {
      if (!visible) return
      uniforms.time.value = t * .001
      renderer.render({ scene: mesh })
      frame = requestAnimationFrame(draw)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible) frame = requestAnimationFrame(draw)
    }, { threshold: .08 })
    observer.observe(container)
    resize()
    addEventListener('resize', resize)
    return () => {
      visible = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      removeEventListener('resize', resize)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl.canvas.remove()
    }
  }, [])
  return <div ref={ref} className={`side-rays-container ${className}`.trim()} aria-hidden="true" />
}
