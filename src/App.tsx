import { SParamChart } from './apps/SParamChart'
import './App.css'
import { Header } from './components/Header'

function App() {
  return (
    <>
      <Header />
      <div style={{ padding: 24 }}>
        <SParamChart />
      </div>
    </>
  )
}

export default App
