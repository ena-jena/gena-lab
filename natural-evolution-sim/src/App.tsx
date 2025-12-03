import { useState, useEffect, useCallback } from 'react'

const poppinsFontLink = <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />

interface Organism {
  id: number
  traits: {
    speed: number
    size: number
    energy: number
    reproduction: number
  }
  fitness: number
  generation: number
  cellIndex: number
}

interface SimulationStats {
  totalOrganisms: number
  averageFitness: number
  generation: number
  survivalRate: number
  traitAverages: {
    speed: number
    size: number
    energy: number
    reproduction: number
  }
}

interface TooltipState {
  show: boolean;
  text: string;
  x: number;
  y: number;
}

const [tooltip, setTooltip] = useState<TooltipState>({
  show: false,
  text: '',
  x: 0,
  y: 0,
})

const GRID_COLS = 20
const GRID_ROWS = 10
const GRID_SIZE = GRID_COLS * GRID_ROWS

function App() {
  const [organisms, setOrganisms] = useState<Organism[]>([])
  const [stats, setStats] = useState<SimulationStats>({
    totalOrganisms: 0,
    averageFitness: 0,
    generation: 0,
    survivalRate: 0,
    traitAverages: { speed: 0, size: 0, energy: 0, reproduction: 0 }
  })
  
  const [parameters, setParameters] = useState({
    resourceAvailability: 0.7,
    mutationRate: 0.1,
    populationSize: 40,
  })

  const [isRunning, setIsRunning] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const initializePopulation = useCallback(() => {
    const newOrganisms: Organism[] = []
    const usedCells = new Set<number>()
    for (let i = 0; i < parameters.populationSize; i++) {
      let cellIndex = Math.floor(Math.random() * GRID_SIZE)
      while (usedCells.has(cellIndex)) {
        cellIndex = Math.floor(Math.random() * GRID_SIZE)
      }
      usedCells.add(cellIndex)
      newOrganisms.push({
        id: i,
        traits: {
          speed: Math.random(),
          size: Math.random(),
          energy: Math.random(),
          reproduction: Math.random()
        },
        fitness: 0,
        generation: 0,
        cellIndex
      })
    }
    setOrganisms(newOrganisms)
  }, [parameters.populationSize])

  const calculateFitness = useCallback((organism: Organism): number => {
    const { speed, size, energy, reproduction } = organism.traits
    
    const speedFitness = speed * parameters.resourceAvailability
    
    const sizeFitness = size * (1 - parameters.resourceAvailability) * 0.5
    
    const energyFitness = energy * 0.8
    
    const reproductionFitness = reproduction * 0.6
    
    return (speedFitness + sizeFitness + energyFitness + reproductionFitness) / 4
  }, [parameters.resourceAvailability])

  const simulateGeneration = useCallback(() => {
    setOrganisms(prevOrganisms => {
      const organismsWithFitness = prevOrganisms.map(org => ({
        ...org,
        fitness: calculateFitness(org)
      }))

      const sorted = organismsWithFitness.sort((a, b) => b.fitness - a.fitness)
      const survivors = sorted.slice(0, Math.floor(sorted.length * 0.6))

      const newGeneration: Organism[] = []
      const usedCells = new Set<number>()
      let nextId = 0
      while (newGeneration.length < Math.min(parameters.populationSize + prevOrganisms[0]?.generation + 1, GRID_SIZE)) {
        const parent = survivors[Math.floor(Math.random() * survivors.length)]
        
        let cellIndex = Math.floor(Math.random() * GRID_SIZE)
        let tries = 0
        while (usedCells.has(cellIndex) && tries < 100) {
          cellIndex = Math.floor(Math.random() * GRID_SIZE)
          tries++
        }
        usedCells.add(cellIndex)
        
        const offspring: Organism = {
          id: Date.now() + Math.random() + nextId,
          traits: {
            speed: Math.max(0, Math.min(1, parent.traits.speed + (Math.random() - 0.5) * parameters.mutationRate)),
            size: Math.max(0, Math.min(1, parent.traits.size + (Math.random() - 0.5) * parameters.mutationRate)),
            energy: Math.max(0, Math.min(1, parent.traits.energy + (Math.random() - 0.5) * parameters.mutationRate)),
            reproduction: Math.max(0, Math.min(1, parent.traits.reproduction + (Math.random() - 0.5) * parameters.mutationRate))
          },
          fitness: 0,
          generation: (parent.generation || 0) + 1,
          cellIndex
        }
        
        newGeneration.push(offspring)
        nextId++
      }

      return newGeneration
    })
  }, [parameters.populationSize, parameters.mutationRate, calculateFitness])

  useEffect(() => {
    if (organisms.length === 0) return

    const fitnesses = organisms.map(org => calculateFitness(org))
    const averageFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length
    
    const traitSums = organisms.reduce((sums, org) => ({
      speed: sums.speed + org.traits.speed,
      size: sums.size + org.traits.size,
      energy: sums.energy + org.traits.energy,
      reproduction: sums.reproduction + org.traits.reproduction
    }), { speed: 0, size: 0, energy: 0, reproduction: 0 })

    setStats({
      totalOrganisms: organisms.length,
      averageFitness,
      generation: organisms[0]?.generation || 0,
      survivalRate: 0.6,
      traitAverages: {
        speed: traitSums.speed / organisms.length,
        size: traitSums.size / organisms.length,
        energy: traitSums.energy / organisms.length,
        reproduction: traitSums.reproduction / organisms.length
      }
    })
  }, [organisms, calculateFitness])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      simulateGeneration()
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, simulateGeneration])

  useEffect(() => {
    initializePopulation()
  }, [initializePopulation])

  const handleTooltip = (show: boolean, text: string, event?: React.MouseEvent) => {
    if (show && event) {
      setTooltip({
        show: true,
        text,
        x: event.clientX,
        y: event.clientY
      })
    } else {
      setTooltip({ show: false, text: '', x: 0, y: 0 })
    }
  }

  const getOrganismColor = (organism: Organism) => {
    const fitness = calculateFitness(organism)
    if (darkMode) {
      const hue = fitness * 120
      return `hsl(${hue}, 70%, 60%)`
    } else {
      const hue = 220 + fitness * 50
      return `hsl(${hue}, 70%, 55%)`
    }
  }

  const getOrganismSize = (organism: Organism) => {
    return 40 + organism.traits.size * 60
  }

  const getOrganismOpacity = (organism: Organism) => {
    const maxGen = Math.max(...organisms.map(o => o.generation)) || 1
    return 0.5 + 0.5 * (organism.generation / maxGen)
  }

  const gridCells = Array(GRID_SIZE).fill(null).map((_, idx) => {
    const organism = organisms.find(o => o.cellIndex === idx)
    return (
      <div key={idx} className="flex items-center justify-center aspect-square">
        {organism && (
          <div
            className="transition-all duration-500 rounded-full shadow-lg hover:scale-110 hover:z-10 cursor-pointer"
            style={{
              width: `${getOrganismSize(organism)}%`,
              height: `${getOrganismSize(organism)}%`,
              backgroundColor: getOrganismColor(organism),
              boxShadow: `0 0 12px 2px ${getOrganismColor(organism)}55`,
              border: darkMode ? '2px solid #1e293b' : '2px solid #e5e7eb',
              opacity: getOrganismOpacity(organism),
              transition: 'width 0.5s, height 0.5s, background 0.3s, opacity 0.5s',
              animation: 'fadeIn 0.7s',
            }}
            onMouseEnter={e => handleTooltip(true, `Speed: ${Math.round(organism.traits.speed*100)}%\nSize: ${Math.round(organism.traits.size*100)}%\nEnergy: ${Math.round(organism.traits.energy*100)}%\nRepro: ${Math.round(organism.traits.reproduction*100)}%\nFitness: ${Math.round(calculateFitness(organism)*100)}%`, e)}
            onMouseLeave={() => handleTooltip(false, '')}
          />
        )}
      </div>
    )
  })

  return (
    <>
      {poppinsFontLink}
      <div className={
        `font-[Poppins,sans-serif] w-screen h-screen min-h-screen min-w-screen flex flex-col overflow-hidden transition-colors duration-500 ` +
        (darkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'
          : 'bg-gradient-to-br from-gray-100 via-white to-gray-200 text-slate-800')
      }>
        <header className={
          `flex-shrink-0 h-auto md:h-20 flex flex-col md:flex-row items-start md:items-center px-4 md:px-10 border-b backdrop-blur-md transition-colors duration-500 ` +
          (darkMode
            ? 'border-slate-700 bg-slate-800/60'
            : 'border-gray-200 bg-white/80')
        }>
          <div className="flex flex-col gap-1 flex-1 w-full">
            <h1 className={
              `mt-4 md:mt-0 text-xl md:text-2xl font-bold bg-clip-text transition-colors duration-500 leading-tight md:leading-normal ` +
              (darkMode
                ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-transparent'
                : 'bg-gradient-to-r from-blue-600 to-purple-500 text-transparent')
            }>
              Natural Evolution Simulator
            </h1>
          </div>
          <button
            className={
              'mt-4 md:mt-0 ml-0 md:ml-6 px-5 py-2 rounded-xl font-semibold shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 inline-flex items-center gap-2 ' +
              (darkMode
                ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 text-slate-200 hover:brightness-110 hover:scale-[1.03] hover:shadow-blue-500/30 hover:shadow-lg active:scale-95'
                : 'bg-gradient-to-r from-white to-slate-100 border border-gray-300 text-slate-700 hover:brightness-105 hover:scale-[1.03] hover:shadow-blue-300/30 hover:shadow-lg active:scale-95')
            }
            onClick={() => setDarkMode(d => !d)}
            aria-label="Toggle dark mode"
          >
            <span className="inline-flex items-center gap-2">
              {darkMode ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="align-middle"><path d="M10 15.5A5.5 5.5 0 0 1 10 4.5a.75.75 0 0 0-.75-1.25A7 7 0 1 0 16.75 11.25.75.75 0 0 0 15.5 10a5.5 5.5 0 0 1-5.5 5.5Z" fill="currentColor"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="align-middle"><circle cx="10" cy="10" r="5" fill="currentColor"/><g stroke="currentColor" strokeWidth="1.5"><line x1="10" y1="2" x2="10" y2="0.5"/><line x1="10" y1="18" x2="10" y2="19.5"/><line x1="2" y1="10" x2="0.5" y2="10"/><line x1="18" y1="10" x2="19.5" y2="10"/><line x1="15.07" y1="4.93" x2="16.13" y2="3.87"/><line x1="4.93" y1="15.07" x2="3.87" y2="16.13"/><line x1="4.93" y1="4.93" x2="3.87" y2="3.87"/><line x1="15.07" y1="15.07" x2="16.13" y2="16.13"/></g></svg>
              )}
              <span className="align-middle">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </span>
          </button>
          <br></br>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center w-full px-2 md:px-6 py-6 min-h-0">
          <div className="w-full max-w-7xl flex-1 flex flex-col gap-6 md:gap-8 md:flex-row md:items-stretch md:justify-center min-h-0 overflow-auto">
            <section className={
              `flex flex-col flex-shrink-0 w-full sm:w-[90vw] md:w-[340px] rounded-2xl shadow-xl border transition-colors duration-500 backdrop-blur-md min-h-0 max-h-full overflow-auto ` +
              (darkMode
                ? 'bg-slate-800/70 border-slate-700'
                : 'bg-white/80 border-gray-200')
            }>
              <div className="p-6 sm:p-8 flex-1 flex flex-col min-h-0 pb-6">
                <h2 className={
                  `text-lg font-semibold mb-6 flex items-center transition-colors duration-500 ` +
                  (darkMode ? 'text-slate-200' : 'text-slate-700')
                }>
                  <div className={darkMode ? 'w-2 h-2 bg-blue-400 rounded-full mr-3' : 'w-2 h-2 bg-blue-500 rounded-full mr-3'}></div>
                  Control Panel
                </h2>
                <div className="space-y-6 flex-1 min-h-0">
                  <div className="relative">
                    <label className={
                      `block text-sm font-medium mb-2 transition-colors duration-500 ` +
                      (darkMode ? 'text-slate-300' : 'text-slate-700')
                    }>
                      Resource Availability
                      <span
                        className={
                          'ml-2 cursor-help ' +
                          (darkMode ? 'text-slate-500' : 'text-slate-400')
                        }
                        onMouseEnter={e => handleTooltip(true, 'Higher values favor speed-based traits', e)}
                        onMouseLeave={() => handleTooltip(false, '')}
                      >
                        ⓘ
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={parameters.resourceAvailability}
                      onChange={e => setParameters(prev => ({ ...prev, resourceAvailability: parseFloat(e.target.value) }))}
                      className={
                        'w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors duration-500 ' +
                        (darkMode ? 'bg-slate-700' : 'bg-gray-200')
                      }
                      style={{ background: darkMode ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' : 'linear-gradient(to right, #60a5fa, #a78bfa)' }}
                    />
                    <div className={
                      'flex justify-between text-xs mt-1 transition-colors duration-500 ' +
                      (darkMode ? 'text-slate-400' : 'text-slate-500')
                    }>
                      <span>Scarce</span>
                      <span>Abundant</span>
                    </div>
                    <div className={
                      'text-sm mt-1 transition-colors duration-500 ' +
                      (darkMode ? 'text-slate-300' : 'text-slate-700')
                    }>{Math.round(parameters.resourceAvailability * 100)}%</div>
                  </div>
                  <div className="relative">
                    <label className={
                      `block text-sm font-medium mb-2 transition-colors duration-500 ` +
                      (darkMode ? 'text-slate-300' : 'text-slate-700')
                    }>
                      Mutation Rate
                      <span
                        className={
                          'ml-2 cursor-help ' +
                          (darkMode ? 'text-slate-500' : 'text-slate-400')
                        }
                        onMouseEnter={e => handleTooltip(true, 'Higher values increase trait variation', e)}
                        onMouseLeave={() => handleTooltip(false, '')}
                      >
                        ⓘ
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.01"
                      value={parameters.mutationRate}
                      onChange={e => setParameters(prev => ({ ...prev, mutationRate: parseFloat(e.target.value) }))}
                      className={
                        'w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors duration-500 ' +
                        (darkMode ? 'bg-slate-700' : 'bg-gray-200')
                      }
                      style={{ background: darkMode ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' : 'linear-gradient(to right, #60a5fa, #a78bfa)' }}
                    />
                    <div className={
                      'flex justify-between text-xs mt-1 transition-colors duration-500 ' +
                      (darkMode ? 'text-slate-400' : 'text-slate-500')
                    }>
                      <span>Low</span>
                      <span>High</span>
                    </div>
                    <div className={
                      'text-sm mt-1 transition-colors duration-500 ' +
                      (darkMode ? 'text-slate-300' : 'text-slate-700')
                    }>{Math.round(parameters.mutationRate * 100)}%</div>
                  </div>
                  <div className="relative">
                    <label className={
                      `block text-sm font-medium mb-2 transition-colors duration-500 ` +
                      (darkMode ? 'text-slate-300' : 'text-slate-700')
                    }>
                      Population Size
                      <span
                        className={
                          'ml-2 cursor-help ' +
                          (darkMode ? 'text-slate-500' : 'text-slate-400')
                        }
                        onMouseEnter={e => handleTooltip(true, 'Number of organisms in the simulation', e)}
                        onMouseLeave={() => handleTooltip(false, '')}
                      >
                        ⓘ
                      </span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="10"
                      value={parameters.populationSize}
                      onChange={e => setParameters(prev => ({ ...prev, populationSize: parseInt(e.target.value) }))}
                      className={
                        'w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors duration-500 ' +
                        (darkMode ? 'bg-slate-700' : 'bg-gray-200')
                      }
                      style={{ background: darkMode ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' : 'linear-gradient(to right, #60a5fa, #a78bfa)' }}
                    />
                    <div className={
                      'text-sm mt-1 transition-colors duration-500 ' +
                      (darkMode ? 'text-slate-300' : 'text-slate-700')
                    }>{parameters.populationSize} organisms</div>
                  </div>
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={() => setIsRunning(!isRunning)}
                      className={
                        `w-full py-3 px-4 rounded-xl font-semibold shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 ` +
                        (isRunning
                          ? (darkMode
                            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border-none hover:brightness-110 hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-red-500 to-red-400 text-white border-none hover:brightness-105 hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-xl')
                          : (darkMode
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white border-none hover:brightness-110 hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-green-500 to-green-400 text-white border-none hover:brightness-105 hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-xl'))
                      }
                    >
                      {isRunning ? 'Pause Simulation' : 'Start Simulation'}
                    </button>
                    <button
                      onClick={simulateGeneration}
                      className={
                        `w-full py-3 px-4 rounded-xl font-semibold shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 mt-3 ` +
                        (darkMode
                          ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white border-none hover:brightness-110 hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-gray-200 to-gray-100 text-slate-700 border-none hover:brightness-105 hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-xl')
                      }
                    >
                      Next Generation
                    </button>
                    <button
                      onClick={initializePopulation}
                      className={
                        `w-full py-3 px-4 rounded-xl font-semibold shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 mt-3 mb-4 ` +
                        (darkMode
                          ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white border-none hover:brightness-110 hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-gray-200 to-gray-100 text-slate-700 border-none hover:brightness-105 hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-xl')
                      }
                    >
                      Reset Population
                    </button>
                  </div>
                  <br></br>
                </div>
              </div>
            </section>

            <section className={
              `hidden md:flex flex-1 flex-col items-center justify-center rounded-2xl shadow-2xl border transition-colors duration-500 backdrop-blur-md min-h-0 max-h-full overflow-auto ` +
              (darkMode
                ? 'bg-slate-900/80 border-slate-700'
                : 'bg-white/90 border-gray-200')
            }>
              <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6">
                <h2 className={
                  `text-lg font-semibold mb-4 flex items-center transition-colors duration-500 ` +
                  (darkMode ? 'text-slate-200' : 'text-slate-700')
                }>
                  <div className={darkMode ? 'w-2 h-2 bg-green-400 rounded-full mr-3' : 'w-2 h-2 bg-green-500 rounded-full mr-3'}></div>
                  Population Grid
                </h2>
                <div className="flex-1 w-full flex items-center justify-center">
                  <div
                    className={
                      `grid rounded-2xl border shadow-lg transition-colors duration-500 w-full h-full grow aspect-[2/1] min-h-[340px] sm:min-h-[400px] md:min-h-[480px] max-w-full sm:max-w-[95vw] md:max-w-[800px] overflow-visible ` +
                      (darkMode
                        ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-slate-700'
                        : 'bg-gradient-to-br from-white via-slate-100 to-white border-gray-200')
                    }
                    style={{
                      gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                      gap: '0.25rem',
                      padding: '1rem',
                    }}
                  >
                    {gridCells}
                  </div>
                </div>
                <div className={
                  'text-sm mt-4 transition-colors duration-500 ' +
                  (darkMode ? 'text-slate-400' : 'text-slate-500')
                }>
                  {organisms.length} organisms in {GRID_COLS}x{GRID_ROWS} grid
                </div>
              </div>
            </section>

            <div className="block md:hidden w-full px-2">
              <div
                className={
                  `grid rounded-2xl border shadow-lg transition-colors duration-500 w-full h-full grow aspect-[2/1] min-h-[340px] max-w-full overflow-visible ` +
                  (darkMode
                    ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-slate-700'
                    : 'bg-gradient-to-br from-white via-slate-100 to-white border-gray-200')
                }
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                  gap: '0.25rem',
                  padding: '1rem',
                }}
              >
                {gridCells}
              </div>
            </div>

            <section className={
              `flex flex-col flex-shrink-0 w-full sm:w-[90vw] md:w-[340px] rounded-2xl shadow-xl border transition-colors duration-500 backdrop-blur-md min-h-0 max-h-full overflow-auto ` +
              (darkMode
                ? 'bg-slate-800/70 border-slate-700'
                : 'bg-white/80 border-gray-200')
            }>
              <div className="p-6 sm:p-8 flex-1 flex flex-col min-h-0 pb-6">
                <h2 className={
                  `text-lg font-semibold mb-6 flex items-center transition-colors duration-500 ` +
                  (darkMode ? 'text-slate-200' : 'text-slate-700')
                }>
                  <div className={darkMode ? 'w-2 h-2 bg-purple-400 rounded-full mr-3' : 'w-2 h-2 bg-purple-500 rounded-full mr-3'}></div>
                  Statistics
                </h2>
                <div className="space-y-6 flex-1 min-h-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={
                      `rounded-lg p-4 transition-colors duration-500 ` +
                      (darkMode ? 'bg-slate-700/50' : 'bg-gray-100')
                    }>
                      <div className={darkMode ? 'text-2xl font-bold text-blue-400' : 'text-2xl font-bold text-blue-600'}>{stats.totalOrganisms}</div>
                      <div className={darkMode ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>Population</div>
                    </div>
                    <div className={
                      `rounded-lg p-4 transition-colors duration-500 ` +
                      (darkMode ? 'bg-slate-700/50' : 'bg-gray-100')
                    }>
                      <div className={darkMode ? 'text-2xl font-bold text-green-400' : 'text-2xl font-bold text-green-600'}>{stats.generation}</div>
                      <div className={darkMode ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>Generation</div>
                    </div>
                    <div className={
                      `rounded-lg p-4 transition-colors duration-500 ` +
                      (darkMode ? 'bg-slate-700/50' : 'bg-gray-100')
                    }>
                      <div className={darkMode ? 'text-2xl font-bold text-yellow-400' : 'text-2xl font-bold text-yellow-500'}>{Math.round(stats.averageFitness * 100)}%</div>
                      <div className={darkMode ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>Avg Fitness</div>
                    </div>
                    <div className={
                      `rounded-lg p-4 transition-colors duration-500 ` +
                      (darkMode ? 'bg-slate-700/50' : 'bg-gray-100')
                    }>
                      <div className={darkMode ? 'text-2xl font-bold text-purple-400' : 'text-2xl font-bold text-purple-500'}>{Math.round(stats.survivalRate * 100)}%</div>
                      <div className={darkMode ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>Survival Rate</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className={
                      'text-sm font-medium transition-colors duration-500 ' +
                      (darkMode ? 'text-slate-300' : 'text-slate-700')
                    }>Trait Averages</h3>
                    <div className="space-y-3">
                      {['speed', 'size', 'energy', 'reproduction'].map((trait) => (
                        <div key={trait}>
                          <div className={
                            'flex justify-between text-xs mb-1 transition-colors duration-500 ' +
                            (darkMode ? 'text-slate-400' : 'text-slate-500')
                          }>
                            <span className="capitalize">{trait}</span>
                            <span>{Math.round((stats.traitAverages as any)[trait] * 100)}%</span>
                          </div>
                          <div className={
                            'w-full rounded-full h-2 transition-colors duration-500 ' +
                            (darkMode ? 'bg-slate-700' : 'bg-gray-200')
                          }>
                            <div
                              className={
                                'h-2 rounded-full transition-all duration-300 ' +
                                (trait === 'speed'
                                  ? (darkMode ? 'bg-blue-400' : 'bg-blue-500')
                                  : trait === 'size'
                                  ? (darkMode ? 'bg-green-400' : 'bg-green-500')
                                  : trait === 'energy'
                                  ? (darkMode ? 'bg-yellow-400' : 'bg-yellow-500')
                                  : (darkMode ? 'bg-purple-400' : 'bg-purple-500'))
                              }
                              style={{ width: `${(stats.traitAverages as any)[trait] * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={
                    'rounded-lg p-4 transition-colors duration-500 mt-4' +
                    (darkMode ? ' bg-slate-700/30' : ' bg-gray-100')
                  }>
                    <h3 className={
                      'text-sm font-medium mb-3 transition-colors duration-500 ' +
                      (darkMode ? 'text-slate-300' : 'text-slate-700')
                    }>Environment</h3>
                    <div className={
                      'space-y-2 text-xs transition-colors duration-500 ' +
                      (darkMode ? 'text-slate-400' : 'text-slate-500')
                    }>
                      <div className="flex justify-between">
                        <span>Resource Level:</span>
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                          {parameters.resourceAvailability < 0.3 ? 'Scarce' : parameters.resourceAvailability < 0.7 ? 'Moderate' : 'Abundant'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mutation Rate:</span>
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                          {parameters.mutationRate < 0.1 ? 'Low' : parameters.mutationRate < 0.25 ? 'Medium' : 'High'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={isRunning ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-slate-400' : 'text-slate-500')}>
                          {isRunning ? 'Running' : 'Paused'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <br></br>
                </div>
              </div>
            </section>
          </div>
        </main>
        {tooltip.show && (
          <div
            className={
              'fixed z-50 px-3 py-2 rounded-lg shadow-lg pointer-events-none whitespace-pre-line transition-colors duration-500 ' +
              (darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 border border-gray-300')
            }
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: 'translateY(-100%)',
            }}
          >
            {tooltip.text}
          </div>
        )}
        <style>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ffffff, #f1f5f9);
            cursor: pointer;
            border: 2px solid #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease;
          }
          input[type='range']::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          }
          input[type='range']::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ffffff, #f1f5f9);
            cursor: pointer;
            border: 2px solid #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease;
          }
          input[type='range']::-moz-range-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.7); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </>
  )
}

export default App
