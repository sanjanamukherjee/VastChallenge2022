import './App.css';
import DataProvider from './Context';
import MainComponent from './components/Main';

function App() {
  return (
    <div className="App">
      <DataProvider>
          <MainComponent/>
      </DataProvider>
    </div>
  );
}

export default App;
