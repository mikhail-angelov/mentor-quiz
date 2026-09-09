import { useEffect, useMemo, useState } from 'react'
import { QUESTIONS, QUIZ_SUBTITLE, QUIZ_TITLE, TYPES } from './data'

type Phase = 'intro' | 'quiz' | 'result'

export default function App() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [qIndex, setQIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null) // выбранный ответ на ТЕКУЩИЙ вопрос
  const [answers, setAnswers] = useState<number[]>([]) // typeId по каждому вопросу

  const total = QUESTIONS.length
  const question = QUESTIONS[qIndex]

  const start = () => {
    setAnswers([])
    setQIndex(0)
    setPicked(null)
    setPhase('quiz')
  }

  const goNext = () => {
    if (picked === null) return
    const next = [...answers]
    next[qIndex] = question.answers[picked].typeId // храним ТИП, а не индекс
    setAnswers(next)
    setPicked(null)
    if (qIndex + 1 < total) setQIndex(qIndex + 1)
    else setPhase('result')
  }

  const goBack = () => {
    if (qIndex === 0) return
    const prev = qIndex - 1
    const prevTypeId = answers[prev]
    setQIndex(prev)
    // восстанавливаем выбор: индекс ответа в прошлом вопросе с таким же типом
    setPicked(
      prevTypeId === undefined
        ? null
        : QUESTIONS[prev].answers.findIndex((a) => a.typeId === prevTypeId),
    )
  }

  return (
    <div className="app">
      {phase === 'intro' && (
        <section className="card intro">
          <div className="intro-badge">🎓</div>
          <h1>{QUIZ_TITLE}</h1>
          <p className="sub">{QUIZ_SUBTITLE}</p>
          <p className="hint">
            {total} вопросов · {TYPES.length} типов наставника
          </p>
          <button className="btn-primary" onClick={start}>
            Начать
          </button>
        </section>
      )}

      {phase === 'quiz' && (
        <section className="card quiz">
          <div className="progress-row">
            <span className="counter">
              Вопрос {qIndex + 1} из {total}
            </span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${((qIndex + (picked !== null ? 1 : 0)) / total) * 100}%` }}
              />
            </div>
          </div>

          <h2>{question.text}</h2>

          <div className="answers">
            {question.answers.map((a, i) => {
              const sel = picked === i
              return (
                <button
                  key={i}
                  className={`answer ${sel ? 'selected' : ''}`}
                  onClick={() => setPicked(i)}
                >
                  <span className="answer-key">{'АБВГД'[i]}</span>
                  <span>{a.text}</span>
                </button>
              )
            })}
          </div>

          <div className="nav-row">
            <button className="btn-ghost" onClick={goBack} disabled={qIndex === 0}>
              ← Назад
            </button>
            <button
              className="btn-primary"
              onClick={goNext}
              disabled={picked === null}
            >
              {qIndex + 1 === total ? 'Узнать результат' : 'Дальше →'}
            </button>
          </div>
        </section>
      )}

      {phase === 'result' && <Result answers={answers} onRestart={start} />}
    </div>
  )
}

/* ----------------------------- Результат ----------------------------- */

function Result({ answers, onRestart }: { answers: number[]; onRestart: () => void }) {
  const scores = useMemo(() => {
    const s = TYPES.map((t) => ({ type: t, score: 0 }))
    for (const typeId of answers) s[typeId].score++
    return s
  }, [answers])

  const max = Math.max(...scores.map((s) => s.score))
  const leaders = scores.filter((s) => s.score === max).map((s) => s.type)
  const main = leaders[0]
  const total = answers.length

  // анимация баров «состава» после монтирования
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="card result">
      <p className="result-kicker">Твой ведущий тип наставника</p>

      <div className="hero" style={{ ['--c' as string]: main.color }}>
        <div className="hero-emoji">
          {main.image ? (
            <img src={main.image} alt={main.name} />
          ) : (
            <span>{main.emoji}</span>
          )}
        </div>
        <h1>{main.name}</h1>
        {leaders.length > 1 && (
          <p className="hero-extra">
            …в равной мере с типом «{leaders.filter((t) => t.id !== main.id).map((t) => t.name).join('» и «')}»
          </p>
        )}
      </div>

      <p className="hero-desc">{main.description}</p>

      <div className="composition">
        <h3>Твой состав наставника</h3>
        {scores.map(({ type, score }) => {
          const pct = total ? Math.round((score / total) * 100) : 0
          const isLead = type.id === main.id
          return (
            <div key={type.id} className={`comp-row ${isLead ? 'lead' : ''}`}>
              <div className="comp-label">
                <span className="comp-emoji">{type.emoji}</span>
                <span className="comp-name">
                  {type.name}
                  {isLead && <em> · ведущий</em>}
                </span>
                <span className="comp-pct">{pct}%</span>
              </div>
              <div className="comp-track">
                <div
                  className="comp-fill"
                  style={{
                    width: grown ? `${pct}%` : '0%',
                    background: type.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <button className="btn-primary" onClick={onRestart}>
        Пройти ещё раз
      </button>
    </section>
  )
}
