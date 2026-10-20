'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { AI_DIRECTOR, AI_IN_MASTERS, AI_TOOLS } from '@/lib/content';
import Section from './Section';
import Reveal from './Reveal';

interface Demo {
  title: string;
  sessions: number;
  kind: string;
  prompt: string;
  answer: string;
  tools: string;
}

/** Una demo por cada módulo de la asignatura. Los ejemplos son ilustrativos: enseñan qué se le pide a la IA y cómo se revisa. */
const DEMOS: Demo[] = [
  {
    title: AI_IN_MASTERS.modules[0].title,
    sessions: AI_IN_MASTERS.modules[0].sessions,
    kind: 'Texto',
    prompt: 'Explícame en tres frases qué es un modelo de lenguaje y dónde puede fallar en un proyecto BIM.',
    answer: 'Predice texto, no «sabe» tu proyecto. Falla con datos que no ve y con normativa sin fuente. Por eso aprenderás a pedir fuentes y a verificarlas.',
    tools: 'Claude · ChatGPT · Gemini · Perplexity',
  },
  {
    title: AI_IN_MASTERS.modules[1].title,
    sessions: AI_IN_MASTERS.modules[1].sessions,
    kind: 'Documentos',
    prompt: 'Actúa como coordinador BIM. Resume esta acta de obra y lista acuerdos, responsables y plazos.',
    answer: 'Acuerdos, responsables y plazos en una tabla, con los plazos en riesgo marcados. Tú contrastas con el acta original antes de enviarla.',
    tools: 'Asistentes documentales · prompting profesional',
  },
  {
    title: AI_IN_MASTERS.modules[2].title,
    sessions: AI_IN_MASTERS.modules[2].sessions,
    kind: 'Imagen y vídeo',
    prompt: 'Fachada de ladrillo visto al atardecer, entorno urbano de Madrid, vista a la altura de los ojos.',
    answer: 'Varias variantes de la fachada en minutos para la reunión con el cliente. Aprendes a dirigir la imagen y a decidir cuál sirve.',
    tools: 'Midjourney · Nano Banana · GPT Image · Flux · Veo · Kling · Runway',
  },
  {
    title: AI_IN_MASTERS.modules[3].title,
    sessions: AI_IN_MASTERS.modules[3].sessions,
    kind: 'BIM',
    prompt: 'Revisa el modelo y agrupa las colisiones entre instalaciones y estructura por gravedad.',
    answer: 'Colisiones agrupadas y priorizadas, con un informe listo para tu revisión. La decisión técnica sigue siendo tuya.',
    tools: 'Revit + MCP · Dynamo · Python · n8n',
  },
];

const TYPE_MS = 16;

/**
 * «La IA dentro del máster»: una consola que escribe el prompt, responde y se revisa, módulo a módulo.
 * Con movimiento reducido el texto aparece completo, sin escritura animada.
 */
