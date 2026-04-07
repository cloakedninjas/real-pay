import './App.css'
import Calculator from './Calculator/Calculator.tsx';

function App() {
    return (
        <div className="app">
            <header className="">
                <div className="container">
                    <h1>Real Pay</h1>
                    <p>See how inflation affects your salary over time</p>
                </div>
            </header>
            <main className="container">
                <Calculator/>
            </main>
            <footer className="footer">
                <div className="container">
                    Inflation data provided by <a href="https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG">The World Bank</a>
                </div>
            </footer>
        </div>
    )
}

export default App
