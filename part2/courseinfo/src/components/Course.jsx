const Header = ({ name }) => <h2>{name}</h2>
const Part = ({ part }) => <p>{part.name} {part.exercises}</p>
const Content = ({ parts }) => <div>{parts.map(part => <Part key={part.id} part={part} />)}</div>
export const Total = ({ parts }) => <p><strong>Total of {parts.reduce((sum, part) => sum + part.exercises, 0)} exercises</strong></p>

export default function Course({ course }) {
  return <section><Header name={course.name} /><Content parts={course.parts} /><Total parts={course.parts} /></section>
}