export default function AiLab({ masterName, kind, where }: { masterName: string; kind: 'subject' | 'module'; where: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState(0);
  const [paused, setPaused] = useState(false);
  const demo = DEMOS[active];
  const done = typed >= demo.prompt.length;

  useEffect(() => {
    if (reduce) {
      setTyped(demo.prompt.length);
      return;
    }
    setTyped(0);
    const id = setInterval(() => setTyped((n) => (n >= demo.prompt.length ? n : n + 1)), TYPE_MS);
    return () => clearInterval(id);
  }, [active, demo.prompt.length, reduce]);

  // Pasa sola a la siguiente demo cuando la respuesta ya se ha leído, salvo que la persona esté usándola.
  useEffect(() => {
    if (reduce || paused || !done) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % DEMOS.length), 7000);
    return () => clearTimeout(t);
  }, [done, paused, reduce, active]);

  const subject = kind === 'subject';

  return (
    <Section field="navy" id="ia" labelledBy="ia-title">
      <Reveal className="max-w-4xl">
        <h2 id="ia-title" className="font-kinetic font-bold text-3xl md:text-6xl leading-[1.1]">
          No te contamos la IA. La <span className="ui-hl">aplicamos</span>.
        </h2>
        <p className="text-[#c9d9f0] mt-6 text-lg md:text-xl leading-relaxed max-w-3xl">
          {subject
            ? `En el ${masterName} la IA es una asignatura de ${AI_IN_MASTERS.ects} ECTS (${AI_IN_MASTERS.sessions}) y está dentro de los proyectos. Escribes, generas, revisas y decides.`
            : `En el ${masterName} la IA vive en el módulo Innovation: IA y machine learning aplicados a los procesos BIM, junto con Power BI y la automatización con Dynamo y Python. Escribes, generas, revisas y decides.`}
        </p>
      </Reveal>

      <div
        className="mt-12 grid lg:grid-cols-[0.75fr_1.4fr] gap-4 lg:gap-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div role="tablist" aria-label="Módulos de IA" className="flex lg:flex-col gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
          {DEMOS.map((d, i) => {
            const on = i === active;
            return (
              <button
                key={d.title}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="ai-console"
                id={`ai-tab-${i}`}
                onClick={() => setActive(i)}
                className={`text-left shrink-0 w-60 lg:w-auto rounded-2xl px-5 py-4 transition-colors cursor-pointer ${
                  on ? 'bg-[#0063e6] text-[#fff]' : 'ui-card hover:bg-[#1a3d82]'
                }`}
              >
                <span className="block font-kinetic font-bold text-lg leading-snug">{d.kind}</span>
                <span className={`block text-sm mt-1 leading-snug ${on ? 'text-[#fff]/85' : 'text-[#c9d9f0]'}`}>
                  {d.title}
                  {subject && ` · ${d.sessions} ${d.sessions === 1 ? 'sesión' : 'sesiones'}`}
                </span>
              </button>
            );
          })}
        </div>

        <div id="ai-console" role="tabpanel" aria-labelledby={`ai-tab-${active}`} className="rounded-2xl bg-[#061633] p-6 md:p-10 flex flex-col gap-7 min-h-[24rem]">
          <div>
            <p className="text-sm font-semibold text-[#7db4ff]">Tú pides</p>
            <p className="mt-3 text-xl md:text-2xl leading-relaxed font-medium">
              <span aria-label={demo.prompt}>{demo.prompt.slice(0, typed)}</span>
              {!done && <span className="inline-block w-2 h-6 ml-0.5 align-middle bg-[#7db4ff] animate-pulse" aria-hidden="true" />}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {done && (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl bg-[#123069] p-5 md:p-6"
              >
                <p className="text-sm font-semibold text-[#7db4ff]">La IA propone</p>
                <p className="mt-2 text-lg text-[#f4f8ff] leading-relaxed">{demo.answer}</p>
                <p className="mt-4 inline-flex items-center gap-2 font-semibold text-[#7db4ff]">
                  <Check className="w-4 h-4" aria-hidden="true" /> Tú decides: revisas, contrastas y firmas.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-auto text-sm text-[#c9d9f0]">
            Ejemplo ilustrativo. Herramientas: <span className="font-semibold text-[#f4f8ff]">{demo.tools}</span>
          </p>
        </div>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-8 md:gap-12">
        {[
          { title: 'La IA propone, tú decides', text: 'Un resultado generado no es un resultado validado. Aprendes a revisar, contrastar y firmar con criterio.' },
          { title: 'Sobre proyectos reales', text: `Lo practicas con Learning by Working y lo aplicas en tu proyecto fin de máster. ${where}.` },
          { title: 'Información bajo control', text: 'Confidencialidad, protección de datos y cumplimiento de ISO 19650 al usar IA con información de proyecto.' },
        ].map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <h3 className="font-kinetic font-bold text-xl leading-snug">{p.title}</h3>
            <p className="text-[#c9d9f0] leading-relaxed mt-3">{p.text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <p className="text-[#c9d9f0] leading-relaxed max-w-4xl">
          <span className="font-semibold text-[#f4f8ff]">Con qué trabajarás: </span>
          {AI_TOOLS.flatMap((t) => t.tools.split(' · ')).join(', ')}.
        </p>
        <p className="text-[#c9d9f0]/80 mt-3">
          Dirección de la IA aplicada: {AI_DIRECTOR.name}. {AI_DIRECTOR.role}
        </p>
      </Reveal>
    </Section>
  );
}
