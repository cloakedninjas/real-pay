import './App.css'
import Calculator from './Calculator/Calculator.tsx';

function App() {
    return (
        <div className="app">
            <header className="">
                <div className="container">
                    Salary Eaten by Inflation
                </div>
            </header>
            <main className="container">
                <Calculator/>
            </main>
        </div>
    )
}

export default App
