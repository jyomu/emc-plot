import { SParamChart } from './apps/SParamChart'
import './App.css'
import { Header } from './components/Header'

function App() {
  return (
    <>
      <Header />
      <div style={{ padding: 24 }}>
        <h1>Touchstone Sパラメータプロッタ (nポート対応)</h1>
        <SParamChart />
      </div>
    </>
  )
}

export default App
