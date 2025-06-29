import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SParamChart } from './apps/SParamChart'
import { Header } from './components/ui/Header'

function App() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <div className="flex-1 flex flex-col justify-center">
        <SParamChart />
      </div>
    </QueryClientProvider>
  )
}

export default App
