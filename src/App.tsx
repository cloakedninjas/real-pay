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
        </div>
    )
}

export default App
