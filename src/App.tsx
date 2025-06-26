import { SParamChart } from './apps/SParamChart'
import { Header } from './components/Header'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <div className="flex-1 flex flex-col justify-center">
        <SParamChart />
      </div>
    </>
  )
}

export default App
